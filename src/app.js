import {entries, entryByWord, quickWords} from './education.js';
import {createSearchEngine, fold, makeQuestion, normalize, validateQuery} from './search.js';
import {NotebookStore} from './storage.js';
import {DefinitionStore, sourceUrl} from './definitions.js';

const $ = id => document.getElementById(id);
const base = new URL('./', document.baseURI);
const store = new NotebookStore();
const definitions = new DefinitionStore(base);
const fallbackSearch = createSearchEngine(null);
let saved = [];
let lastResult;
let requestId = 0;
let worker;
let dictionaryReady = false;
let dictionaryLimited = false;
let offlineReady = false;
let debounce;
let searchTimer;
let toastTimer;
let question;
let questionAnswered = false;
let score = 0;
let attempts = 0;
let questionHadMistake = false;
let practiceDeck = [];
let previousWord;
let activeTab = 'search';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function button(text, className, handler) {
  const node = el('button', className, text);
  node.type = 'button';
  node.addEventListener('click', handler);
  return node;
}
function toast(text) {
  clearTimeout(toastTimer);
  $('toast').textContent = text;
  $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3500);
}
function isSaved(word) { return saved.some(item => normalize(item.word) === normalize(word)); }
function note(message) { $('search-results').replaceChildren(el('p', 'message', message)); }

function updateConnection() {
  $('connection').textContent = navigator.onLine ? 'Con conexión' : offlineReady ? 'Sin conexión · listo' : 'Sin conexión';
  $('connection').classList.toggle('offline', !navigator.onLine);
}
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.panel').forEach(panel => { panel.hidden = panel.id !== `panel-${tab}`; });
  document.querySelectorAll('[data-tab]').forEach(item => {
    const active = item.dataset.tab === tab;
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  });
  if (tab === 'notebook') renderNotebook();
  if (tab === 'practice' && !question) nextQuestion();
  $('main').focus({preventScroll: true});
  window.scrollTo({top:0, behavior:'instant'});
}
document.querySelectorAll('[data-tab]').forEach(item => item.addEventListener('click', () => switchTab(item.dataset.tab)));
$('about-toggle').addEventListener('click', () => {
  const show = $('about').hidden;
  $('about').hidden = !show;
  $('about-toggle').setAttribute('aria-expanded', String(show));
  if (show) $('about').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
});

function speak(word) {
  if (!('speechSynthesis' in window)) { toast('Tu navegador no puede leer en voz alta.'); return; }
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'es';
  utterance.rate = .85;
  utterance.onerror = () => toast('No se pudo reproducir el audio. Podés leer la palabra en la pantalla.');
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

async function refreshSaved() {
  saved = await store.all();
  $('notebook-count').textContent = saved.length;
  renderNotebook();
}
async function toggleSaved(word, action) {
  if (action.disabled) return;
  action.disabled = true;
  const previousLabel = action.textContent;
  action.textContent = isSaved(word) ? 'Quitando…' : 'Guardando…';
  try {
    const added = await store.toggle(word);
    await refreshSaved();
    if (lastResult) renderResults(lastResult);
    if ($('practice-source').value === 'saved') { practiceDeck = []; question = null; if (activeTab === 'practice') nextQuestion(); }
    toast(added ? store.mode === 'memory' ? 'Guardada por esta sesión. El navegador no permite conservarla al cerrar.' : '¡Palabra guardada en tu cuaderno!' : 'Palabra quitada del cuaderno.');
  } catch (error) { toast(error.message || 'No se pudo guardar. Intentá de nuevo.'); }
  finally { action.disabled = false; action.textContent = previousLabel; }
}

function dictionaryDefinition(result) {
  const section = el('section', 'dictionary-definition');
  section.setAttribute('aria-label', `Significado de ${result.word} en el diccionario`);
  function render(data) {
    section.replaceChildren(el('h4', 'definition-heading', 'Significado en el diccionario'));
    section.removeAttribute('aria-busy');
    if (data.status !== 'found') {
      section.append(el('p', 'definition-status', data.status === 'unavailable' ? 'No se pudo cargar el significado. Podés volver a intentarlo.' : 'No encontramos una definición para esta palabra. Podés consultar con tu docente.'));
      if (data.status === 'unavailable') section.append(button('Volver a cargar el significado', 'secondary', load));
      return;
    }
    if (data.formOf.length) section.append(el('p', 'definition-form', `Es una forma de ${data.formOf.map(word => `«${word}»`).join(' o ')}. Estos son sus significados:`));
    const list = (senses,start = 1) => {
      const items = el('ol', 'definition-senses');
      items.start = start;
      for (const sense of senses) {
        const item = el('li');
        item.append(el('span', 'definition-pos', sense.pos),el('span', '', sense.text));
        items.append(item);
      }
      return items;
    };
    section.append(list(data.senses.slice(0,2)));
    if (data.senses.length > 2) {
      const more = el('details', 'definition-more');
      more.append(el('summary', '', 'Otros significados'),list(data.senses.slice(2),3));
      section.append(more);
    }
    const credits = el('p', 'definition-source');
    credits.append(document.createTextNode('Fuente: '));
    data.sources.forEach((word,index) => {
      if (index) credits.append(document.createTextNode(' · '));
      const link = el('a', '', `Wikcionario: ${word} ↗`);
      link.href = sourceUrl(word);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      credits.append(link);
    });
    credits.append(document.createTextNode(' · '));
    const license = el('a', '', 'CC BY-SA 4.0');
    license.href = new URL('./licenses/CC-BY-SA-4.0.txt',base);
    license.target = '_blank';
    license.rel = 'noopener noreferrer';
    credits.append(license);
    section.append(credits);
  }
  async function load() {
    section.replaceChildren(el('h4', 'definition-heading', 'Significado en el diccionario'),el('p', 'definition-status', 'Buscando el significado…'));
    section.setAttribute('aria-busy', 'true');
    const data = await definitions.lookup(result.word);
    // La respuesta pertenece a esta tarjeta; una consulta nueva no la reutiliza.
    if (data.status !== 'unavailable') result.definition = data;
    if (section.isConnected) render(data);
  }
  if (result.definition) render(result.definition); else load();
  return section;
}

function wordCard(result) {
  const card = el('article', 'word-card');
  const top = el('div', 'word-top');
  const word = el('div');
  word.append(el('h3', 'word-title', result.word), el('span', 'word-label', result.meaning ? 'PALABRA + EXPLICACIÓN' : 'DICCIONARIO ESPAÑOL'));
  top.append(word);
  if ('speechSynthesis' in window) {
    const audio = button('♪', 'icon-button', () => speak(result.word));
    audio.setAttribute('aria-label', `Escuchar ${result.word}`);
    top.append(audio);
  }
  card.append(top);
  card.append(dictionaryDefinition(result));
  if (result.meaning) {
    card.append(el('h4','simple-heading','En palabras sencillas'),el('p','meaning',result.meaning), el('p','example',`«${result.example}»`));
    const tip = el('div', 'tip');
    tip.append(el('strong', '', 'Una ayuda para recordarlo'), el('span', '', result.tip));
    card.append(tip);
  }
  const actions = el('div', 'card-actions');
  const action = button(isSaved(result.word) ? '★ Guardada · quitar' : '☆ Guardar en mi cuaderno', `secondary ${isSaved(result.word) ? 'saved' : ''}`, () => toggleSaved(result.word, action));
  action.setAttribute('aria-label', `${isSaved(result.word) ? 'Quitar' : 'Guardar'} ${result.word} ${isSaved(result.word) ? 'del' : 'en el'} cuaderno`);
  actions.append(action);
  card.append(actions);
  return card;
}

function renderResults(data) {
  lastResult = data;
  const container = $('search-results');
  container.replaceChildren();
  if (data.error) { note(data.error); return; }
  if (data.limited) {
    container.append(el('p', 'message warning', dictionaryLimited ? 'El diccionario amplio no se pudo cargar. Podés consultar las fichas de primaria; conectate y recargá para buscar más palabras.' : 'El diccionario amplio todavía se está preparando. Mientras tanto, podés consultar las fichas de primaria.'));
  }
  if (!data.results.length) {
    const empty = el('div','empty-state');
    empty.append(el('div','empty-symbol','⌕'), el('h2','', 'Todavía no la encontramos'), el('p','', 'Probá otra forma de escribirla o consultá con tu docente. Que no aparezca no significa que esté mal escrita.'));
    container.append(empty);
    return;
  }
  const multiple = data.results.length > 1;
  const heading = data.correct ? multiple ? 'Tu palabra existe. Mirá también estas opciones.' : '¡Esta palabra está bien escrita!' : multiple ? 'Estas palabras podrían ayudarte' : '¿Querías escribir esta palabra?';
  container.append(el('h2','result-heading',heading));
  container.append(el('p','result-description', multiple ? 'Leé los significados y los ejemplos. La oración te ayuda a elegir.' : data.correct ? 'Recordá que la escritura correcta también depende de lo que querés decir.' : `Buscaste «${data.query}». Mirá su escritura y comprobá si es la que buscabas.`));
  const grid = el('div',`results-grid ${multiple ? '' : 'single'}`);
  data.results.forEach(result => grid.append(wordCard(result)));
  container.append(grid);
}

function clearSearch() {
  clearTimeout(debounce);
  clearTimeout(searchTimer);
  requestId++;
  lastResult = null;
  $('search-input').value = '';
  $('clear-search').hidden = true;
  $('search-results').replaceChildren();
  $('welcome').hidden = false;
  $('search-results').removeAttribute('aria-busy');
}

function search(raw = $('search-input').value) {
  clearTimeout(debounce);
  clearTimeout(searchTimer);
  const id = ++requestId;
  const {query, error} = validateQuery(raw);
  $('clear-search').hidden = !raw;
  if (!query) { clearSearch(); return; }
  $('welcome').hidden = true;
  if (error) { lastResult = null; note(error); return; }
  if (!dictionaryReady || !worker) { renderResults(fallbackSearch(query)); return; }
  $('search-results').setAttribute('aria-busy','true');
  note('Buscando tu palabra…');
  worker.postMessage({type:'search',query,id});
  searchTimer = setTimeout(() => {
    if (id === requestId) {
      $('search-results').removeAttribute('aria-busy');
      renderResults(fallbackSearch(query));
    }
  }, 12000);
}
$('search-form').addEventListener('submit', event => { event.preventDefault(); search(); });
$('search-input').addEventListener('input', event => {
  requestId++; // Invalida respuestas anteriores incluso antes del próximo debounce.
  clearTimeout(debounce);
  clearTimeout(searchTimer);
  $('search-results').removeAttribute('aria-busy');
  $('clear-search').hidden = !event.target.value;
  if (!event.target.value.trim()) { clearSearch(); return; }
  debounce = setTimeout(search, 320);
});
$('clear-search').addEventListener('click', () => { clearSearch(); $('search-input').focus(); });
for (const word of quickWords) $('quick-words').append(button(word,'chip', () => { $('search-input').value = word; search(word); }));

function setupDictionary() {
  const failed = () => {
    dictionaryLimited = true;
    dictionaryReady = false;
    $('dictionary-status').textContent = 'Fichas de primaria disponibles';
    worker?.terminate();
    worker = null;
    if ($('search-input').value.trim()) search();
  };
  try {
    worker = new Worker(new URL('./assets/worker.js', base));
    const loadTimer = setTimeout(failed, 35000);
    worker.addEventListener('error', () => { clearTimeout(loadTimer); failed(); });
    worker.addEventListener('message', ({data}) => {
      if (data.type === 'ready' || data.type === 'unavailable') {
        clearTimeout(loadTimer);
        if (data.type === 'unavailable') { failed(); return; }
        dictionaryReady = true;
        dictionaryLimited = false;
        $('dictionary-status').textContent = `${data.count.toLocaleString('es')} entradas · en tu dispositivo`;
        $('word-count').textContent = `${data.count.toLocaleString('es')} entradas base`;
        if ($('search-input').value.trim()) search();
      }
      if (data.type === 'result' && data.id === requestId) {
        clearTimeout(searchTimer);
        $('search-results').removeAttribute('aria-busy');
        renderResults(data);
      }
    });
  } catch { failed(); }
}
setupDictionary();

function renderNotebook() {
  const container = $('notebook-list');
  container.replaceChildren();
  const filter = fold($('notebook-filter').value);
  const items = [...saved].sort((a,b) => b.savedAt - a.savedAt).filter(item => fold(item.word).includes(filter));
  if (!items.length) {
    const empty = el('div','empty-state');
    empty.append(el('div','empty-symbol','☆'), el('h2','', saved.length ? 'No hay coincidencias' : 'Tu primera palabra te está esperando'), el('p','', saved.length ? 'Probá otra búsqueda dentro del cuaderno.' : 'Consultá una palabra y tocá «Guardar en mi cuaderno».'));
    if (!saved.length) empty.append(button('Consultar una palabra →','secondary', () => {switchTab('search');$('search-input').focus();}));
    container.append(empty);
    return;
  }
  const grid = el('div','notebook-grid');
  for (const item of items) {
    const card = el('article','word-card notebook-card');
    card.append(el('h2','word-title',item.word));
    const entry = entryByWord.get(normalize(item.word));
    if (entry) card.append(el('p','meaning',entry.meaning));
    const actions = el('div','card-actions');
    actions.append(button('Volver a consultar','secondary', () => {switchTab('search');$('search-input').value = item.word;search(item.word);}));
    const remove = button('Quitar','secondary', () => toggleSaved(item.word,remove));
    remove.setAttribute('aria-label',`Quitar ${item.word} del cuaderno`);
    actions.append(remove);
    card.append(actions);
    grid.append(card);
  }
  container.append(grid);
}
$('notebook-filter').addEventListener('input',renderNotebook);
store.ready.then(async () => {
  try { await refreshSaved(); }
  catch { $('storage-warning').hidden = false; $('storage-warning').textContent = 'No se pudo abrir tu cuaderno. Recargá o probá otro navegador. Tus datos anteriores no se borraron.'; }
  if (store.mode === 'memory') { $('storage-warning').hidden = false; $('storage-warning').textContent = 'Este navegador no permite guardar de forma permanente. Tu cuaderno durará solo esta sesión.'; }
  if (store.migrationPending) { $('storage-warning').hidden = false; $('storage-warning').textContent = 'No se pudo recuperar el cuaderno de la versión anterior. Sus datos siguen guardados. Cerrá las otras pestañas y recargá para intentarlo de nuevo.'; }
});

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [result[i],result[j]] = [result[j],result[i]]; }
  return result;
}
function resetPractice() {
  score = attempts = 0;
  question = null;
  practiceDeck = [];
  previousWord = undefined;
  $('practice-progress').textContent = '0 aciertos de 0 intentos';
  nextQuestion();
}
function nextQuestion() {
  const pool = $('practice-source').value === 'saved' ? saved.map(item => item.word) : entries.map(item => item.word);
  const available = pool.map(makeQuestion).filter(Boolean);
  const container = $('practice-question');
  container.replaceChildren();
  if (!available.length) {
    const empty = el('div','empty-state');
    empty.append(el('div','empty-symbol','✦'),el('h2','', 'Primero, guardá alguna palabra'),el('p','', 'Tu cuaderno está vacío. Podés consultar y guardar palabras, o practicar con las fichas de primaria.'));
    empty.append(button('Practicar palabras de primaria','secondary', () => { $('practice-source').value = 'all'; resetPractice(); }));
    container.append(empty);
    return;
  }
  if (!practiceDeck.length) {
    practiceDeck = shuffle(available);
    if (practiceDeck.length > 1 && practiceDeck[practiceDeck.length-1].word === previousWord) [practiceDeck[0],practiceDeck[practiceDeck.length-1]] = [practiceDeck[practiceDeck.length-1],practiceDeck[0]];
  }
  question = practiceDeck.pop();
  previousWord = question.word;
  questionAnswered = questionHadMistake = false;
  const card = el('article','question');
  card.append(el('span','eyebrow',question.kind === 'memory' ? 'RECORDÁ SUS LETRAS' : 'COMPLETÁ LA FRASE'),el('h2','',question.prompt));
  const choices = el('div','answer-options');
  for (const option of shuffle(question.options)) {
    const answer = button(option,'answer-option', () => answerQuestion(option,answer));
    choices.append(answer);
  }
  const feedback = el('p','practice-feedback');
  feedback.id = 'practice-feedback';
  feedback.setAttribute('role','status');
  card.append(choices,feedback);
  const next = button('Otra palabra →','primary',nextQuestion);
  next.id = 'next-question'; next.hidden = true;
  card.append(next);
  container.append(card);
}
function answerQuestion(option,answer) {
  if (questionAnswered || answer.disabled) return;
  const right = normalize(option) === normalize(question.answer);
  const feedback = $('practice-feedback');
  if (!right) {
    if (!questionHadMistake) attempts++;
    questionHadMistake = true;
    answer.classList.add('wrong');
    answer.disabled = true;
    feedback.textContent = `Probá otra vez. Pista: ${question.tip}`;
  } else {
    if (!questionHadMistake) { attempts++; score++; }
    questionAnswered = true;
    answer.classList.add('right');
    document.querySelectorAll('.answer-option').forEach(item => { item.disabled = true; });
    feedback.textContent = `¡Lo descubriste! ${question.tip}`;
    $('next-question').hidden = false;
    $('next-question').focus({preventScroll:true});
  }
  $('practice-progress').textContent = `${score} ${score === 1 ? 'acierto' : 'aciertos'} de ${attempts} ${attempts === 1 ? 'intento' : 'intentos'}`;
}
$('practice-source').addEventListener('change',resetPractice);
$('practice-saved').addEventListener('click', () => { $('practice-source').value = 'saved'; resetPractice(); switchTab('practice'); });

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (Recognition) {
  const recognition = new Recognition();
  recognition.lang = 'es-AR';
  recognition.continuous = false;
  recognition.interimResults = false;
  let listening = false;
  let voiceTimer;
  const message = text => { $('voice-status').hidden = false; $('voice-status').textContent = text; };
  recognition.onstart = () => { listening = true; $('voice').setAttribute('aria-pressed','true'); message('Te escucho. Decí una palabra.'); voiceTimer = setTimeout(() => recognition.stop(),12000); };
  recognition.onend = () => { listening = false; clearTimeout(voiceTimer); $('voice').setAttribute('aria-pressed','false'); };
  recognition.onresult = event => {
    const text = event.results[0][0].transcript.trim().replace(/[.,!?¿¡;:]+$/g,'');
    $('search-input').value = text;
    message(`Escuché «${text}». Si no era eso, corregila con el teclado.`);
    search(text);
  };
  recognition.onerror = event => message(event.error === 'not-allowed' ? 'No se habilitó el micrófono. Podés escribir la palabra.' : event.error === 'no-speech' ? 'No escuché una palabra. Podés intentar otra vez o escribirla.' : 'El dictado no está disponible ahora. Puede necesitar conexión; usá el teclado.');
  $('voice').addEventListener('click', () => {
    if (listening) { recognition.stop(); return; }
    message('El navegador puede pedir permiso para el micrófono. El dictado puede usar el servicio de voz de su proveedor.');
    try { recognition.start(); } catch { message('Esperá un momento antes de volver a dictar.'); }
  });
} else {
  $('voice').hidden = true;
  $('input-hint').textContent = 'Consultá escribiendo. Este navegador no ofrece dictado.';
}

if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register(new URL('./sw.js',base), {scope:base.pathname}).then(async registration => {
    await navigator.serviceWorker.ready;
    offlineReady = true;
    $('offline-info').textContent = 'La app, el diccionario y las definiciones ya están descargados para usar sin conexión en este navegador. El dictado y algunas voces pueden necesitar internet. Si borrás los datos del navegador, necesitás descargarlos de nuevo.';
    updateConnection();
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      installing?.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) toast('Hay una versión nueva. Cerrá las pestañas de CLIC300 y volvé a abrirla para actualizar.');
      });
    });
  }).catch(() => { $('offline-info').textContent = 'No se pudo preparar el uso sin conexión. Conectate y recargá para volver a intentarlo.'; });
} else {
  $('offline-info').textContent = 'Para descargar la app y usarla sin conexión, abrila en HTTPS o en localhost.';
}

import {test,expect} from '@playwright/test';
import {definitionFile} from '../../src/definitions.js';

async function open(page,path='/') {
  await page.goto(path);
  await expect(page.locator('#dictionary-status')).toContainText('57.344');
}
async function lookup(page,word) {
  await page.locator('#search-input').fill(word);
  await page.getByRole('button',{name:'Descubrir'}).click();
  await expect(page.locator('#search-results .word-title').first()).toBeVisible();
  await expect(page.locator('#search-results')).not.toContainText('Buscando tu palabra');
}

test('Consultas, palabras cortas, borrar, Unicode y entradas inseguras',async ({page}) => {
  const errors=[];
  page.on('pageerror',error => errors.push(error.message));
  await open(page);
  await expect(page).toHaveTitle(/Click300/);
  await page.locator('#search-input').fill('a');
  await expect(page.locator('#search-results .word-title')).toHaveText('a');
  await lookup(page,'estava');
  await expect(page.locator('.word-title')).toHaveText('estaba');
  await page.getByRole('button',{name:'Borrar búsqueda'}).click();
  await expect(page.locator('#welcome')).toBeVisible();
  await expect(page.locator('#search-results')).toBeEmpty();
  await lookup(page,'tubo');
  await expect(page.locator('.word-title')).toHaveText(['tubo','tuvo']);
  await lookup(page,'si');
  await expect(page.locator('.word-title')).toHaveText(['si','sí']);
  await lookup(page,'biologia');
  await expect(page.locator('.word-title')).toContainText(['biología']);
  await lookup(page,'año');
  await expect(page.locator('.word-title')).toHaveText('año');
  await page.locator('#search-input').fill('<img src=x onerror=alert(1)>');
  await page.getByRole('button',{name:'Descubrir'}).click();
  await expect(page.locator('#search-results')).toContainText('sin números ni signos');
  await expect(page.locator('#search-results img')).toHaveCount(0);
  await page.locator('#search-input').fill('qzxqzxqzx');
  await page.getByRole('button',{name:'Descubrir'}).click();
  await expect(page.locator('#search-results')).toContainText('Todavía no la encontramos');
  expect(errors).toEqual([]);
});

test('El cuaderno persiste al recargar, se filtra y permite quitar palabras',async ({page}) => {
  await open(page);
  await lookup(page,'arbol');
  await page.getByRole('button',{name:'Guardar árbol en el cuaderno'}).click();
  await expect(page.locator('#notebook-count')).toHaveText('1');
  await page.reload();
  await expect(page.locator('#notebook-count')).toHaveText('1');
  await page.getByRole('button',{name:/Mi cuaderno/}).click();
  await expect(page.locator('#notebook-list .word-title')).toHaveText('árbol');
  await page.locator('#notebook-filter').fill('arbol');
  await expect(page.locator('#notebook-list .word-title')).toHaveText('árbol');
  await page.locator('#notebook-filter').fill('tubo');
  await expect(page.locator('#notebook-list')).toContainText('No hay coincidencias');
  await page.locator('#notebook-filter').fill('');
  await page.getByRole('button',{name:'Quitar árbol del cuaderno'}).click();
  await expect(page.locator('#notebook-count')).toHaveText('0');
  await expect(page.locator('#notebook-list')).toContainText('Tu primera palabra');
});

test('Los desafíos usan el contexto y cuentan solo la primera respuesta',async ({page}) => {
  await open(page);
  await lookup(page,'estava');
  await page.getByRole('button',{name:'Guardar estaba en el cuaderno'}).click();
  await page.getByRole('button',{name:/Mi cuaderno/}).click();
  await page.getByRole('button',{name:'Repasar mis palabras'}).click();
  await expect(page.locator('.question h2')).toContainText('Mi perro _____ dormido.');
  await page.getByRole('button',{name:'estava',exact:true}).click();
  await expect(page.locator('#practice-feedback')).toContainText('Probá otra vez');
  await expect(page.locator('#practice-progress')).toHaveText('0 aciertos de 1 intento');
  await page.getByRole('button',{name:'estaba',exact:true}).click();
  await expect(page.locator('#practice-feedback')).toContainText('¡Lo descubriste!');
  await expect(page.locator('#practice-progress')).toHaveText('0 aciertos de 1 intento');
  await page.getByRole('button',{name:'Otra palabra'}).click();
  await page.getByRole('button',{name:'estaba',exact:true}).click();
  await expect(page.locator('#practice-progress')).toHaveText('1 acierto de 2 intentos');
  await page.locator('#practice-source').selectOption('all');
  await expect(page.locator('#practice-progress')).toHaveText('0 aciertos de 0 intentos');
});

test('Las palabras del diccionario general también se pueden repasar',async ({page}) => {
  await open(page);
  await lookup(page,'electroencefalograma');
  await page.getByRole('button',{name:'Guardar electroencefalograma en el cuaderno'}).click();
  await page.getByRole('button',{name:/Mi cuaderno/}).click();
  await page.getByRole('button',{name:'Repasar mis palabras'}).click();
  await expect(page.locator('.question h2')).toContainText('Recordá tu palabra');
  await expect(page.locator('.answer-option')).toHaveCount(4);
});

test('Una búsqueda antigua no reemplaza el texto nuevo ni reaparece al borrar',async ({page}) => {
  await open(page);
  await page.locator('#search-input').fill('elefate');
  await page.getByRole('button',{name:'Descubrir'}).click();
  await page.locator('#search-input').fill('tubo');
  await expect(page.locator('.word-title')).toHaveText(['tubo','tuvo']);
  await page.locator('#search-input').fill('');
  await expect(page.locator('#welcome')).toBeVisible();
  await expect(page.locator('#search-results')).toBeEmpty();
});

test('Sin diccionario descargado conserva fichas y explica el límite',async ({browser}) => {
  const context = await browser.newContext({serviceWorkers:'block'});
  const page = await context.newPage();
  await page.route('**/data/es.dic',route => route.fulfill({status:503,body:'No disponible'}));
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#dictionary-status')).toContainText('Fichas de primaria');
  await lookup(page,'estava');
  await expect(page.locator('.word-title')).toHaveText('estaba');
  await expect(page.locator('#search-results')).toContainText('no se pudo cargar');
  await context.close();
});

test('Si IndexedDB falla usa almacenamiento alternativo y conserva el cuaderno',async ({page}) => {
  await page.addInitScript(() => Object.defineProperty(window,'indexedDB',{value:undefined}));
  await open(page);
  await lookup(page,'estava');
  await page.getByRole('button',{name:'Guardar estaba en el cuaderno'}).click();
  await page.reload();
  await expect(page.locator('#notebook-count')).toHaveText('1');
});

test('Sin almacenamiento permanente avisa y permite consultar',async ({page}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window,'indexedDB',{value:undefined});
    Object.defineProperty(window,'localStorage',{get:() => {throw new Error('Deshabilitado');}});
  });
  await open(page);
  await expect(page.locator('#storage-warning')).toContainText('solo esta sesión');
  await lookup(page,'estava');
  await page.getByRole('button',{name:'Guardar estaba en el cuaderno'}).click();
  await expect(page.locator('#notebook-count')).toHaveText('1');
});

test('Micrófono denegado muestra una alternativa sin romper la consulta',async ({page}) => {
  await page.addInitScript(() => {
    window.SpeechRecognition = class { start(){this.onerror?.({error:'not-allowed'});this.onend?.();} stop(){this.onend?.();} };
  });
  await open(page);
  await page.getByRole('button',{name:'Dictar una palabra'}).click();
  await expect(page.locator('#voice-status')).toContainText('No se habilitó el micrófono');
  await lookup(page,'estava');
  await expect(page.locator('.word-title')).toHaveText('estaba');
});

for (const path of ['/','/Click300/']) test(`App y diccionario funcionan sin conexión en ${path}`,async ({page,context}) => {
  await open(page,path);
  await page.evaluate(async () => {await navigator.serviceWorker.ready;});
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await lookup(page,'arbol');
  await page.getByRole('button',{name:'Guardar árbol en el cuaderno'}).click();
  // Recargar solo después de que finalice la transacción persistente.
  await expect(page.locator('#notebook-count')).toHaveText('1');
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#dictionary-status')).toContainText('57.344');
  await expect(page.locator('#connection')).toContainText('Sin conexión');
  await lookup(page,'biologia');
  await expect(page.locator('#search-results .word-title')).toHaveText('biología');
  await expect(page.locator('#search-results .dictionary-definition')).toContainText('seres vivos');
  await expect(page.locator('#search-results .dictionary-definition a').first()).toHaveAttribute('href','https://es.wiktionary.org/wiki/biolog%C3%ADa#Español');
  await expect(page.locator('#notebook-count')).toHaveText('1');
  await page.getByRole('button',{name:/Mi cuaderno/}).click();
  await expect(page.locator('#notebook-list .word-title')).toHaveText('árbol');
  await page.goto(new URL('THIRD_PARTY_NOTICES.md',page.url()).href);
  await expect(page.locator('body')).toContainText('Créditos y licencias de Click300');
  await expect(page.locator('#search-input')).toHaveCount(0);
});

test('La definición sigue a la palabra correcta, conserva las ayudas y explica las formas verbales',async ({page}) => {
  await open(page);
  await lookup(page,'estava');
  const definition = page.locator('#search-results .dictionary-definition');
  await expect(definition).toContainText('«estar»');
  await expect(definition).toContainText('Existir');
  await expect(page.locator('#search-results .simple-heading')).toHaveText('En palabras sencillas');
  expect(await definition.evaluate(node => node.previousElementSibling.className)).toBe('word-top');
  await page.getByRole('button',{name:'Guardar estaba en el cuaderno'}).click();
  await expect(page.locator('#notebook-count')).toHaveText('1');
  await expect(definition).toContainText('Existir');
  await lookup(page,'tubo');
  const cards = page.locator('#search-results .word-card');
  await expect(cards.nth(0).locator('.dictionary-definition')).toContainText('cilíndrica');
  await expect(cards.nth(1).locator('.dictionary-definition')).toContainText('Poseer');
  await expect(cards.nth(1).locator('.definition-form')).toHaveText('Es una forma de «tener». Estos son sus significados:');
  await cards.nth(1).getByText('Otros significados',{exact:true}).click();
  await expect(cards.nth(1).locator('details')).toHaveAttribute('open','');
  await lookup(page,'biologia');
  await expect(definition).toContainText('seres vivos');
  await expect(page.locator('#toast')).toBeHidden();
  await page.screenshot({path:'test-results/definitions-desktop.png',fullPage:true});
  await page.setViewportSize({width:375,height:812});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/definitions-mobile.png',fullPage:true});
});

test('Si falla el significado se reintenta sin afectar la corrección ni el cuaderno',async ({browser}) => {
  const context = await browser.newContext({serviceWorkers:'block'});
  const page = await context.newPage();
  let fail = true;
  await page.route(`**/data/definitions/${definitionFile('biología')}`,route => fail ? route.fulfill({status:503,body:'No disponible'}) : route.continue());
  await open(page);
  await lookup(page,'biologia');
  await expect(page.locator('.dictionary-definition')).toContainText('No se pudo cargar');
  await expect(page.locator('.word-title')).toHaveText('biología');
  await page.getByRole('button',{name:'Guardar biología en el cuaderno'}).click();
  await expect(page.locator('#notebook-count')).toHaveText('1');
  fail = false;
  await page.getByRole('button',{name:'Volver a cargar el significado'}).click();
  await expect(page.locator('.dictionary-definition')).toContainText('seres vivos');
  await context.close();
});

test('Un significado demorado no reaparece después de borrar la consulta',async ({browser}) => {
  const context = await browser.newContext({serviceWorkers:'block'});
  const page = await context.newPage();
  let release;
  const gate = new Promise(resolve => {release = resolve;});
  await page.route(`**/data/definitions/${definitionFile('biología')}`,async route => {await gate;await route.continue();});
  await open(page);
  await lookup(page,'biologia');
  await expect(page.locator('.dictionary-definition')).toContainText('Buscando el significado');
  await page.getByRole('button',{name:'Borrar búsqueda'}).click();
  const response = page.waitForResponse(url => url.url().endsWith(definitionFile('biología')));
  release();
  await response;
  await expect(page.locator('#search-results')).toBeEmpty();
  await lookup(page,'biologia');
  await expect(page.locator('.dictionary-definition')).toContainText('seres vivos');
  await context.close();
});

test('Diseño de escritorio y celular, navegación y ausencia de desbordamiento',async ({page}) => {
  await open(page);
  await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});
  await page.setViewportSize({width:375,height:812});
  await expect(page.locator('#search-input')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
  await lookup(page,'hay');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Practicar',exact:true}).click();
  await expect(page.locator('#panel-practice')).toBeVisible();
  await page.getByRole('button',{name:/Mi cuaderno/}).click();
  await expect(page.locator('#panel-notebook')).toBeVisible();
  await page.screenshot({path:'test-results/notebook-mobile.png',fullPage:true});
});

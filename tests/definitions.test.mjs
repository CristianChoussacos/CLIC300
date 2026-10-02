import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {DefinitionStore,definitionFile,sourceUrl} from '../src/definitions.js';

const store = new DefinitionStore(null, async file => JSON.parse(await readFile(`data/definitions/${file}`,'utf8')));

test('Encuentra definiciones en español para vocabulario general y conserva la fuente', async () => {
  const biology = await store.lookup('biología');
  assert.equal(biology.status,'found');
  assert.match(biology.senses[0].text,/seres vivos/);
  assert.deepEqual(biology.sources,['biología']);
  assert.equal((await store.lookup('BIOLOGÍA')).senses[0].text,biology.senses[0].text);
  assert.equal((await store.lookup('biología')).senses[0].text,biology.senses[0].text);
  assert.match((await store.lookup('bicicleta')).senses[0].text,/pedales/);
  assert.match((await store.lookup('electroencefalograma')).senses[0].text,/cerebr/);
});

test('Conjugaciones y plurales remiten a su lema; tubo y tuvo siguen separados', async () => {
  const tube = await store.lookup('tubo');
  const had = await store.lookup('tuvo');
  assert.match(tube.senses[0].text,/cilíndrica/);
  assert.deepEqual(had.formOf,['tener']);
  assert.match(had.senses[0].text,/Poseer/);
  assert.deepEqual(had.sources,['tuvo','tener']);
  assert.deepEqual((await store.lookup('mariposas')).formOf,['mariposa']);
  assert.ok((await store.lookup('escribimos')).formOf.includes('escribir'));
});

test('Las definiciones distinguen tildes y ñ, y explican una ausencia sin inventar', async () => {
  const yes = await store.lookup('sí');
  const conditional = await store.lookup('si');
  assert.match(yes.senses[0].text,/afirmación/);
  assert.notEqual(yes.senses[0].text,conditional.senses[0].text);
  assert.match((await store.lookup('año')).senses[0].text,/Tierra/);
  assert.notEqual((await store.lookup('ano')).senses[0].text,(await store.lookup('año')).senses[0].text);
  assert.equal((await store.lookup('qzxqzx')).status,'missing');
  assert.equal((await store.lookup('')).status,'missing');
  assert.equal(sourceUrl('por qué'),'https://es.wiktionary.org/wiki/por%20qu%C3%A9#Español');
});

test('Una descarga fallida puede reintentarse y las referencias circulares no bloquean', async () => {
  let failed = true;
  const retry = new DefinitionStore(null,async () => {
    if (failed) {failed = false;throw new Error('Sin conexión');}
    return {hola:{d:[['Interjección','Saludo.']]}};
  });
  assert.equal((await retry.lookup('hola')).status,'unavailable');
  assert.equal((await retry.lookup('hola')).status,'found');
  const cycle = new DefinitionStore(null,async () => ({uno:{f:['dos']},dos:{f:['uno']}}));
  assert.equal((await cycle.lookup('uno')).status,'missing');
});

test('La copia distribuida está completa, verificable y asigna cada entrada al archivo correcto', async () => {
  const metadata = JSON.parse(await readFile('data/definitions/metadata.json','utf8'));
  let direct = 0, forms = 0, senses = 0, bytes = 0;
  assert.equal(metadata.license,'CC-BY-SA-4.0');
  assert.equal(metadata.files.length,64);
  for (const file of metadata.files) {
    const content = await readFile(`data/definitions/${file.name}`);
    assert.equal(content.length,file.bytes,file.name);
    assert.equal(createHash('sha256').update(content).digest('hex'),file.sha256,file.name);
    bytes += content.length;
    for (const [word,row] of Object.entries(JSON.parse(content))) {
      assert.equal(definitionFile(word),file.name,word);
      if (row.d) {direct++;senses += row.d.length;}
      else {forms++;assert.ok(row.f.length > 0,word);}
    }
  }
  assert.equal(direct,metadata.directEntries);
  assert.equal(forms,metadata.linkedForms);
  assert.equal(senses,metadata.senses);
  assert.equal(bytes,metadata.totalBytes);
});

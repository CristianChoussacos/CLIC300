import test from 'node:test';
import assert from 'node:assert/strict';
import nspell from 'nspell';
import es from 'dictionary-es';
import {entries} from '../src/education.js';
import {createSearchEngine, fold, phonetic, validateQuery, makeQuestion} from '../src/search.js';
import {sanitizeWords} from '../src/storage.js';

const spell = nspell(es);
const search = createSearchEngine(spell,es.dic.toString());

test('El diccionario amplio reconoce vocabulario, plurales y conjugaciones', () => {
  assert.equal(Number(es.dic.toString().split('\n')[0]),57344);
  for (const word of ['elefante','bicicleta','mariposas','escribimos','jugábamos','cuadernos','hipopótamo','electroencefalograma','y','a','ñandú']) {
    assert.equal(search(word).correct,true,word);
    assert.ok(search(word).results.some(result => result.word === word),word);
  }
});
test('Prioriza las correcciones educativas y encuentra otras del diccionario', () => {
  for (const [query,expected] of [['estava','estaba'],['arbol','árbol'],['jente','gente'],['pinguino','pingüino'],['biologia','biología'],['elefate','elefante']]) {
    const result = search(query);
    assert.equal(result.correct,false,query);
    assert.ok(result.results.some(entry => entry.word === expected),JSON.stringify(result));
  }
  assert.deepEqual(search('estava').results.map(e => e.word),['estaba']);
});
test('Las palabras homófonas válidas se distinguen por significado', () => {
  for (const [query,expected] of [['tubo',['tubo','tuvo']],['asia',['Asia','hacia']],['hay',['hay','ahí','ay']],['si',['si','sí']],['tu',['tu','tú']],['a ver',['a ver','haber']]]) {
    const result = search(query);
    assert.equal(result.correct,true);
    assert.deepEqual(new Set(result.results.map(e => e.word)),new Set(expected));
    result.results.forEach(e => assert.ok(e.meaning));
  }
});
test('No mezcla ñ/n ni convierte ch en c', () => {
  assert.notEqual(fold('año'),fold('ano'));
  assert.notEqual(phonetic('año'),phonetic('ano'));
  assert.notEqual(phonetic('chico'),phonetic('cico'));
  assert.equal(search('año').results[0].word,'año');
  assert.equal(search('ano').results[0].word,'ano');
});
test('Acepta palabras cortas, normaliza Unicode y rechaza entradas inválidas', () => {
  assert.ok(search('si').results.length);
  assert.equal(search('A\u0301RBOL').results[0].word,'árbol');
  assert.deepEqual(search('').results,[]);
  for (const word of ['<img src=x onerror=alert(1)>','a'.repeat(41),'123','mi perro corre','una frase']) {
    assert.ok(validateQuery(word).error,word);
    assert.deepEqual(search(word).results,[]);
  }
  assert.deepEqual(search('qzxqzxqzx').results,[]);
});
test('El modo reducido es explícito y conserva las fichas', () => {
  const limited = createSearchEngine(null);
  assert.equal(limited('estava').limited,true);
  assert.equal(limited('estava').results[0].word,'estaba');
  assert.equal(limited('electroencefalograma').correct,false);
});
test('Todas las fichas de primaria tienen ejercicios coherentes', () => {
  const words = entries.map(e => e.word.toLocaleLowerCase('es'));
  assert.equal(new Set(words).size,entries.length);
  assert.ok(entries.length >= 100);
  for (const entry of entries) {
    const question = makeQuestion(entry.word);
    assert.ok(question,entry.word);
    assert.ok(question.prompt.includes('_____'),entry.word + ' no se reemplazó en el ejemplo');
    assert.ok(question.options.includes(question.answer),entry.word);
    assert.ok(question.options.length >= 2,entry.word);
    assert.equal(search(entry.word).correct,true,entry.word);
  }
  const general = makeQuestion('electroencefalograma');
  assert.equal(general.kind,'memory');
  assert.ok(general.options.includes(general.answer));
});
test('El cuaderno rechaza datos corruptos y duplicados sin interpretar HTML', () => {
  const result = sanitizeWords([{word:'árbol',savedAt:1},{word:'ÁRBOL'},null,{word:'<script>'},{word:55},{word:'tubo',savedAt:'invalid'}]);
  assert.deepEqual(result,[{word:'árbol',savedAt:1},{word:'tubo',savedAt:0}]);
  assert.deepEqual(sanitizeWords({word:'tubo'}),[]);
});

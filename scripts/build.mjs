import {build} from 'esbuild';
import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Resvg} from '@resvg/resvg-js';
import {entries} from '../src/education.js';

await mkdir('assets',{recursive:true});
await mkdir('data',{recursive:true});
await mkdir('licenses',{recursive:true});
const common = {absWorkingDir:process.cwd(),bundle:true,platform:'browser',format:'iife',target:['es2020'],minify:true,legalComments:'eof',tsconfigRaw:{compilerOptions:{}}};
await build({...common,entryPoints:['./src/app.js'],outfile:'assets/app.js'});
await build({...common,entryPoints:['./src/worker.js'],outfile:'assets/worker.js'});
for (const [source,target] of [
  ['dictionary-es/index.aff','data/es.aff'],
  ['dictionary-es/index.dic','data/es.dic'],
  ['dictionary-es/license','licenses/dictionary-es.txt'],
  ['nspell/license','licenses/nspell.txt'],
  ['is-buffer/LICENSE','licenses/is-buffer.txt']
]) await copyFile(`node_modules/${source}`,target);
const dictionary = await readFile('data/es.dic');
const metadata = {source:'RLA-ES, distribuido por wooorm/dictionaries',package:'dictionary-es@4.0.0',baseEntries:Number(dictionary.toString('utf8').split('\n')[0]),educationalEntries:entries.length,sha256:createHash('sha256').update(dictionary).digest('hex'),license:'MPL-1.1',sourceUrl:'https://github.com/wooorm/dictionaries/tree/main/dictionaries/es'};
await writeFile('data/metadata.json',JSON.stringify(metadata,null,2)+'\n');
const svg = await readFile('icon.svg');
for (const size of [192,512]) await writeFile(`icon-${size}.png`,new Resvg(svg,{fitTo:{mode:'width',value:size}}).render().asPng());

const precache = ['./','./index.html','./styles.css','./assets/app.js','./assets/worker.js','./data/es.aff','./data/es.dic','./data/metadata.json','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest','./THIRD_PARTY_NOTICES.md','./licenses/dictionary-es.txt','./licenses/MPL-1.1.txt','./licenses/nspell.txt','./licenses/is-buffer.txt'];
const hash = createHash('sha256');
for (const file of precache.filter(file => file !== './')) hash.update(await readFile(file));
hash.update(await readFile('src/sw-template.js'));
const version = hash.digest('hex').slice(0,12);
const template = await readFile('src/sw-template.js','utf8');
await writeFile('sw.js',template.replace('__VERSION__',version).replace('__PRECACHE__',JSON.stringify(precache)));
console.log(`Click300 construida: ${metadata.baseEntries.toLocaleString('es')} entradas base, ${entries.length} fichas educativas. Caché ${version}.`);

# Créditos y licencias de Click300

## Diccionario ortográfico español

Los archivos `data/es.dic` y `data/es.aff` son copias sin modificar de
`dictionary-es@4.0.0`, normalizadas y distribuidas por Titus Wormer en
https://github.com/wooorm/dictionaries/tree/main/dictionaries/es.

El recurso original es RLA-ES (Recursos Lingüísticos Abiertos del Español),
coordinado inicialmente por Santiago Bosio: https://github.com/sbosio/rla-es.
La edición incluida es la versión 2.8 para es_ES, con 57.344 entradas base.
Las entradas base no equivalen al total de formas que puede reconocer el motor.
Puede haber términos regionales o nombres propios no incluidos.

El diccionario se ofrece bajo GPL-3.0, LGPL-3.0 o MPL-1.1. Esta distribución
elige MPL-1.1. El aviso de autores se conserva en `licenses/dictionary-es.txt`
y el texto de la licencia en `licenses/MPL-1.1.txt`.
El código fuente de estos datos es el propio par `.dic` / `.aff`, incluido
en este repositorio y en cada copia descargable. No se incorpora ni se copia
el contenido del Diccionario de la lengua española de la RAE.

## Motor ortográfico

`nspell@2.1.5`, Titus Wormer: https://github.com/wooorm/nspell.
Licencia MIT, conservada en `licenses/nspell.txt`.
Incluye `is-buffer`, Feross Aboukhadijeh, MIT: `licenses/is-buffer.txt`.

## Contenido educativo

Las explicaciones, ejemplos, pistas y ejercicios de `src/education.js` son
contenido original de Click300. Se muestran separados de las definiciones
del diccionario bajo el título «En palabras sencillas».
Las voces y el dictado son funciones opcionales del navegador.

## Definiciones del diccionario

Los archivos `data/definitions/definitions-*.json` contienen una adaptación
de entradas en español de **Wikcionario en español**, de sus autores y
colaboradores: https://es.wiktionary.org/.
Cada definición conserva la palabra de origen; la interfaz enlaza el artículo,
cuyo historial identifica las contribuciones de sus autores.

Los datos se obtuvieron mediante **Kaikki / Wiktextract**, Tatu Ylonen y
colaboradores: https://kaikki.org/eswiktionary/ y
https://github.com/tatuylonen/wiktextract.
Archivo de origen: https://kaikki.org/dictionary/downloads/es/es-extract.jsonl.gz.
La fuente informaba una extracción del 27 de septiembre de 2026 del volcado
del 1 de septiembre; el archivo descargado tiene fecha de modificación del
28 de septiembre de 2026. La huella SHA-256 y los detalles de esta copia
están en `data/definitions/metadata.json`.

Esta adaptación de los datos se distribuye bajo **Creative Commons
Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**:
https://creativecommons.org/licenses/by-sa/4.0/.
El texto íntegro de la licencia está en `licenses/CC-BY-SA-4.0.txt`.
Las adaptaciones de estos datos deben mantener la atribución y esta licencia
o una licencia compatible, según sus términos.

Modificaciones: selección de entradas españolas de hasta dos palabras,
normalización de espacios, hasta ocho acepciones por entrada y relaciones
explícitas de formas a lemas. Se excluyen traducciones, citas y ejemplos de
obras externas. Hay 131.931 entradas con definiciones y 353.779 relaciones
para formas reconocidas por el motor ortográfico. El script reproducible de
selección está en `scripts/import-definitions.mjs`. Se conservan los textos
de las definiciones de la fuente; las explicaciones educativas son originales
y están identificadas por separado. No se copian definiciones del DLE de la RAE.

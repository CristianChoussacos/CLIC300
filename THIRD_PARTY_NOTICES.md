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
contenido original de Click300. El diccionario general no aporta definiciones:
las fichas educativas y la comprobación ortográfica son recursos distintos.
Las voces y el dictado son funciones opcionales del navegador.

# Click300

Aplicación web de consultas ortográficas para niñas y niños de primaria.
Escribí una palabra como te salga, compará las opciones y descubrí cómo escribirla.

## Qué incluye

- Diccionario español **RLA-ES / dictionary-es 4.0.0**, incorporado a la app:
  **57.344 entradas base** y reglas de afijos para reconocer más formas,
  como plurales y conjugaciones. No es el DLE de la RAE ni contiene todas
  las definiciones del español.
- **137 fichas originales** de primaria: significado sencillo, ejemplo y pista.
- Consulta de palabras cortas, tildes, errores de tipeo y confusiones de sonido.
  La `ñ` se conserva distinta de la `n`.
- Comparaciones con contexto: `tubo/tuvo`, `hay/ahí/ay`, `si/sí`, `haber/a ver`, etc.
  Una palabra válida no se declara incorrecta porque exista otra parecida.
- Cuaderno personal: guardar, filtrar, consultar y quitar palabras. Se conserva
  en IndexedDB en este navegador. Si no está disponible, usa localStorage;
  si ambos están bloqueados, avisa que el cuaderno dura solo la sesión.
- Práctica con frases de primaria o palabras del cuaderno. Las palabras generales
  sin ficha tienen un ejercicio para recordar sus letras. Los aciertos cuentan
  la primera respuesta; el niño puede volver a intentar sin penalizaciones extra.
- Dictado y lectura en voz alta, cuando el navegador los ofrece.
- Interfaz adaptable a notebook, tablet y celular; navegación por teclado,
  etiquetas accesibles, mensajes de estado y compatibilidad con movimiento reducido.
- Uso sin conexión después de descargar la app y el diccionario mediante
  un service worker. Los estilos, íconos y datos no dependen de un CDN.

## Probar desde una notebook

Se necesita Node.js 24 y un navegador actualizado. La aplicación distribuida
ya incluye los archivos construidos y el diccionario.

1. Descargá o cloná el repositorio y abrí una terminal en su carpeta.
2. Ejecutá `npm start` (no requiere instalar dependencias para servir los archivos).
3. Abrí **http://localhost:4173**.
4. Esperá a que aparezca **«57.344 entradas · en tu dispositivo»**.
5. Escribí `estava` y tocá **Descubrir**: aparece `estaba`, con ejemplo y pista.
6. Consultá `tubo`: compará los significados de `tubo` y `tuvo`.
7. Tocá **Guardar en mi cuaderno**. Abrí **Mi cuaderno** para verla, filtrarla o quitarla.
8. Tocá **Repasar mis palabras** o **Practicar** para completar los desafíos.
9. En **Para familias y docentes**, verificá el mensaje que confirma que la app
   y el diccionario están descargados. Luego podés desconectarte y recargar.

Si el puerto está ocupado: `npm start -- --port 4174` y abrí http://localhost:4174.
No abras `index.html` con doble clic: el motor necesita servir sus archivos por
HTTP(S), y el uso sin conexión requiere HTTPS o localhost.

## Desarrollo y comprobaciones

```sh
npm ci
npm run build
npm test
npm run test:e2e
```

`npm run check` ejecuta las tres comprobaciones en orden. En Windows, las pruebas
usan Microsoft Edge instalado. En Linux/CI, ejecutá primero
`npx playwright install --with-deps chromium`. La construcción usa JavaScript y
esbuild; la interfaz utiliza HTML, CSS y JavaScript. No necesita servidor de datos,
clave de API, cuenta ni pago. El diccionario se procesa en un Web Worker para
mantener la interfaz disponible durante la carga y las búsquedas.

El workflow `.github/workflows/check.yml` comprueba el motor, el navegador y que
los archivos distribuidos correspondan al código fuente.

## Alojamiento, incluido GitHub Pages

Puede servirse la raíz del repositorio en cualquier hosting estático HTTPS.
Los archivos `assets/`, `data/`, `licenses/`, `sw.js`, los íconos y el manifiesto
están incluidos en Git: no hace falta construir en el hosting.

Para GitHub Pages, una vez integrados los cambios en `main`, elegí en
**Settings → Pages → Deploy from a branch → main → /(root)**.
Las rutas son relativas y funcionan bajo `/Click300/`; este despliegue no se
activa automáticamente al abrir una propuesta de cambios.

Tras modificar fuentes, ejecutá `npm run build` y guardá también los archivos
generados. El contenido determina la versión de caché. Una actualización se
activa al cerrar las pestañas anteriores de Click300 y volver a abrir la app.
El service worker limpia exclusivamente cachés de Click300 dentro de su propio
alcance y no borra palabras del cuaderno. La antigua base `OrtoclicDB` tampoco
se elimina.

## Alcance y privacidad

- Las consultas son de palabras, no corrección gramatical de textos completos.
  Se admiten las expresiones educativas `a ver` y `por qué`.
- Para una palabra general se informa su escritura y se ofrecen candidatos;
  solo las fichas educativas tienen significado y ejemplo. No se generan
  definiciones ni reglas inventadas para palabras desconocidas.
- Si el diccionario no se puede descargar, las fichas siguen disponibles y
  la app explica que está trabajando con un repertorio reducido.
- El audio del dictado puede enviarse al proveedor del navegador y necesitar
  internet. Se activa únicamente al tocar el micrófono y aceptar el permiso.
  La disponibilidad de las voces depende del sistema.
- No hay analítica, cuentas ni sincronización. El cuaderno queda en el navegador;
  borrar sus datos, usar otro dispositivo o cerrar una sesión privada puede
  eliminarlo o hacerlo inaccesible. Máximo: 500 palabras guardadas.
- El diccionario es la edición general `es_ES` de RLA-ES; algunas variantes
  regionales o nombres propios pueden no reconocerse. «No encontrada» no
  significa necesariamente «incorrecta».

## Ampliar el contenido

Para agregar fichas, editá `src/education.js`. Cada ficha necesita `word`,
`meaning`, `example` (con la palabra incluida), `tip` y un error frecuente
`mistake`, o pertenecer a un grupo de palabras con significados diferentes.
`npm test` comprueba que cada ejercicio tenga respuesta y ejemplo coherentes.

Para actualizar el diccionario, cambiá la versión de `dictionary-es`, conservá
sus licencias, reconstruí y revisá los cambios de vocabulario y las pruebas.
La versión actual y su huella SHA-256 quedan en `data/metadata.json`.

Los créditos, autores, licencias y fuentes de los datos están en
[THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

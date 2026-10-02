// Fichas originales para primaria. Las opciones con sentido distinto se explican
// con ejemplos, nunca se marcan automáticamente como faltas de ortografía.
const groups = [
  ['hacia', [
    ['hacia', 'Indica una dirección.', 'Caminamos hacia la escuela.', 'Hacia un lugar: con h y c.'],
    ['Asia', 'Es el nombre de un continente.', 'Japón está en Asia.', 'Los continentes empiezan con mayúscula.']
  ]],
  ['tubo', [
    ['tubo', 'Es un objeto largo y hueco.', 'El agua pasa por el tubo.', 'El objeto tubo se escribe con b.'],
    ['tuvo', 'Es una forma del verbo tener.', 'Mi amiga tuvo una buena idea.', 'Tener → tuvo: con v.']
  ]],
  ['hay', [
    ['hay', 'Indica que algo existe. Viene del verbo haber.', 'En el patio hay un árbol.', 'Hay algo: con h y con y.'],
    ['ahí', 'Señala un lugar.', 'Dejá el libro ahí.', 'Ahí lleva la tilde en la í.'],
    ['ay', 'Expresa sorpresa, dolor o emoción.', '¡Ay, me lastimé el dedo!', 'La exclamación ay no lleva h.']
  ]],
  ['vaca', [
    ['vaca', 'Es un animal que produce leche.', 'La vaca come pasto.', 'El animal vaca se escribe con v.'],
    ['baca', 'Es un soporte para llevar equipaje sobre un vehículo.', 'La valija está en la baca del auto.', 'El soporte baca se escribe con b.']
  ]],
  ['bello', [
    ['bello', 'Significa bonito.', 'El paisaje es muy bello.', 'Bello de belleza: con b y ll.'],
    ['vello', 'Es el pelo fino del cuerpo.', 'El brazo tiene vello.', 'El pelo vello se escribe con v.']
  ]],
  ['hola', [
    ['hola', 'Se usa para saludar.', '¡Hola, qué bueno verte!', 'El saludo hola lleva h.'],
    ['ola', 'Es una elevación del agua del mar.', 'Una ola llegó a la orilla.', 'La ola del mar no lleva h.']
  ]],
  ['hecho', [
    ['hecho', 'Puede ser algo que ocurrió o una forma del verbo hacer.', 'Ya he hecho la tarea.', 'Hacer y hecho empiezan con h.'],
    ['echo', 'Es una forma del verbo echar.', 'Echo agua en el vaso.', 'Echar y echo no llevan h.']
  ]],
  ['haya', [
    ['haya', 'Puede venir del verbo haber. También es un árbol.', 'Espero que haya lugar.', 'Haber → haya: con h y con y.'],
    ['halla', 'Es una forma del verbo hallar: encontrar.', 'La exploradora halla una pista.', 'Hallar y halla se escriben con ll.'],
    ['aya', 'Es una persona encargada del cuidado y educación de niños.', 'El aya cuidaba a los niños.', 'Aya no lleva h.']
  ]],
  ['vaya', [
    ['vaya', 'Puede ser una forma del verbo ir.', 'Espero que mi amiga vaya al parque.', 'Ir → vaya: con v y con y.'],
    ['valla', 'Es una cerca o un obstáculo.', 'La valla rodea el jardín.', 'La cerca valla lleva ll.'],
    ['baya', 'Es un tipo de fruto.', 'La baya tiene semillas pequeñas.', 'El fruto baya lleva b.']
  ]],
  ['botar', [
    ['botar', 'Puede significar arrojar o hacer que una pelota rebote.', 'Voy a botar la pelota.', 'La pelota bota con b.'],
    ['votar', 'Es elegir mediante un voto.', 'Vamos a votar al delegado.', 'Voto y votar llevan v.']
  ]],
  ['casa', [
    ['casa', 'Es una vivienda.', 'Mi casa tiene un patio.', 'La vivienda casa lleva s.'],
    ['caza', 'Es la acción de cazar.', 'La caza está regulada para proteger a los animales.', 'Cazar y caza llevan z.']
  ]],
  ['coser', [
    ['coser', 'Es unir con hilo y aguja.', 'Aprendí a coser un botón.', 'Coser con hilo lleva s.'],
    ['cocer', 'Es cocinar con calor.', 'Vamos a cocer las papas.', 'Cocer alimentos lleva c.']
  ]],
  ['cien', [
    ['cien', 'Es el número 100.', 'Contamos hasta cien.', 'El número cien empieza con c.'],
    ['sien', 'Es una parte de la cabeza, junto al ojo.', 'Se tocó la sien.', 'La parte de la cabeza sien lleva s.']
  ]],
  ['abría', [
    ['abría', 'Es una forma del verbo abrir.', 'Mi abuelo abría la ventana.', 'Abrir y abría no llevan h.'],
    ['habría', 'Es una forma del verbo haber.', 'Sin lluvia habría más gente.', 'Haber y habría llevan h.']
  ]],
  ['asta', [
    ['asta', 'Es un palo para una bandera o un cuerno de animal.', 'La bandera está en el asta.', 'El palo asta no lleva h.'],
    ['hasta', 'Indica un límite de lugar o tiempo.', 'Leí hasta la página diez.', 'Hasta un límite: con h.']
  ]],
  ['si', [
    ['si', 'Sirve para expresar una condición. También es una nota musical.', 'Si llueve, jugamos adentro.', 'La condición si no lleva tilde.'],
    ['sí', 'Puede expresar afirmación o referirse a una persona.', 'Sí, quiero participar.', 'El sí de una respuesta afirmativa lleva tilde.']
  ]],
  ['tu', [
    ['tu', 'Indica que algo te pertenece.', 'Tu mochila está en la silla.', 'Tu delante de una cosa no lleva tilde.'],
    ['tú', 'Se refiere a la persona con quien hablamos.', 'Tú puedes resolverlo.', 'El pronombre tú lleva tilde.']
  ]],
  ['el', [
    ['el', 'Acompaña a un sustantivo.', 'El gato duerme.', 'El delante de un nombre no lleva tilde.'],
    ['él', 'Se refiere a una persona.', 'Él juega conmigo.', 'El pronombre él lleva tilde.']
  ]],
  ['mi', [
    ['mi', 'Indica pertenencia. También es una nota musical.', 'Mi libro tiene dibujos.', 'Mi delante de una cosa no lleva tilde.'],
    ['mí', 'Se refiere a quien habla, después de una preposición.', 'Este regalo es para mí.', 'Para mí: el pronombre mí lleva tilde.']
  ]],
  ['te', [
    ['te', 'Es un pronombre que se refiere a la persona con quien hablamos.', 'Te presto mis colores.', 'El pronombre te no lleva tilde.'],
    ['té', 'Es una planta o la bebida que se prepara con sus hojas.', 'Tomamos té con galletitas.', 'La bebida té lleva tilde.']
  ]],
  ['mas', [
    ['mas', 'Significa pero; es poco frecuente al hablar.', 'Quise ir, mas no pude.', 'Mas cuando significa pero no lleva tilde.'],
    ['más', 'Indica cantidad o comparación.', 'Quiero más agua.', 'Más cantidad: con tilde.']
  ]],
  ['se', [
    ['se', 'Es un pronombre.', 'La niña se peina.', 'El pronombre se no lleva tilde.'],
    ['sé', 'Puede venir de saber o de ser.', 'Sé la respuesta.', 'Yo sé, de saber, lleva tilde.']
  ]],
  ['de', [
    ['de', 'Es una preposición.', 'La caja es de madera.', 'De para unir palabras no lleva tilde.'],
    ['dé', 'Es una forma del verbo dar.', 'Espero que me dé permiso.', 'Dar → dé: con tilde.']
  ]]
];

const singles = [
  ['estaba', 'Es una forma del verbo estar.', 'Mi perro estaba dormido.', 'Las terminaciones -aba, -abas, -ábamos, -abais y -aban llevan b.', 'estava'],
  ['iba', 'Es una forma del verbo ir.', 'Yo iba a la escuela.', 'Iba, ibas, íbamos, ibais e iban llevan b.', 'iva'],
  ['haber', 'Es un verbo que puede indicar existencia o ayudar a formar otros tiempos.', 'Debe haber una solución.', 'Haber empieza con h y lleva b.', 'aver'],
  ['a ver', 'Se usa cuando queremos mirar, comprobar o saber algo.', 'Vamos a ver el dibujo.', 'A ver son dos palabras: a + ver.', 'aber'],
  ['porque', 'Explica la causa de algo.', 'Llevo paraguas porque llueve.', 'Para dar una causa, porque va junto y sin tilde.', 'porqe'],
  ['por qué', 'Se usa para preguntar una causa, también en preguntas indirectas.', '¿Por qué llueve?', 'Al preguntar una causa: por qué, separado y con tilde.', 'por que'],
  ['porqué', 'Es un sustantivo que significa motivo o causa.', 'Quiero entender el porqué de tu decisión.', 'El porqué es un nombre: va junto y con tilde.', 'porqé'],
  ['árbol', 'Es una planta con tronco y ramas.', 'El árbol da sombra.', 'Árbol lleva tilde: es llana y termina en l.', 'arbol'],
  ['lápiz', 'Sirve para escribir o dibujar.', 'Dibujo con un lápiz.', 'Lápiz lleva tilde: es llana y termina en z.', 'lapiz'],
  ['lápices', 'Es el plural de lápiz.', 'Guardé mis lápices.', 'Al formar el plural, la z cambia a c. Lápices es esdrújula y lleva tilde.', 'lápizes'],
  ['canción', 'Es una composición que se canta.', 'Cantamos una canción.', 'Canción lleva tilde: es aguda y termina en n.', 'cancion'],
  ['corazón', 'Es un órgano que impulsa la sangre.', 'Mi corazón late rápido.', 'Corazón lleva z y tilde: es aguda y termina en n.', 'corason'],
  ['camión', 'Es un vehículo para transportar cargas.', 'El camión lleva cajas.', 'Camión lleva tilde: es aguda y termina en n.', 'camion'],
  ['ratón', 'Puede ser un animal o un dispositivo de computadora.', 'El ratón se escondió.', 'Ratón lleva tilde: es aguda y termina en n.', 'raton'],
  ['avión', 'Es un vehículo que vuela.', 'El avión cruzó el cielo.', 'Avión lleva v y tilde: es aguda y termina en n.', 'abion'],
  ['jardín', 'Es un lugar donde se cultivan plantas.', 'Hay flores en el jardín.', 'Jardín lleva tilde: es aguda y termina en n.', 'jardin'],
  ['también', 'Indica que algo se añade a lo anterior.', 'Yo también quiero jugar.', 'Antes de b se escribe m. También lleva tilde.', 'tanbien'],
  ['después', 'Indica un momento posterior.', 'Después hacemos la tarea.', 'Después lleva tilde: es aguda y termina en s.', 'despues'],
  ['fácil', 'Significa que algo cuesta poco esfuerzo.', 'Este juego es fácil.', 'Fácil lleva tilde: es llana y termina en l.', 'facil'],
  ['difícil', 'Significa que algo cuesta esfuerzo.', 'El problema parecía difícil.', 'Difícil lleva tilde: es llana y termina en l.', 'dificil'],
  ['música', 'Es el arte de combinar sonidos.', 'Escuchamos música.', 'Música es esdrújula: lleva tilde.', 'musica'],
  ['pájaro', 'Es un ave.', 'El pájaro canta.', 'Pájaro es esdrújula: lleva tilde.', 'pajaro'],
  ['teléfono', 'Es un aparato para comunicarnos a distancia.', 'Suena el teléfono.', 'Teléfono es esdrújula: lleva tilde.', 'telefono'],
  ['matemática', 'Estudia números, figuras y sus relaciones.', 'Hoy tenemos matemática.', 'Matemática es esdrújula: lleva tilde.', 'matematica'],
  ['miércoles', 'Es un día de la semana.', 'El miércoles vamos a la biblioteca.', 'Miércoles es esdrújula: lleva tilde.', 'miercoles'],
  ['sábado', 'Es un día de la semana.', 'El sábado visitamos a la abuela.', 'Sábado es esdrújula: lleva tilde.', 'sabado'],
  ['brújula', 'Es un instrumento que indica direcciones.', 'La brújula señala el norte.', 'Brújula es esdrújula: lleva tilde.', 'brujula'],
  ['héroe', 'Es una persona admirada por sus acciones.', 'El héroe ayudó al pueblo.', 'Héroe empieza con h y es esdrújula: lleva tilde.', 'eroe'],
  ['país', 'Es un territorio con una organización política.', 'Argentina es un país.', 'En país, la a y la í están en sílabas distintas: la í lleva tilde.', 'pais'],
  ['maíz', 'Es una planta y su grano.', 'Comimos maíz.', 'Maíz lleva z y tilde en la í para marcar el hiato.', 'maiz'],
  ['día', 'Es un período de veinticuatro horas.', 'Hoy es un lindo día.', 'En día, la í y la a forman un hiato: la í lleva tilde.', 'dia'],
  ['río', 'Es una corriente natural de agua. También puede venir de reír.', 'El río llega al mar.', 'En río, la í y la o forman un hiato: la í lleva tilde.', 'rio'],
  ['búho', 'Es un ave que suele estar activa por la noche.', 'El búho mira desde el árbol.', 'Búho lleva h y tilde en la ú.', 'buho'],
  ['pingüino', 'Es un ave que nada y no vuela.', 'El pingüino entró al agua.', 'La diéresis hace que suene la u en güi.', 'pinguino'],
  ['cigüeña', 'Es un ave de patas largas.', 'La cigüeña tiene un nido.', 'La diéresis hace que suene la u en güe.', 'cigueña'],
  ['vergüenza', 'Es un sentimiento de incomodidad ante otras personas.', 'Me dio vergüenza hablar.', 'Vergüenza lleva v, z y diéresis para que suene la u.', 'verguenza'],
  ['guitarra', 'Es un instrumento musical de cuerdas.', 'Mi hermana toca la guitarra.', 'En gui la u no suena. Entre vocales, rr mantiene el sonido fuerte.', 'gitarra'],
  ['guerra', 'Es un conflicto armado.', 'Deseamos un mundo sin guerra.', 'En gue la u no suena. La rr suena fuerte entre vocales.', 'gerra'],
  ['queso', 'Es un alimento elaborado con leche.', 'Puse queso en el pan.', 'Para el sonido de queso se escribe qu antes de e.', 'qeso'],
  ['quince', 'Es el número 15.', 'Tengo quince figuritas.', 'Quince empieza con qui y lleva c.', 'kinse'],
  ['jirafa', 'Es un animal de cuello largo.', 'La jirafa come hojas.', 'Jirafa se escribe con j.', 'girafa'],
  ['gente', 'Es un conjunto de personas.', 'Había mucha gente en la plaza.', 'Gente empieza con g.', 'jente'],
  ['gigante', 'Significa muy grande.', 'Vimos un árbol gigante.', 'Gigante lleva g al principio y antes de la a.', 'jigante'],
  ['jugar', 'Es divertirse con una actividad o un juego.', 'Me gusta jugar con mis amigos.', 'Jugar empieza con j.', 'gugar'],
  ['viaje', 'Es un traslado de un lugar a otro.', 'Hicimos un viaje al campo.', 'Viaje lleva v y j.', 'viage'],
  ['reloj', 'Es un instrumento que indica la hora.', 'Miro la hora en el reloj.', 'Reloj termina en j.', 'relog'],
  ['huevo', 'Es una estructura que producen muchos animales; algunos se usan como alimento.', 'La gallina puso un huevo.', 'Las palabras que empiezan por hue- suelen llevar h, como huevo.', 'uevo'],
  ['hueso', 'Es una parte dura del esqueleto.', 'El hueso sostiene el cuerpo.', 'Hueso empieza con hue- y lleva h.', 'ueso'],
  ['hierba', 'Es una planta de tallo poco leñoso.', 'La hierba crece en el patio.', 'Hierba lleva h y b.', 'ierba'],
  ['zanahoria', 'Es una hortaliza de raíz comestible.', 'Comimos zanahoria rallada.', 'Zanahoria empieza con z y lleva h en el medio.', 'sanaoria'],
  ['ahora', 'Indica el momento presente.', 'Ahora vamos a leer.', 'Ahora lleva h después de la primera a.', 'aora'],
  ['hoy', 'Es el día en que estamos.', 'Hoy tenemos educación física.', 'Hoy empieza con h y termina en y.', 'oy'],
  ['hermano', 'Es una persona que comparte padre o madre con otra.', 'Mi hermano me ayuda.', 'Hermano empieza con h.', 'ermano'],
  ['hablar', 'Es comunicarse con palabras.', 'Podemos hablar de nuestra duda.', 'Hablar empieza con h y lleva b.', 'ablar'],
  ['hacer', 'Es realizar o producir algo.', 'Quiero hacer un dibujo.', 'Hacer lleva h y c.', 'aser'],
  ['escuela', 'Es un lugar donde aprendemos.', 'Voy a la escuela.', 'Escuela se escribe con s después de la e.', 'ecuela'],
  ['biblioteca', 'Es un lugar donde se guardan y consultan libros.', 'Buscamos un cuento en la biblioteca.', 'Biblioteca empieza con bibli-, que lleva dos b.', 'viblioteca'],
  ['libro', 'Es un conjunto de páginas que puede contar o enseñar algo.', 'Leo un libro de aventuras.', 'El grupo br se escribe con b.', 'livro'],
  ['brazo', 'Es una extremidad del cuerpo.', 'Levanté el brazo.', 'El grupo br se escribe con b. Brazo lleva z.', 'braso'],
  ['blanco', 'Es un color.', 'El papel es blanco.', 'El grupo bl se escribe con b.', 'vlanco'],
  ['tambor', 'Es un instrumento de percusión.', 'Toco el tambor.', 'Antes de b se escribe m.', 'tanbor'],
  ['campo', 'Es un terreno fuera de la ciudad o un espacio abierto.', 'Fuimos al campo.', 'Antes de p se escribe m.', 'canpo'],
  ['tiempo', 'Puede indicar duración o estado de la atmósfera.', 'Tengo tiempo para jugar.', 'Antes de p se escribe m.', 'tienpo'],
  ['siempre', 'Significa en todo momento.', 'Siempre guardo mis útiles.', 'Antes de p se escribe m.', 'sienpre'],
  ['invierno', 'Es la estación más fría del año.', 'En invierno usamos abrigo.', 'Antes de v se escribe n.', 'inbierno'],
  ['inventar', 'Es crear algo nuevo.', 'Vamos a inventar una historia.', 'Antes de v se escribe n.', 'imbentar'],
  ['abeja', 'Es un insecto que puede producir miel.', 'La abeja visita una flor.', 'Abeja lleva b y j.', 'aveja'],
  ['oveja', 'Es un animal del que se obtiene lana.', 'La oveja tiene lana.', 'Oveja lleva v y j.', 'obeja'],
  ['burbuja', 'Es una pequeña esfera de gas dentro de un líquido o película.', 'Una burbuja flotó en el aire.', 'Burbuja lleva b al principio y después de la r.', 'vurbuja'],
  ['ventana', 'Es una abertura que deja pasar luz y aire.', 'Abrí la ventana.', 'Ventana empieza con v.', 'bentana'],
  ['verano', 'Es la estación más cálida del año.', 'En verano vamos a la playa.', 'Verano empieza con v.', 'berano'],
  ['lluvia', 'Es agua que cae de las nubes.', 'La lluvia moja el jardín.', 'Lluvia empieza con ll y lleva v.', 'yubia'],
  ['llave', 'Puede servir para abrir una cerradura.', 'La llave abre la puerta.', 'Llave empieza con ll y lleva v.', 'yave'],
  ['caballo', 'Es un animal que puede usarse para montar.', 'El caballo corre por el campo.', 'Caballo lleva b y ll.', 'cavayo'],
  ['amarillo', 'Es un color.', 'Pinté el sol de amarillo.', 'Amarillo se escribe con ll.', 'amariyo'],
  ['yema', 'Es la parte amarilla del huevo o una parte de los dedos.', 'La yema del huevo es amarilla.', 'Yema empieza con y.', 'llema'],
  ['ayer', 'Es el día anterior a hoy.', 'Ayer aprendimos una canción.', 'Ayer se escribe con y.', 'aller'],
  ['zanahorias', 'Es el plural de zanahoria.', 'Compramos zanahorias.', 'Zanahorias lleva z al principio y h en el medio.', 'sanaorias'],
  ['zapato', 'Es un objeto que protege el pie.', 'Me até el zapato.', 'Zapato empieza con z.', 'sapato'],
  ['cereza', 'Es una fruta pequeña.', 'La cereza es roja.', 'Cereza empieza con c y lleva z antes de la a.', 'seresa'],
  ['peces', 'Es el plural de pez.', 'Los peces nadan.', 'Al formar el plural de pez, la z cambia a c.', 'pezes'],
  ['luces', 'Es el plural de luz.', 'Encendimos las luces.', 'Al formar el plural de luz, la z cambia a c.', 'luzes'],
  ['felices', 'Es el plural de feliz.', 'Estamos felices de aprender.', 'Al formar el plural de feliz, la z cambia a c.', 'felizes'],
  ['empezar', 'Es comenzar algo.', 'Vamos a empezar el juego.', 'Empezar lleva m antes de p y z antes de a.', 'empesar'],
  ['carro', 'Es un vehículo con ruedas.', 'El carro lleva verduras.', 'Entre vocales, rr representa el sonido fuerte.', 'caro'],
  ['perro', 'Es un animal doméstico.', 'Mi perro juega en el patio.', 'Entre vocales, rr representa el sonido fuerte.', 'pero'],
  ['sonrisa', 'Es una expresión de alegría.', 'Me regaló una sonrisa.', 'Después de n se escribe una sola r, aunque suene fuerte.', 'sonrrisa'],
  ['alrededor', 'Significa en torno a algo.', 'Nos sentamos alrededor de la mesa.', 'Después de l se escribe una sola r, aunque suene fuerte.', 'alrrededor']
];

export const entries = [
  ...groups.flatMap(([group, rows]) => rows.map(([word, meaning, example, tip]) => ({word, meaning, example, tip, group}))),
  ...singles.map(([word, meaning, example, tip, mistake]) => ({word, meaning, example, tip, mistake}))
];
export const entryByWord = new Map(entries.map(entry => [entry.word.toLocaleLowerCase('es'), entry]));
export const homophoneGroups = groups.map(([, rows]) => rows.map(row => row[0]));
// Expresiones relacionadas que no comparten exactamente el sonido.
export const relatedGroups = [['hay', 'ahí', 'ay'], ['haber', 'a ver'], ['porque', 'por qué', 'porqué']];
export const quickWords = ['estava', 'hay', 'tubo', 'arbol', 'a ver', 'pingüino'];

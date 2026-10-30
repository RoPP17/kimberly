/**
 * Centralized narrative, visual telemetry, and memory archive for Kimberly.
 * Every word of Roberto's 6-paragraph letter is preserved 100% verbatim.
 */

export const LETTER_STANZAS = [
  {
    id: 'stanza-01',
    roman: 'I',
    telemetryTag: 'SILENCIO CON SENTIDO',
    omegaValue: 840,
    shaderState: {
      harmony: 0.28,
      warmth: 0.22,
      dawn: 0.04,
      bloom: 0.95,
      timeScale: 0.72,
    },
    segments: [
      {
        text: '¿Sabes qué es lo curioso de ti? Que hay personas con las que uno puede pasar horas hablando y, aun así, sentir que no termina de conocerlas, y luego estás tú, ',
        highlight: false,
      },
      {
        text: 'que de alguna manera haces que hasta el silencio tenga sentido.',
        highlight: true,
      },
    ],
  },
  {
    id: 'stanza-02',
    roman: 'II',
    telemetryTag: 'PAUSA',
    omegaValue: 310,
    shaderState: {
      harmony: 0.48,
      warmth: 0.35,
      dawn: 0.08,
      bloom: 1.05,
      timeScale: 0.42,
    },
    segments: [
      {
        text: 'No sé cómo explicarlo sin que suene a una estupidez, pero ',
        highlight: false,
      },
      {
        text: 'hay algo en ti que me hace querer detenerme un rato.',
        highlight: true,
      },
      {
        text: ' Y tú sabes que yo no soy precisamente alguien que se detenga por cualquier cosa. Siempre estoy pensando en qué hacer, qué conseguir, qué problema resolver o qué demonios inventarme ahora. ',
        highlight: false,
      },
      {
        text: 'Pero contigo es diferente.',
        highlight: true,
      },
    ],
  },
  {
    id: 'stanza-03',
    roman: 'III',
    telemetryTag: 'INVARIANTE',
    omegaValue: 74,
    shaderState: {
      harmony: 0.72,
      warmth: 0.54,
      dawn: 0.14,
      bloom: 1.15,
      timeScale: 0.24,
    },
    segments: [
      {
        text: 'No sé si alguna vez te has dado cuenta de lo importante que eres para mí. Y tampoco sé si alguna vez te lo he dicho de la manera correcta. Pero quiero que sepas que, entre tantas cosas que cambian, tantos planes que salen mal y tantas personas que van y vienen, ',
        highlight: false,
      },
      {
        text: 'hay algo de ti que siempre ocupa un lugar al que nadie más ha llegado.',
        highlight: true,
      },
    ],
  },
  {
    id: 'stanza-04',
    roman: 'IV',
    telemetryTag: 'EXISTENCIA',
    omegaValue: 18,
    shaderState: {
      harmony: 0.86,
      warmth: 0.68,
      dawn: 0.24,
      bloom: 1.22,
      timeScale: 0.16,
    },
    segments: [
      {
        text: 'Y no te digo esto para que hagas algo con ello, ni para que me respondas de alguna manera en particular. Simplemente creo que hay personas que merecen saber que ',
        highlight: false,
      },
      {
        text: 'su existencia ha significado algo más que una coincidencia bonita en la vida de alguien.',
        highlight: true,
      },
    ],
  },
  {
    id: 'stanza-05',
    roman: 'V',
    telemetryTag: 'CERTEZA',
    omegaValue: 0,
    isMonumental: true,
    shaderState: {
      harmony: 0.98,
      warmth: 0.88,
      dawn: 0.38,
      bloom: 1.38,
      timeScale: 0.08,
    },
    segments: [
      {
        text: 'Tú eres una de esas personas para mí.',
        highlight: true,
      },
    ],
  },
  {
    id: 'stanza-06',
    roman: 'VI',
    telemetryTag: 'HORIZONTE',
    omegaValue: 0,
    shaderState: {
      harmony: 1.0,
      warmth: 0.96,
      dawn: 0.72,
      bloom: 1.32,
      timeScale: 0.1,
    },
    segments: [
      {
        text: 'Y si algún día la vida nos lleva por caminos distintos, quiero que sepas que conocerte habrá sido una de esas cosas que, incluso después de muchos años, recordaré con una sonrisa y pensaré: ',
        highlight: false,
      },
      {
        text: 'ojalá volver a verla',
        highlight: true,
        italic: true,
      },
    ],
  },
];

export const MEMORIES = [
  {
    id: 'mem-01',
    catalog: 'INSTANTE 01 · CREPÚSCULO ANTHONY',
    title: 'La habilidad tuya de volver extraordinario cualquier lugar',
    caption:
      'Un pasillo cualquiera, una botella de Anthony en la mano y tú a mi lado. No hace falta ningún escenario de película cuando es tu mirada la que desarma todo mi ruido.',
    webp: './assets/photos/memory-01.webp',
    jpg: './assets/photos/memory-01.jpg',
    depth: './assets/photos/memory-01-depth.jpg',
    aspect: '1 / 1',
    featured3D: true,
    aura: 'rgba(201, 91, 114, 0.26)',
  },
  {
    id: 'mem-02',
    catalog: 'INSTANTE 02 · LUZ DE TARDE',
    title: 'Donde la velocidad del mundo cae a cero',
    caption:
      'Apoyarme cerca de ti y sentir, por primera vez en medio de mil días acelerados, que no necesito correr hacia ningún otro sitio.',
    webp: './assets/photos/memory-02.webp',
    jpg: './assets/photos/memory-02.jpg',
    depth: './assets/photos/memory-02-depth.jpg',
    aspect: '9 / 16',
    featured3D: false,
    aura: 'rgba(232, 195, 145, 0.24)',
  },
  {
    id: 'mem-03',
    catalog: 'INSTANTE 03 · TRAZO EN PEQUEÑO',
    title: 'Dos sonrisas dibujadas y una complicidad que no se explica',
    caption:
      'La prueba silenciosa de que contigo hasta el gesto más simple guarda un idioma propio que no tengo ni tendré con nadie más.',
    webp: './assets/photos/memory-03.webp',
    jpg: './assets/photos/memory-03.jpg',
    depth: './assets/photos/memory-03-depth.jpg',
    aspect: '9 / 16',
    featured3D: false,
    aura: 'rgba(182, 134, 214, 0.22)',
  },
];

export const CERTAINTIES = [
  {
    index: '01',
    label: 'EL SILENCIO',
    title: 'No necesito inventar palabras cuando estás cerca',
    body: 'Con casi todo el mundo existe la urgencia de llenar los vacíos. Contigo descubrí lo contrario: estar callados juntos tiene más verdad que mil horas de conversación con cualquiera.',
  },
  {
    index: '02',
    label: 'LA EXCEPCIÓN',
    title: 'Eres la única pausa que mi mente no intenta resolver',
    body: 'Mi cabeza vive proyectando, calculando y persiguiendo el próximo reto. Tú no eres un problema por descifrar: eres el único hogar donde mi cabeza por fin descansa.',
  },
  {
    index: '03',
    label: 'LA RELATIVIDAD',
    title: 'La única constante invariable en todo mi sistema',
    body: 'En física aprendí que todo marco de referencia es relativo y que el tiempo se dilata con el movimiento; que en el universo no existen puntos fijos y que la única constante universal invariable es c (la velocidad de la luz en el vacío). Pero si tuviera que formular mi propia ley, tú serías el único invariante de Lorentz en mi vida: no importa a qué velocidad gire el mundo a mi alrededor ni cuántas cosas cambien, tú sigues siendo la única constante que no cambia.',
  },
  {
    index: '04',
    label: 'LA CERTEZA',
    title: 'Mucho más grande que una coincidencia bonita',
    body: 'Llamarte casualidad sería quedarme demasiado corto. Hay presencias que te cambian la forma de mirar la vida entera, y la tuya hizo eso conmigo desde el primer día.',
  },
  {
    index: '05',
    label: 'SIN CONDICIONES',
    title: 'Lo que siento por ti no sabe pedir nada a cambio',
    body: 'Te digo todo esto desde la libertad más limpia: porque alguien como tú merece caminar por el mundo sabiendo con absoluta claridad cuánto vale y cuánto la aman.',
  },
];

export const SECRET_POSTSCRIPT = {
  eyebrow: 'ESTRELLA OCULTA · P.D.',
  title: 'Una última cosa...',
  paragraphs: [
    'Si abriste esto, no te tomes tan literal lo de «incluso después de muchos años pensaré ojalá volver a verla» como si fuera una despedida dramática de película.',
    'Solo quería hacerte un detalle bonito y que supieras lo importante que eres, a mi manera.',
    'Y sí, programar todo este cielo fue mi excusa perfecta para pensar en ti.',
  ],
  signature: 'Roberto',
};

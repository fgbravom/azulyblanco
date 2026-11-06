// Rutina de entrenamiento en casa (/entrenamiento), transcrita de la pauta del
// preparador físico (PDF "Rutina AYB Serie 35"), abierta a todos los jugadores del club. Sin base de datos: para cambiar un video basta con
// reemplazar su `video` por el id de YouTube (los 11 caracteres después de "v=").

export interface Ejercicio {
  id: string
  nombre: string
  /** Nombre alternativo o en inglés, como aparece en la pauta */
  alias?: string
  musculos: string[]
  descripcion: string
  /** Lo que se hace en cada serie, tal como se le dice al jugador */
  objetivo: string
  series: number
  /** Descanso después de cada serie, en segundos */
  descanso: number
  variante: string
  /** Advertencia destacada (por ejemplo, no agregar peso) */
  aviso?: string
  /** Id de un video de YouTube que muestra el ejercicio */
  video: string
}

export interface Estiramiento {
  id: string
  nombre: string
  zona: string
  descripcion: string
  repeticiones: number
  /** Segundos que se mantiene cada repetición */
  mantener: number
  /** Segundos de pausa entre repeticiones */
  pausa: number
  /** Se hace con cada pierna por separado */
  porLado: boolean
  video: string
}

export interface Rutina {
  titulo: string
  /** Duración que se informa en la portada, en minutos */
  duracionMinutos: number
  objetivo: string
  materiales: string
  consideraciones: string[]
  calentamiento: string
  sugerencias: string[]
  ejercicios: Ejercicio[]
  estiramientos: Estiramiento[]
  alimentacion: {
    antes: { cuando: string; titulo: string; texto: string; ejemplos: string[] }[]
    evitar: string
    /** Mililitros de agua por kilo de peso al día */
    mlPorKilo: number
    /** Mínimo diario recomendado, en litros */
    minimoLitros: number
    /** Agua antes de jugar, en ml */
    previo: string
  }
}

export const RUTINA_EN_CASA: Rutina = {
  duracionMinutos: 60,
  titulo: 'Potencia, agilidad y velocidad',
  objetivo:
    'Mejorar la potencia muscular, la agilidad y la velocidad con ejercicios explosivos (pliometría), más una pauta de estiramientos para cerrar.',
  materiales:
    'Es una rutina para la casa: sirven botellas plásticas o una silla. Si tienes mancuernas, bandas elásticas o discos, puedes usarlos.',
  consideraciones: [
    'Si tienes un esguince, un desgarro o una contractura, no fuerces: lo primero es recuperarte.',
    'Con una contractura, baja la carga o no entrenes ese día, y prioriza estirar e hidratarte.',
  ],
  calentamiento:
    'Antes de empezar, haz movilidad articular (tobillos, rodillas, caderas, hombros) y algunos estiramientos dinámicos.',
  sugerencias: [
    'Hidrátate durante toda la sesión.',
    'Descansa entre 1:30 y 2 minutos entre series para no sobrecargarte.',
    'Estira al terminar la rutina, y también después de cada partido o entrenamiento en cancha.',
  ],
  ejercicios: [
    {
      id: 'saltos-laterales',
      nombre: 'Saltos laterales',
      musculos: ['Cuádriceps', 'Glúteo', 'Gemelo', 'Sóleo', 'Isquiotibiales'],
      descripcion:
        'Pon dos marcas (conos o botellas) a dos metros de distancia. Impúlsate con un solo pie hacia el costado y, apenas caigas, repite hacia el otro lado con el pie contrario, despegando bien la planta del suelo.',
      objetivo: '15 saltos por pierna',
      series: 4,
      descanso: 120,
      variante: 'Salta con peso en los brazos: un disco, un balón medicinal o algo pesado fácil de tomar.',
      video: 'LyRRekZLJPw',
    },
    {
      id: 'puente-gluteo',
      nombre: 'Puente de glúteo',
      musculos: ['Glúteo', 'Isquiotibiales', 'Erector espinal', 'Core'],
      descripcion:
        'Acuéstate de espalda con las plantas de los pies apoyadas en el suelo. Eleva los glúteos hasta formar un ángulo de 90° entre el muslo y la pantorrilla, y baja controlando.',
      objetivo: '10 a 15 repeticiones',
      series: 4,
      descanso: 120,
      variante: 'Pon peso sobre el abdomen: un disco, un balón medicinal o un objeto que puedas sostener cómodo.',
      video: 'oDXM-a-gBt8',
    },
    {
      id: 'pistol-squat-silla',
      nombre: 'Pistol squat en silla',
      alias: 'Sentadilla a una pierna',
      musculos: ['Cuádriceps', 'Glúteo', 'Isquiotibiales', 'Aductores', 'Gemelo', 'Sóleo', 'Core'],
      descripcion:
        'Siéntate en una silla. Estira una pierna al frente y apoya la planta completa del otro pie en el suelo, con los brazos extendidos hacia adelante. Ponte de pie usando solo la pierna de apoyo.',
      objetivo: '10 a 15 repeticiones por pierna',
      series: 4,
      descanso: 120,
      variante: 'Sostén peso con los brazos extendidos al frente (disco, balón medicinal): además trabaja el core.',
      video: 'wScWJWqbXGY',
    },
    {
      id: 'saltos-bulgara',
      nombre: 'Saltos laterales en posición búlgara',
      musculos: ['Cuádriceps', 'Glúteo', 'Isquiotibiales', 'Aductores', 'Gemelo', 'Sóleo', 'Core'],
      descripcion:
        'Ponte en posición de sentadilla búlgara, con el pie de atrás apoyado en una silla. Con el pie que queda en el suelo, da pequeños saltos hacia los lados sin perder la estabilidad. Puedes poner un objeto en el suelo que marque el lado derecho y el izquierdo.',
      objetivo: '10 a 15 repeticiones por pierna',
      series: 4,
      descanso: 120,
      variante: 'Haz tres movimientos seguidos: dos saltos laterales y uno hacia adelante.',
      video: 'Bkg0HCH34tI',
    },
    {
      id: 'estocada-salto',
      nombre: 'Estocada con salto',
      musculos: ['Cuádriceps', 'Glúteo', 'Isquiotibiales', 'Aductores', 'Gemelo', 'Sóleo', 'Core', 'Estabilizadores de tobillo, rodilla y cadera'],
      descripcion:
        'Manos en la cintura o en posición de carrera. Baja en estocada con el tronco recto y las piernas a 90°, sube con fuerza y salta cambiando de pierna en el aire.',
      objetivo: '10 a 15 repeticiones por pierna',
      series: 4,
      descanso: 120,
      variante:
        'Estocada sin salto, pero con peso extra: mancuernas, discos, botellas con agua o bolsas de arroz.',
      video: 't8xeXiubV0I',
    },
    {
      id: 'knee-squat-jump',
      nombre: 'Salto desde rodillas a sentadilla',
      alias: 'Knee squat jump',
      musculos: ['Cuádriceps', 'Glúteo', 'Isquiotibiales', 'Aductores', 'Gemelo', 'Sóleo', 'Core', 'Estabilizadores de tobillo, rodilla y cadera'],
      descripcion:
        'Arrodíllate en el suelo con los brazos extendidos para ayudarte a tomar impulso. Desde ahí, salta para caer con las plantas de los pies en sentadilla profunda y termina de pie.',
      objetivo: '10 repeticiones',
      series: 3,
      descanso: 120,
      variante: 'Sin impulso: apoya primero un pie, después el otro, y ponte de pie.',
      aviso: 'No agregues carga ni peso extra en este ejercicio.',
      video: '4qK55avGyy4',
    },
  ],
  estiramientos: [
    {
      id: 'gluteos',
      nombre: 'Glúteos',
      zona: 'Glúteo',
      descripcion: 'Sentado, cruza una pierna sobre la otra y lleva la rodilla hacia el pecho abrazándola.',
      repeticiones: 3,
      mantener: 10,
      pausa: 5,
      porLado: true,
      video: 'ciE-5vr9Dog',
    },
    {
      id: 'isquiotibiales',
      nombre: 'Isquiotibiales y glúteo',
      zona: 'Parte de atrás del muslo',
      descripcion:
        'Acostado de espalda, sube una pierna extendida y tómala por detrás del muslo. La otra pierna queda apoyada completa en el suelo.',
      repeticiones: 3,
      mantener: 10,
      pausa: 5,
      porLado: true,
      video: 'fk26DB44VNg',
    },
    {
      id: 'aductores',
      nombre: 'Aductores',
      zona: 'Parte interna del muslo',
      descripcion: 'Sentado con las plantas de los pies juntas (mariposa), lleva la cabeza hacia la punta de los pies.',
      repeticiones: 3,
      mantener: 10,
      pausa: 5,
      porLado: false,
      video: 'LVu8FTrNfa4',
    },
    {
      id: 'gemelos',
      nombre: 'Gemelos y sóleo',
      zona: 'Pantorrilla',
      descripcion:
        'Apoya las manos en una pared, lleva una pierna atrás con el talón en el suelo y empuja la pared con la rodilla de atrás estirada.',
      repeticiones: 3,
      mantener: 10,
      pausa: 5,
      porLado: true,
      video: 'nl-ho9I_yoc',
    },
    {
      id: 'cuadriceps',
      nombre: 'Cuádriceps',
      zona: 'Parte de adelante del muslo',
      descripcion:
        'De pie o acostado de lado en el suelo, toma el empeine y lleva el talón hacia el glúteo, con las rodillas juntas.',
      repeticiones: 3,
      mantener: 10,
      pausa: 5,
      porLado: true,
      video: 'w2n_Hf-q76w',
    },
    {
      id: 'abdomen',
      nombre: 'Abdomen',
      zona: 'Abdomen',
      descripcion:
        'Boca abajo, apoya las manos a la altura del pecho y estira los brazos levantando el tronco, con la cadera en el suelo (postura de cobra).',
      repeticiones: 3,
      mantener: 10,
      pausa: 5,
      porLado: false,
      video: 'tR-3cDLj1jE',
    },
  ],
  alimentacion: {
    antes: [
      {
        cuando: '2 a 4 horas antes',
        titulo: 'Carbohidratos complejos y proteína',
        texto:
          'Se digieren lento y dan energía que dura, sin picos de azúcar. La proteína sólida (pollo, huevo, carnes magras) va en esta misma comida para no jugar con el estómago pesado.',
        ejemplos: ['Arroz o pasta integral', 'Legumbres', 'Avena', 'Papas', 'Quinoa', 'Choclo', 'Brócoli'],
      },
      {
        cuando: '1 hora antes',
        titulo: 'Carbohidratos simples',
        texto: 'Se absorben rápido y no dejan sensación de pesadez al jugar.',
        ejemplos: ['Plátano maduro', 'Pan con mermelada o manjar', 'Frutos secos', 'Barrita energética'],
      },
    ],
    evitar: 'Ultraprocesados, comida rápida, bollería, snacks y alcohol antes de jugar.',
    mlPorKilo: 35,
    minimoLitros: 2,
    previo: '600 a 700 ml de agua entre dos y tres horas antes del partido o entrenamiento.',
  },
}

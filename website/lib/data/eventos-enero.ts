import { EventoCalendario } from '@/lib/types/calendario'

// Eventos reales de diciembre 2025 (pasados)
export const eventosDiciembrePasados: EventoCalendario[] = [
  {
    id: 'dic-1',
    fecha: '2025-12-11',
    dia: 'JUEVES',
    diaMes: 11,
    mes: 'DICIEMBRE',
    tipo: 'partido',
    rival: 'AYB VS CLUB AMÉRICA',
    estadio: 'ESTADIO ANFA',
    confirmado: true,
    tipoPartido: 'Amistoso'
  },
  {
    id: 'dic-2',
    fecha: '2025-12-14',
    dia: 'DOMINGO',
    diaMes: 14,
    mes: 'DICIEMBRE',
    tipo: 'partido',
    rival: 'AYB35 VS AYB',
    estadio: 'LA GRANJA',
    confirmado: true,
    tipoPartido: 'Amistoso'
  },
  {
    id: 'dic-3',
    fecha: '2025-12-15',
    dia: 'LUNES',
    diaMes: 15,
    mes: 'DICIEMBRE',
    tipo: 'entrenamiento',
    actividad: 'ENTRENAMIENTO',
    estadio: 'ESTADIO ANFA',
    confirmado: false
  },
  {
    id: 'dic-4',
    fecha: '2025-12-17',
    dia: 'MIÉRCOLES',
    diaMes: 17,
    mes: 'DICIEMBRE',
    tipo: 'partido',
    rival: 'AYB VS SITOMANBOY',
    estadio: 'SOL DE SEPTIEMBRE',
    confirmado: true,
    tipoPartido: 'Amistoso'
  },
  {
    id: 'dic-5',
    fecha: '2025-12-22',
    dia: 'LUNES',
    diaMes: 22,
    mes: 'DICIEMBRE',
    tipo: 'partido',
    rival: 'AYB VS UNIÓN BOLDO',
    estadio: 'ESTADIO ANFA',
    horaInicio: '22:00',
    confirmado: true,
    tipoPartido: 'Amistoso'
  },
  {
    id: 'dic-6',
    fecha: '2025-12-27',
    dia: 'SÁBADO',
    diaMes: 27,
    mes: 'DICIEMBRE',
    tipo: 'partido',
    rival: 'AYB VS AMIGOS DEL FÚTBOL',
    estadio: 'LA GRANJA',
    confirmado: true,
    tipoPartido: 'Amistoso'
  }
]

// Eventos futuros: fin de diciembre 2025 y enero 2026
export const eventosEnero2026: EventoCalendario[] = [
  {
    id: 'dic-fut-1',
    fecha: '2025-12-29',
    dia: 'LUNES',
    diaMes: 29,
    mes: 'DICIEMBRE',
    tipo: 'entrenamiento',
    actividad: 'HONOR/PRIMERA vs SERIE 35',
    estadio: 'ESTADIO ANFA CURICO',
    horaInicio: '22:00',
    llevar: '2.000',
    confirmado: true
  },
  {
    id: 'ene-evento-1',
    fecha: '2026-01-10',
    dia: 'SÁBADO',
    diaMes: 10,
    mes: 'ENERO',
    tipo: 'evento',
    titulo: 'Jornada Deportiva Azul y Blanco - Curicó',
    descripcion: 'Jornada deportiva especial para la presentación de la Serie 35 y apertura para nuevos refuerzos 2026. Una instancia para fortalecer nuestro proyecto deportivo entre todos.',
    estadio: 'Cancha Isla, Convento Viejo',
    horaInicio: '09:30',
    horaFin: '13:00',
    series: ['Serie 35', 'Serie Honor', 'Serie Primera'],
    precioEntrada: '2.000',
    edadGratis: 'Niños menores de 12 años',
    confirmado: true
  },
  {
    id: 'ene-3',
    fecha: '2026-01-12',
    dia: 'LUNES',
    diaMes: 12,
    mes: 'ENERO',
    tipo: 'partido',
    rival: 'AYB VS REAL AMATEURS',
    estadio: 'LA GRANJA',
    horaInicio: '16:30',
    confirmado: true,
    tipoPartido: 'Copa'
  },
  {
    id: 'ene-4',
    fecha: '2026-01-14',
    dia: 'MIÉRCOLES',
    diaMes: 14,
    mes: 'ENERO',
    tipo: 'partido',
    rival: 'Juventud Aguas N. vs Serie 35 AyB',
    estadio: 'AGUAS NEGRAS',
    horaInicio: '21:00',
    confirmado: true,
    tipoPartido: 'Amistoso'
  },
  {
    id: 'ene-4b',
    fecha: '2026-01-14',
    dia: 'MIÉRCOLES',
    diaMes: 14,
    mes: 'ENERO',
    tipo: 'partido',
    rival: 'Juventud Aguas N. vs Serie Honor',
    estadio: 'AGUAS NEGRAS',
    horaInicio: '22:00',
    confirmado: true,
    tipoPartido: 'Amistoso'
  },
  {
    id: 'ene-4c',
    fecha: '2026-01-17',
    dia: 'SÁBADO',
    diaMes: 17,
    mes: 'ENERO',
    tipo: 'partido',
    rival: 'Serie Honor vs Serie 35',
    estadio: 'CONVENTO VIEJO',
    horaInicio: '09:30',
    descripcion: '45 minutos por tiempo',
    confirmado: true,
    tipoPartido: 'Amistoso'
  },
  {
    id: 'ene-4d',
    fecha: '2026-01-17',
    dia: 'SÁBADO',
    diaMes: 17,
    mes: 'ENERO',
    tipo: 'partido',
    rival: 'Serie Primera vs Juv. Aguas Negras',
    estadio: 'CONVENTO VIEJO',
    horaInicio: '11:45',
    confirmado: true,
    tipoPartido: 'Amistoso'
  }

]

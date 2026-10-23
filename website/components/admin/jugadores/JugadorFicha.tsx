'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JugadorCompleto } from '@/types/database';
import { codigoPais } from '@/lib/jugadores/paises';
import Bandera from '@/components/ui/bandera';
import { FichaPersona } from '@/app/series/_components/FichaPersona';
import { recorteDe } from '@/lib/contenido/foco';
import { formatearFecha } from '@/components/admin/ui';
import EstadoJugadorBadge from './EstadoJugadorBadge';
import { User, Shield, Mail, Heart, Calendar, MapPin, Phone, Edit, Trash2 } from 'lucide-react';

interface Props {
  jugador: JugadorCompleto | null;
  open: boolean;
  onClose: () => void;
  onEditar: (jugador: JugadorCompleto) => void;
  onEliminar: (jugador: JugadorCompleto) => void;
}

// Primer nombre; los apellidos ya vienen con paterno y materno (igual que la página pública)
function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? nombre;
}

const formatDate = (date: string | null) =>
  date ? formatearFecha(date, { day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('/', '-') : '-';

export default function JugadorFicha({ jugador, open, onClose, onEditar, onEliminar }: Props) {
  if (!jugador) return null;

  const pais = codigoPais(jugador.nacionalidad);

  const calcularEdad = (fechaNacimiento: string | null) => {
    if (!fechaNacimiento) return '-';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="flex gap-4 sm:gap-6">
          <div className="w-36 shrink-0 sm:w-44">
            <FichaPersona
              foto={jugador.foto_url}
              alt={jugador.nombre_completo}
              nombre={primerNombre(jugador.nombre)}
              apellidos={jugador.apellidos}
              recorte={recorteDe(jugador.foto_foco_x, jugador.foto_foco_y, jugador.foto_foco_ancho)}
              detalle={jugador.posiciones_abr.slice(0, 2).join(' · ')}
              marca={pais && <Bandera codigo={pais} className="h-3 w-[18px] md:h-3.5 md:w-[21px]" />}
            >
              {jugador.dorsal != null && (
                <span className="absolute top-3 left-4 font-heading font-black text-5xl leading-none text-white/90 drop-shadow md:text-6xl">
                  {jugador.dorsal}
                </span>
              )}
              {jugador.estado !== 'Activo' && (
                <span className="absolute top-3 right-3 rounded-full bg-gray-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {jugador.estado}
                </span>
              )}
            </FichaPersona>
            <p className="mt-2 text-xs text-gray-500">Así se ve en la página de la serie.</p>
          </div>

          <div className="min-w-0 flex-1 space-y-3 pt-1">
            <DialogHeader className="text-left">
              <DialogTitle className="flex flex-wrap items-center gap-2 pr-8 font-heading text-2xl font-bold text-azul-primario sm:text-3xl">
                {jugador.nombre_completo}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              {jugador.categoria ? `Serie ${jugador.categoria}` : 'Sin serie'}
              {jugador.dorsal != null && <span className="font-mono font-bold text-azul-primario"> · #{jugador.dorsal}</span>}
            </p>
            <EstadoJugadorBadge estado={jugador.estado} />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => onEditar(jugador)}>
                <Edit /> Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEliminar(jugador)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 /> Eliminar
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="personal" className="w-full mt-6">
          <TabsList className="grid h-auto w-full grid-cols-4">
            <TabsTrigger value="personal" className="px-1 text-xs sm:px-4 sm:text-sm">
              <User className="mr-2 hidden h-4 w-4 sm:block" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="deportiva" className="px-1 text-xs sm:px-4 sm:text-sm">
              <Shield className="mr-2 hidden h-4 w-4 sm:block" />
              Deportiva
            </TabsTrigger>
            <TabsTrigger value="contacto" className="px-1 text-xs sm:px-4 sm:text-sm">
              <Mail className="mr-2 hidden h-4 w-4 sm:block" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="medica" className="px-1 text-xs sm:px-4 sm:text-sm">
              <Heart className="mr-2 hidden h-4 w-4 sm:block" />
              Médica
            </TabsTrigger>
          </TabsList>

          {/* Tab Personal */}
          <TabsContent value="personal" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <InfoField
                label="Nombre"
                value={jugador.nombre}
                icon={<User className="h-4 w-4" />}
              />
              <InfoField
                label="Apellidos"
                value={jugador.apellidos}
                icon={<User className="h-4 w-4" />}
              />
              <InfoField
                label="Fecha de Nacimiento"
                value={formatDate(jugador.fecha_nacimiento)}
                icon={<Calendar className="h-4 w-4" />}
                sublabel={calcularEdad(jugador.fecha_nacimiento)}
              />
              <InfoField
                label="Nacionalidad"
                value={jugador.nacionalidad || '-'}
                icon={<MapPin className="h-4 w-4" />}
                adorno={pais && <Bandera codigo={pais} />}
              />
              <InfoField label="DNI/NIE" value={jugador.dni || '-'} />
            </div>
          </TabsContent>

          {/* Tab Deportiva */}
          <TabsContent value="deportiva" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <InfoField
                label="Equipo"
                value={jugador.categoria || '-'}
                icon={<Shield className="h-4 w-4" />}
              />
              <InfoField
                label={(jugador.posiciones?.length ?? 1) > 1 ? 'Posiciones' : 'Posición'}
                value={(jugador.posiciones?.length ? jugador.posiciones : [jugador.posicion]).filter(Boolean).join(', ') || 'Por definir'}
                icon={<Shield className="h-4 w-4" />}
              />
              <InfoField label="Dorsal" value={jugador.dorsal?.toString() || '-'} />
              <InfoField label="Pie Preferido" value={jugador.pie_preferido || '-'} />
              <InfoField
                label="Altura"
                value={jugador.altura_cm ? `${jugador.altura_cm} cm` : '-'}
              />
              <InfoField
                label="Peso"
                value={jugador.peso_kg ? `${jugador.peso_kg} kg` : '-'}
              />
            </div>
          </TabsContent>

          {/* Tab Contacto */}
          <TabsContent value="contacto" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <InfoField
                label="Email"
                value={jugador.email || '-'}
                icon={<Mail className="h-4 w-4" />}
              />
              <InfoField
                label="Teléfono"
                value={jugador.telefono || '-'}
                icon={<Phone className="h-4 w-4" />}
              />
              <div className="sm:col-span-2">
                <InfoField
                  label="Dirección"
                  value={jugador.direccion || '-'}
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab Médica */}
          <TabsContent value="medica" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <InfoField
                label="Tipo de Sangre"
                value={jugador.tipo_sangre || '-'}
                icon={<Heart className="h-4 w-4" />}
              />
              <InfoField
                label="Contacto de Emergencia"
                value={jugador.contacto_emergencia || '-'}
                icon={<User className="h-4 w-4" />}
              />
              <InfoField
                label="Teléfono de Emergencia"
                value={jugador.telefono_emergencia || '-'}
                icon={<Phone className="h-4 w-4" />}
              />
              <div className="sm:col-span-2">
                <InfoField
                  label="Alergias"
                  value={jugador.alergias || 'Ninguna registrada'}
                />
              </div>
              <div className="sm:col-span-2">
                <InfoField
                  label="Lesiones Crónicas"
                  value={jugador.lesiones_cronicas || 'Ninguna registrada'}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function InfoField({
  label,
  value,
  icon,
  sublabel,
  adorno,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  sublabel?: string;
  adorno?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon}
        <span>{label}</span>
      </div>
      <p className="flex items-center gap-2 break-words text-base text-gray-900 pl-6">
        {adorno}
        {value}
      </p>
      {sublabel && <p className="text-sm text-gray-500 pl-6">{sublabel}</p>}
    </div>
  );
}

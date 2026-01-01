'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JugadorCompleto } from '@/types/database';
import { User, Shield, Mail, Heart, Calendar, MapPin, Phone } from 'lucide-react';

interface Props {
  jugador: JugadorCompleto | null;
  open: boolean;
  onClose: () => void;
}

export default function JugadorFicha({ jugador, open, onClose }: Props) {
  if (!jugador) return null;

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-3xl text-azul-primario mb-2">
                {jugador.nombre_completo}
              </DialogTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant={jugador.estado === 'Activo' ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  {jugador.estado}
                </Badge>
                <span className="text-sm text-gray-600">
                  {jugador.categoria}
                </span>
                {jugador.dorsal && (
                  <span className="text-2xl font-bold font-mono text-azul-primario">
                    #{jugador.dorsal}
                  </span>
                )}
              </div>
            </div>
            {jugador.foto_url && (
              <img
                src={jugador.foto_url}
                alt={jugador.nombre_completo}
                className="w-24 h-24 rounded-full object-cover border-4 border-azul-primario"
              />
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="deportiva">
              <Shield className="h-4 w-4 mr-2" />
              Deportiva
            </TabsTrigger>
            <TabsTrigger value="contacto">
              <Mail className="h-4 w-4 mr-2" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="medica">
              <Heart className="h-4 w-4 mr-2" />
              Médica
            </TabsTrigger>
          </TabsList>

          {/* Tab Personal */}
          <TabsContent value="personal" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-6">
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
              />
              <InfoField label="DNI/NIE" value={jugador.dni || '-'} />
            </div>
          </TabsContent>

          {/* Tab Deportiva */}
          <TabsContent value="deportiva" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-6">
              <InfoField
                label="Equipo"
                value={jugador.categoria || '-'}
                icon={<Shield className="h-4 w-4" />}
              />
              <InfoField
                label="Posición"
                value={`${jugador.posicion} (${jugador.posicion_abr})`}
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
            <div className="grid grid-cols-2 gap-6">
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
              <div className="col-span-2">
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
            <div className="grid grid-cols-2 gap-6">
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
              <div className="col-span-2">
                <InfoField
                  label="Alergias"
                  value={jugador.alergias || 'Ninguna registrada'}
                />
              </div>
              <div className="col-span-2">
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
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  sublabel?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-base text-gray-900 pl-6">{value}</p>
      {sublabel && <p className="text-sm text-gray-500 pl-6">{sublabel}</p>}
    </div>
  );
}

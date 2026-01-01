'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jugadorSchema, type JugadorFormData } from '@/lib/validations/jugador';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { JugadorCompleto, Equipo, Posicion } from '@/types/database';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  jugador: JugadorCompleto | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function JugadorForm({ jugador, onSave, onCancel }: Props) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JugadorFormData>({
    resolver: zodResolver(jugadorSchema),
    defaultValues: jugador
      ? {
          nombre: jugador.nombre,
          apellidos: jugador.apellidos,
          equipo_id: jugador.equipo_id,
          posicion_id: jugador.posicion_id,
          dorsal: jugador.dorsal,
          fecha_nacimiento: jugador.fecha_nacimiento,
          nacionalidad: jugador.nacionalidad || 'España',
          dni: jugador.dni,
          foto_url: jugador.foto_url,
          altura_cm: jugador.altura_cm,
          peso_kg: jugador.peso_kg,
          pie_preferido: jugador.pie_preferido,
          email: jugador.email,
          telefono: jugador.telefono,
          direccion: jugador.direccion,
          tipo_sangre: jugador.tipo_sangre,
          alergias: jugador.alergias,
          contacto_emergencia: jugador.contacto_emergencia,
          telefono_emergencia: jugador.telefono_emergencia,
          lesiones_cronicas: jugador.lesiones_cronicas,
          estado: jugador.estado,
          activo: jugador.activo,
        }
      : {
          nacionalidad: 'España',
          estado: 'Activo',
          activo: true,
          equipo_id: undefined,
          posicion_id: undefined,
        },
  });

  // Cargar equipos y posiciones
  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      try {
        const [equiposRes, posicionesRes] = await Promise.all([
          fetch('/api/equipos'), // Sin filtro de temporada para obtener todos los equipos activos
          fetch('/api/equipos?tipo=posiciones'),
        ]);

        const equiposData = await equiposRes.json();
        const posicionesData = await posicionesRes.json();

        console.log('Equipos loaded:', equiposData);
        console.log('Posiciones loaded:', posicionesData);

        setEquipos(equiposData.data || []);
        setPosiciones(posicionesData.data || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  const onSubmit = async (data: JugadorFormData) => {
    console.log('Submitting form with data:', data);
    setLoading(true);

    try {
      const url = jugador ? `/api/jugadores/${jugador.id}` : '/api/jugadores';
      const method = jugador ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al guardar jugador');
      }

      toast.success(jugador ? 'Jugador actualizado correctamente' : 'Jugador creado correctamente');
      onSave();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar jugador');
    } finally {
      setLoading(false);
    }
  };

  // Log de errores de validación
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Errores de validación:', errors);
      const primerError = Object.values(errors)[0];
      if (primerError?.message) {
        toast.error(`Error de validación: ${primerError.message}`);
      }
    }
  }, [errors]);

  if (loadingData) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="deportiva">Deportiva</TabsTrigger>
          <TabsTrigger value="contacto">Contacto</TabsTrigger>
          <TabsTrigger value="medica">Médica</TabsTrigger>
        </TabsList>

        {/* Tab Personal */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...register('nombre')} />
              {errors.nombre && (
                <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="apellidos">Apellidos *</Label>
              <Input id="apellidos" {...register('apellidos')} />
              {errors.apellidos && (
                <p className="text-sm text-red-500 mt-1">{errors.apellidos.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input type="date" id="fecha_nacimiento" {...register('fecha_nacimiento')} />
            </div>
            <div>
              <Label htmlFor="nacionalidad">Nacionalidad</Label>
              <Input id="nacionalidad" {...register('nacionalidad')} />
            </div>
            <div>
              <Label htmlFor="dni">DNI/NIE</Label>
              <Input id="dni" {...register('dni')} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="foto_url">URL de Foto</Label>
              <Input
                id="foto_url"
                type="url"
                placeholder="https://..."
                {...register('foto_url')}
              />
              {errors.foto_url && (
                <p className="text-sm text-red-500 mt-1">{errors.foto_url.message}</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab Deportiva */}
        <TabsContent value="deportiva" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipo_id">Equipo *</Label>
              <Select
                value={watch('equipo_id')?.toString() || ''}
                onValueChange={(value) => {
                  setValue('equipo_id', parseInt(value), { shouldValidate: true });
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent>
                  {equipos.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-gray-500">No hay equipos disponibles</div>
                  ) : (
                    equipos.map((equipo) => (
                      <SelectItem key={equipo.id} value={equipo.id.toString()}>
                        {equipo.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.equipo_id && (
                <p className="text-sm text-red-500 mt-1">{errors.equipo_id.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="posicion_id">Posición *</Label>
              <Select
                value={watch('posicion_id')?.toString() || ''}
                onValueChange={(value) => {
                  setValue('posicion_id', parseInt(value), { shouldValidate: true });
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecciona una posición" />
                </SelectTrigger>
                <SelectContent>
                  {posiciones.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-gray-500">No hay posiciones disponibles</div>
                  ) : (
                    posiciones.map((posicion) => (
                      <SelectItem key={posicion.id} value={posicion.id.toString()}>
                        {posicion.nombre} ({posicion.abreviatura})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.posicion_id && (
                <p className="text-sm text-red-500 mt-1">{errors.posicion_id.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="dorsal">Dorsal</Label>
              <Input
                id="dorsal"
                type="number"
                min="1"
                max="99"
                {...register('dorsal', { valueAsNumber: true })}
              />
              {errors.dorsal && (
                <p className="text-sm text-red-500 mt-1">{errors.dorsal.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="pie_preferido">Pie Preferido</Label>
              <Select
                value={watch('pie_preferido') || ''}
                onValueChange={(value) =>
                  setValue('pie_preferido', value as 'Derecho' | 'Izquierdo' | 'Ambidiestro')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Derecho">Derecho</SelectItem>
                  <SelectItem value="Izquierdo">Izquierdo</SelectItem>
                  <SelectItem value="Ambidiestro">Ambidiestro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="altura_cm">Altura (cm)</Label>
              <Input
                id="altura_cm"
                type="number"
                min="100"
                max="250"
                {...register('altura_cm', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="peso_kg">Peso (kg)</Label>
              <Input
                id="peso_kg"
                type="number"
                min="30"
                max="200"
                step="0.1"
                {...register('peso_kg', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={watch('estado') || 'Activo'}
                onValueChange={(value) =>
                  setValue('estado', value as 'Activo' | 'Lesionado' | 'Sancionado' | 'Inactivo')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Lesionado">Lesionado</SelectItem>
                  <SelectItem value="Sancionado">Sancionado</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Tab Contacto */}
        <TabsContent value="contacto" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" type="tel" {...register('telefono')} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea id="direccion" {...register('direccion')} rows={3} />
            </div>
          </div>
        </TabsContent>

        {/* Tab Médica */}
        <TabsContent value="medica" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_sangre">Tipo de Sangre</Label>
              <Input id="tipo_sangre" placeholder="A+, B-, O+, etc." {...register('tipo_sangre')} />
            </div>
            <div>
              <Label htmlFor="contacto_emergencia">Contacto de Emergencia</Label>
              <Input id="contacto_emergencia" {...register('contacto_emergencia')} />
            </div>
            <div>
              <Label htmlFor="telefono_emergencia">Teléfono de Emergencia</Label>
              <Input id="telefono_emergencia" type="tel" {...register('telefono_emergencia')} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Textarea id="alergias" {...register('alergias')} rows={2} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="lesiones_cronicas">Lesiones Crónicas</Label>
              <Textarea id="lesiones_cronicas" {...register('lesiones_cronicas')} rows={2} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Botones */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-azul-primario hover:bg-azul-oscuro" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : jugador ? (
            'Actualizar'
          ) : (
            'Crear Jugador'
          )}
        </Button>
      </div>
    </form>
  );
}

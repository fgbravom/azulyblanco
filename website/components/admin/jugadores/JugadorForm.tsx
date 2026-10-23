'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jugadorSchema, type JugadorFormData } from '@/lib/validations/jugador';
import { NACIONALIDADES, nombrePais, type Nacionalidad } from '@/lib/jugadores/paises';
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
import type { JugadorCompleto, EquipoPublico, Posicion } from '@/types/database';
import { Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { BarraAcciones } from '@/components/admin/ui';
import SelectorImagen from '@/components/admin/medios/SelectorImagen';
import Encuadre, { type MarcoEncuadre } from '@/components/admin/medios/Encuadre';
import { recorteDe, FOCO_ARRIBA, type RecorteFoto } from '@/lib/contenido/foco';

/** Campo numérico opcional: vacío se guarda como null (valueAsNumber daba NaN y la validación fallaba) */
const numeroOpcional = (valor: unknown) => (valor === '' || valor == null ? null : Number(valor));

/** La cara se recorta para el avatar del admin; cada uno se ajusta por separado */
const MARCOS_CARA: MarcoEncuadre[] = [
  { etiqueta: 'Avatar', clase: 'aspect-square rounded-full', ancho: 'w-32' },
];

const MARCOS_FICHA: MarcoEncuadre[] = [
  // Ancho fijo como el avatar: así la vista previa no se estira a todo el ancho del diálogo
  { etiqueta: 'En la ficha de la serie', clase: 'aspect-[3/4] rounded-2xl', ancho: 'w-64', defecto: FOCO_ARRIBA },
];

interface Props {
  jugador: JugadorCompleto | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function JugadorForm({ jugador, onSave, onCancel }: Props) {
  const [equipos, setEquipos] = useState<EquipoPublico[]>([]);
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
          posiciones_ids: jugador.posiciones_ids ?? (jugador.posicion_id ? [jugador.posicion_id] : []),
          dorsal: jugador.dorsal,
          fecha_nacimiento: jugador.fecha_nacimiento,
          // Lo guardado antes del listado ("chilena", "peruano"...) se muestra como el país canónico
          nacionalidad: nombrePais(jugador.nacionalidad) ?? 'Chile',
          dni: jugador.dni,
          foto_url: jugador.foto_url,
          foto_foco_x: jugador.foto_foco_x,
          foto_foco_y: jugador.foto_foco_y,
          foto_foco_ancho: jugador.foto_foco_ancho,
          foto_cara_x: jugador.foto_cara_x,
          foto_cara_y: jugador.foto_cara_y,
          foto_cara_ancho: jugador.foto_cara_ancho,
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
          nacionalidad: 'Chile',
          estado: 'Activo',
          activo: true,
          equipo_id: undefined,
          posiciones_ids: [],
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
    setLoading(true);

    try {
      const url = jugador ? `/api/jugadores/${jugador.id}` : '/api/jugadores';
      const method = jugador ? 'PATCH' : 'POST';

      // Un campo vacío se guarda como null: Postgres rechaza '' en columnas de fecha
      const datos = Object.fromEntries(Object.entries(data).map(([campo, valor]) => [campo, valor === '' ? null : valor]));

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
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
      const primerError = Object.values(errors)[0];
      if (primerError?.message) {
        toast.error(`Error de validación: ${primerError.message}`);
      }
    }
  }, [errors]);

  // Recortes de la foto: null es "sin ajustar" y cada lugar usa su recorte automático.
  // La cara (avatar) y la ficha del plantel se mueven por separado.
  const fotoUrl = watch('foto_url') || null;
  const recorteCara = recorteDe(watch('foto_cara_x'), watch('foto_cara_y'), watch('foto_cara_ancho'));
  const recorteFicha = recorteDe(watch('foto_foco_x'), watch('foto_foco_y'), watch('foto_foco_ancho'));

  const setCara = (recorte: RecorteFoto | null) => {
    setValue('foto_cara_x', recorte?.x ?? null, { shouldDirty: true });
    setValue('foto_cara_y', recorte?.y ?? null, { shouldDirty: true });
    setValue('foto_cara_ancho', recorte?.ancho ?? null, { shouldDirty: true });
  };

  const setFicha = (recorte: RecorteFoto | null) => {
    setValue('foto_foco_x', recorte?.x ?? null, { shouldDirty: true });
    setValue('foto_foco_y', recorte?.y ?? null, { shouldDirty: true });
    setValue('foto_foco_ancho', recorte?.ancho ?? null, { shouldDirty: true });
  };

  const setFoto = (url: string | null) => {
    setValue('foto_url', url ?? '', { shouldValidate: true, shouldDirty: true });
    // Una foto nueva vuelve a los recortes automáticos
    setCara(null);
    setFicha(null);
  };

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
        <TabsList className="grid h-auto w-full grid-cols-4">
          <TabsTrigger value="personal" className="px-1 text-xs sm:px-4 sm:text-sm">Personal</TabsTrigger>
          <TabsTrigger value="deportiva" className="px-1 text-xs sm:px-4 sm:text-sm">Deportiva</TabsTrigger>
          <TabsTrigger value="contacto" className="px-1 text-xs sm:px-4 sm:text-sm">Contacto</TabsTrigger>
          <TabsTrigger value="medica" className="px-1 text-xs sm:px-4 sm:text-sm">Médica</TabsTrigger>
        </TabsList>

        {/* Tab Personal */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <Select
                value={watch('nacionalidad') || ''}
                onValueChange={(value) =>
                  setValue('nacionalidad', value as Nacionalidad, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {NACIONALIDADES.map((pais) => (
                    <SelectItem key={pais} value={pais}>
                      {pais}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nacionalidad && (
                <p className="text-sm text-red-500 mt-1">{errors.nacionalidad.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="dni">DNI/NIE</Label>
              <Input id="dni" {...register('dni')} />
            </div>
            <div className="sm:col-span-2">
              <Label>Foto</Label>
              <SelectorImagen
                aspecto="cuadrado"
                className="mt-1.5"
                recorte={recorteCara}
                value={watch('foto_url')}
                onChange={setFoto}
              />
              {fotoUrl && (
                <>
                  <Encuadre
                    titulo="Encuadre de la cara"
                    url={fotoUrl}
                    recorte={recorteCara}
                    onChange={setCara}
                    onQuitar={() => setCara(null)}
                    marcos={MARCOS_CARA}
                  />
                  <Encuadre
                    titulo="Encuadre de la ficha"
                    url={fotoUrl}
                    recorte={recorteFicha}
                    onChange={setFicha}
                    onQuitar={() => setFicha(null)}
                    marcos={MARCOS_FICHA}
                  />
                </>
              )}
              {errors.foto_url && (
                <p className="text-sm text-red-500 mt-1">{errors.foto_url.message}</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab Deportiva */}
        <TabsContent value="deportiva" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Posiciones *</Label>
              <p className="text-xs text-gray-500 mt-0.5">
                Marca una o más. La primera es la principal: agrupa al jugador en la página de la serie. Usa la estrella para cambiarla.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {posiciones.length === 0 && <span className="text-sm text-gray-500">No hay posiciones disponibles</span>}
                {posiciones.map((posicion) => {
                  const seleccion = watch('posiciones_ids') ?? [];
                  const indice = seleccion.indexOf(posicion.id);
                  const activa = indice >= 0;
                  const principal = indice === 0;
                  const elegir = (ids: number[]) => setValue('posiciones_ids', ids, { shouldValidate: true, shouldDirty: true });
                  return (
                    <div
                      key={posicion.id}
                      className={cn(
                        'inline-flex items-center rounded-full border text-sm transition-colors',
                        activa ? 'border-azul-claro bg-azul-claro text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-azul-claro'
                      )}
                    >
                      <button
                        type="button"
                        aria-pressed={activa}
                        onClick={() => elegir(activa ? seleccion.filter((id) => id !== posicion.id) : [...seleccion, posicion.id])}
                        className="px-3 py-2 sm:py-1"
                      >
                        {posicion.nombre} <span className="opacity-70">({posicion.abreviatura})</span>
                      </button>
                      {activa && (
                        <button
                          type="button"
                          onClick={() => !principal && elegir([posicion.id, ...seleccion.filter((id) => id !== posicion.id)])}
                          aria-label={principal ? 'Posición principal' : `Hacer ${posicion.nombre} la posición principal`}
                          title={principal ? 'Posición principal' : 'Hacer principal'}
                          className={cn('-ml-1 mr-1 rounded-full p-1', principal ? 'cursor-default' : 'opacity-60 hover:opacity-100')}
                        >
                          <Star className={cn('h-3.5 w-3.5', principal && 'fill-current')} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.posiciones_ids && (
                <p className="text-sm text-red-500 mt-1">{errors.posiciones_ids.message}</p>
              )}
            </div>
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
              <Label htmlFor="dorsal">Dorsal</Label>
              <Input
                id="dorsal"
                type="number"
                min="1"
                max="99"
                {...register('dorsal', { setValueAs: numeroOpcional })}
              />
              {errors.dorsal && (
                <p className="text-sm text-red-500 mt-1">{errors.dorsal.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="altura_cm">Altura (cm)</Label>
              <Input
                id="altura_cm"
                type="number"
                min="100"
                max="250"
                {...register('altura_cm', { setValueAs: numeroOpcional })}
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
                {...register('peso_kg', { setValueAs: numeroOpcional })}
              />
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div className="sm:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea id="direccion" {...register('direccion')} rows={3} />
            </div>
          </div>
        </TabsContent>

        {/* Tab Médica */}
        <TabsContent value="medica" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div className="sm:col-span-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Textarea id="alergias" {...register('alergias')} rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="lesiones_cronicas">Lesiones Crónicas</Label>
              <Textarea id="lesiones_cronicas" {...register('lesiones_cronicas')} rows={2} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Botones */}
      <BarraAcciones dialogo className="sm:gap-4">
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
            'Guardar cambios'
          ) : (
            'Crear jugador'
          )}
        </Button>
      </BarraAcciones>
    </form>
  );
}

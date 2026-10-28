"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { JugadorCompleto } from "@/types/database";

export type AccionMasiva = "baja" | "reactivar" | "eliminar";

interface Props {
  accion: AccionMasiva | null;
  jugadores: JugadorCompleto[];
  procesando: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}

interface Resumen {
  cuotas: number;
  pagos: number;
  montoPagado: number;
}

const pesos = (n: number) => `$${n.toLocaleString("es-CL")}`;

export default function AccionMasivaDialog({
  accion,
  jugadores,
  procesando,
  onCancelar,
  onConfirmar,
}: Props) {
  return (
    <Dialog
      open={accion !== null && jugadores.length > 0}
      onOpenChange={(a) => !a && !procesando && onCancelar()}
    >
      <DialogContent role="alertdialog" className="max-w-md">
        {accion && (
          <Contenido
            accion={accion}
            jugadores={jugadores}
            procesando={procesando}
            onCancelar={onCancelar}
            onConfirmar={onConfirmar}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Vive dentro del DialogContent: al cerrarse se desmonta y el resumen y la
// casilla de confirmación empiezan de cero la próxima vez
function Contenido({
  accion,
  jugadores,
  procesando,
  onCancelar,
  onConfirmar,
}: Props & { accion: AccionMasiva }) {
  const [revision, setRevision] = useState<{
    resumen: Resumen | null;
    error: boolean;
  } | null>(null);
  const [entendido, setEntendido] = useState(false);

  const eliminar = accion === "eliminar";
  const clave = jugadores.map((j) => j.id).join(",");

  // Antes de eliminar se revisa qué cuotas y pagos se llevarían consigo
  useEffect(() => {
    if (!eliminar) return;

    let vigente = true;
    fetch(`/api/jugadores/masivo?ids=${clave}`)
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("revisión fallida")),
      )
      .then(
        (json) => vigente && setRevision({ resumen: json.data, error: false }),
      )
      .catch(() => vigente && setRevision({ resumen: null, error: true }));
    return () => {
      vigente = false;
    };
  }, [eliminar, clave]);

  const resumen = revision?.resumen ?? null;
  const errorResumen = revision?.error ?? false;
  const n = jugadores.length;
  const quien = n === 1 ? jugadores[0].nombre_completo : `${n} jugadores`;
  const conDatos =
    resumen !== null && (resumen.cuotas > 0 || resumen.pagos > 0);

  const titulo =
    accion === "reactivar"
      ? `¿Reactivar a ${quien}?`
      : accion === "baja"
        ? `¿Dar de baja a ${quien}?`
        : `¿Eliminar definitivamente a ${quien}?`;

  const bloqueado =
    procesando || (eliminar && (resumen === null || (conDatos && !entendido)));

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle className="text-xl text-azul-primario">
          {titulo}
        </DialogTitle>
        <DialogDescription>
          {accion === "reactivar" &&
            "Vuelven al plantel y a la página de su serie."}
          {accion === "baja" &&
            "Se quitan del plantel y de la página de su serie. Sus datos se conservan y se pueden reactivar."}
          {eliminar &&
            "Se borran de la base de datos y no se pueden recuperar."}
        </DialogDescription>
      </DialogHeader>

      {n > 1 && (
        <ul className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {jugadores.map((j) => (
            <li key={j.id}>
              {j.nombre_completo}
              {j.categoria && (
                <span className="text-gray-400"> · Serie {j.categoria}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {eliminar && (
        <div className="space-y-2 text-sm">
          {resumen === null && !errorResumen && (
            <p className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Revisando cuotas y
              pagos asociados...
            </p>
          )}
          {errorResumen && (
            <p className="rounded-lg bg-red-50 p-3 text-red-700">
              No se pudieron revisar las cuotas y pagos asociados, así que no se
              puede eliminar. Inténtalo de nuevo.
            </p>
          )}
          {resumen && !conDatos && (
            <p className="text-gray-600">
              No tienen cuotas ni pagos registrados.
            </p>
          )}
          {resumen && conDatos && (
            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
              <p>
                También se borrarán <strong>{resumen.cuotas} cuotas</strong> y{" "}
                <strong>{resumen.pagos} pagos</strong>
                {resumen.montoPagado > 0 && (
                  <> ({pesos(resumen.montoPagado)} aprobados)</>
                )}{" "}
                de su historial de cuotas.
              </p>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={entendido}
                  onChange={(e) => setEntendido(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-red-600"
                />
                <span>
                  Entiendo que se pierde ese historial y no se puede deshacer
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancelar} disabled={procesando}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirmar}
          disabled={bloqueado}
          className={
            accion === "reactivar"
              ? "bg-green-700 text-white hover:bg-green-800"
              : "bg-red-600 text-white hover:bg-red-700"
          }
        >
          {procesando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : accion === "reactivar" ? (
            "Reactivar"
          ) : accion === "baja" ? (
            "Dar de baja"
          ) : (
            "Eliminar definitivamente"
          )}
        </Button>
      </div>
    </>
  );
}

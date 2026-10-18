'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarraAcciones, Campo, textareaClass } from '@/components/admin/ui';

export const MOTIVO_MIN = 10;
export const MOTIVO_MAX = 500;

interface Props {
  /** Título de la noticia que se despublica */
  titulo: string;
  /** Recibe el motivo ya recortado; si lanza, el diálogo queda abierto */
  onConfirmar: (motivo: string) => Promise<void>;
  onCancelar: () => void;
}

/** Pide el motivo para pasar una noticia publicada a borrador. Se monta solo cuando hace falta. */
export default function MotivoDespublicacion({ titulo, onConfirmar, onCancelar }: Props) {
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const largo = motivo.trim().length;
  const valido = largo >= MOTIVO_MIN && largo <= MOTIVO_MAX;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    // El diálogo vive dentro del formulario del editor: que su envío no lo dispare también
    e.stopPropagation();
    if (!valido) return;
    setEnviando(true);
    try {
      await onConfirmar(motivo.trim());
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !enviando && onCancelar()}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-azul-primario">Despublicar noticia</DialogTitle>
          <DialogDescription className="line-clamp-2">
            «{titulo}» dejará de verse en el sitio. Cuéntale a la administración por qué.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-5">
          <Campo
            label="Motivo *"
            htmlFor="motivo-despublicacion"
            ayuda={`Mínimo ${MOTIVO_MIN} caracteres · ${largo}/${MOTIVO_MAX}`}
          >
            <textarea
              id="motivo-despublicacion"
              rows={4}
              autoFocus
              maxLength={MOTIVO_MAX}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className={textareaClass}
              placeholder="Por ejemplo: hay un dato incorrecto que debo corregir"
            />
          </Campo>
          <BarraAcciones dialogo>
            <Button type="button" variant="outline" onClick={onCancelar} disabled={enviando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valido || enviando}>
              {enviando && <Loader2 className="animate-spin" />}
              Despublicar
            </Button>
          </BarraAcciones>
        </form>
      </DialogContent>
    </Dialog>
  );
}

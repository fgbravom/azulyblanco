'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { JugadorCompleto } from '@/types/database';

interface Props {
  jugador: JugadorCompleto | null;
  eliminando: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export default function EliminarJugadorDialog({ jugador, eliminando, onCancelar, onConfirmar }: Props) {
  return (
    <Dialog open={jugador !== null} onOpenChange={(abierto) => !abierto && onCancelar()}>
      <DialogContent role="alertdialog" className="max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl text-azul-primario">¿Eliminar a {jugador?.nombre_completo}?</DialogTitle>
          <DialogDescription>
            Se quita del plantel y de la página de su serie. Sus datos se conservan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancelar} disabled={eliminando}>
            Cancelar
          </Button>
          <Button onClick={onConfirmar} disabled={eliminando} className="bg-red-600 text-white hover:bg-red-700">
            {eliminando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar jugador'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

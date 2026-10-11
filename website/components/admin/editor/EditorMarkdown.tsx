'use client';

import { useRef, useState } from 'react';
import { Bold, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Quote } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MDXRenderer } from '@/components/mdx/MDXRenderer';
import { cn } from '@/lib/utils';
import { textareaClass } from '@/components/admin/ui';
import Biblioteca from '@/components/admin/medios/Biblioteca';

const BOTONES = [
  { icono: Bold, titulo: 'Negrita' },
  { icono: Italic, titulo: 'Cursiva' },
  { icono: Heading2, titulo: 'Subtítulo' },
  { icono: List, titulo: 'Lista' },
  { icono: ListOrdered, titulo: 'Lista numerada' },
  { icono: Quote, titulo: 'Cita' },
  { icono: Link2, titulo: 'Enlace' },
  { icono: ImagePlus, titulo: 'Imagen' },
] as const;

interface Props {
  value: string;
  onChange: (valor: string) => void;
  filas?: number;
  placeholder?: string;
}

/** Editor de Markdown con barra de formato, inserción de imágenes y vista previa */
export default function EditorMarkdown({ value, onChange, filas = 18, placeholder }: Props) {
  const area = useRef<HTMLTextAreaElement>(null);
  const [vista, setVista] = useState<'escribir' | 'previa'>('escribir');
  const [eligiendoImagen, setEligiendoImagen] = useState(false);

  /** Envuelve la selección (o inserta un ejemplo) y deja el cursor en su lugar */
  const aplicar = (antes: string, despues = '', ejemplo = 'texto') => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: ini, selectionEnd: fin } = el;
    const seleccion = value.slice(ini, fin) || ejemplo;
    const nuevo = value.slice(0, ini) + antes + seleccion + despues + value.slice(fin);
    onChange(nuevo);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(ini + antes.length, ini + antes.length + seleccion.length);
    });
  };

  /** Antepone un prefijo a cada línea seleccionada */
  const prefijarLineas = (prefijo: (i: number) => string) => {
    const el = area.current;
    if (!el) return;
    const ini = value.lastIndexOf('\n', el.selectionStart - 1) + 1;
    const fin = el.selectionEnd;
    const bloque = value.slice(ini, fin) || 'elemento';
    const conPrefijo = bloque
      .split('\n')
      .map((linea, i) => prefijo(i) + linea)
      .join('\n');
    onChange(value.slice(0, ini) + conPrefijo + value.slice(fin));
    requestAnimationFrame(() => el.focus());
  };

  const insertarImagen = (url: string, nombre: string) => {
    const el = area.current;
    const pos = el?.selectionStart ?? value.length;
    const alt = nombre.replace(/\.[a-z0-9]+$/i, '');
    const bloque = `\n\n![${alt}](${url})\n\n`;
    onChange(value.slice(0, pos) + bloque + value.slice(pos));
    setEligiendoImagen(false);
  };

  const ejecutar = (titulo: (typeof BOTONES)[number]['titulo']) => {
    switch (titulo) {
      case 'Negrita': return aplicar('**', '**');
      case 'Cursiva': return aplicar('_', '_');
      case 'Subtítulo': return prefijarLineas(() => '## ');
      case 'Lista': return prefijarLineas(() => '- ');
      case 'Lista numerada': return prefijarLineas((i) => `${i + 1}. `);
      case 'Cita': return prefijarLineas(() => '> ');
      case 'Enlace': return aplicar('[', '](https://)', 'texto del enlace');
      case 'Imagen': return setEligiendoImagen(true);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-azul-primario focus-within:ring-2 focus-within:ring-azul-primario">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <div className="flex flex-wrap gap-0.5">
          {BOTONES.map(({ icono: Icono, titulo }) => (
            <button
              key={titulo}
              type="button"
              title={titulo}
              aria-label={titulo}
              disabled={vista === 'previa'}
              onClick={() => ejecutar(titulo)}
              className="rounded p-1.5 text-gray-600 hover:bg-white hover:text-azul-primario disabled:opacity-40"
            >
              <Icono className="h-4 w-4" />
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-md bg-gray-200/70 p-0.5 text-xs font-medium">
          {(['escribir', 'previa'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVista(v)}
              className={cn('rounded px-2.5 py-1', vista === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600')}
            >
              {v === 'escribir' ? 'Escribir' : 'Vista previa'}
            </button>
          ))}
        </div>
      </div>

      {vista === 'escribir' ? (
        <textarea
          ref={area}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={filas}
          placeholder={placeholder}
          className={cn(textareaClass, 'rounded-none border-0 font-mono text-[13px] leading-relaxed shadow-none focus-visible:ring-0')}
        />
      ) : (
        <div className="min-h-[300px] px-6 py-4">
          {value.trim() ? <MDXRenderer content={value} /> : <p className="text-sm text-gray-400">Nada que mostrar todavía.</p>}
        </div>
      )}

      <div className="border-t border-gray-100 bg-gray-50 px-3 py-1.5 text-[11px] text-gray-500">
        Formato Markdown: **negrita**, _cursiva_, ## subtítulo, - lista, &gt; cita. Deja una línea en blanco entre párrafos.
      </div>

      <Dialog open={eligiendoImagen} onOpenChange={setEligiendoImagen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-azul-primario">Insertar imagen</DialogTitle>
          </DialogHeader>
          {eligiendoImagen && <Biblioteca modo="seleccion" onSeleccionar={(m) => insertarImagen(m.url, m.nombre)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

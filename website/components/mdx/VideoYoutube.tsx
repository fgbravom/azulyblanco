interface Props {
  id: string;
  inicio?: number | null;
  titulo?: string;
}

/** Video de YouTube incrustado a todo el ancho, en 16:9 y sin cookies hasta reproducir */
export function VideoYoutube({ id, inicio, titulo }: Props) {
  const src = `https://www.youtube-nocookie.com/embed/${id}${inicio ? `?start=${inicio}` : ''}`;
  return (
    <div className="my-6 aspect-video w-full overflow-hidden rounded-lg bg-gray-900">
      <iframe
        src={src}
        title={titulo || 'Video de YouTube'}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  );
}

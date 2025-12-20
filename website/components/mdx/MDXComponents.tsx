import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import Image from 'next/image'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Encabezados
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold text-gray-900 mb-6 mt-8">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold text-azul-primario mb-4 mt-8 border-b-2 border-azul-primario pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold text-gray-800 mb-3 mt-6">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-semibold text-gray-700 mb-2 mt-4">{children}</h4>
    ),

    // Párrafos y texto
    p: ({ children }) => (
      <p className="text-lg leading-relaxed text-gray-700 mb-4">{children}</p>
    ),

    // Listas
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 ml-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700 ml-4">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-lg leading-relaxed">{children}</li>
    ),

    // Enlaces
    a: ({ href, children }) => (
      <Link
        href={href as string}
        className="text-azul-primario hover:text-azul-oscuro underline transition-colors font-medium"
      >
        {children}
      </Link>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-azul-primario bg-blue-50 pl-6 py-4 my-6 italic text-gray-800">
        {children}
      </blockquote>
    ),

    // Código
    code: ({ children }) => (
      <code className="bg-gray-100 text-azul-oscuro px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
        {children}
      </pre>
    ),

    // Línea horizontal
    hr: () => <hr className="my-8 border-t-2 border-gray-200" />,

    // Imágenes
    img: ({ src, alt }) => (
      <div className="my-8">
        <Image
          src={src as string}
          alt={alt || ''}
          width={800}
          height={600}
          className="rounded-lg shadow-lg w-full h-auto"
        />
      </div>
    ),

    // Texto en negrita y cursiva
    strong: ({ children }) => (
      <strong className="font-bold text-azul-oscuro">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-800">{children}</em>
    ),

    // Tablas
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-gray-300">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-azul-primario text-white">{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-gray-300">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left font-semibold">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2">{children}</td>
    ),

    ...components,
  }
}

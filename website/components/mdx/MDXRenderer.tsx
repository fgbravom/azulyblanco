'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

interface MDXRendererProps {
  content: string
}

export function MDXRenderer({ content }: MDXRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-10 leading-tight">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-azul-primario mb-4 mt-10 leading-snug">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-7 leading-snug">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-semibold text-gray-700 mb-2 mt-5">{children}</h4>
        ),
        p: ({ children }) => (
          <p className="text-base leading-relaxed text-gray-700 mb-5">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-outside space-y-2 mb-5 text-gray-700 ml-5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside space-y-2 mb-5 text-gray-700 ml-5">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-base leading-relaxed">{children}</li>
        ),
        a: ({ href, children }) => (
          <Link
            href={href as string}
            className="text-azul-primario hover:text-azul-oscuro underline underline-offset-2 transition-colors"
          >
            {children}
          </Link>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-azul-primario bg-blue-50 pl-5 py-3 my-6 text-gray-700 text-base leading-relaxed italic rounded-r-md">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isInline = !className
          if (isInline) {
            return (
              <code className="bg-gray-100 text-azul-oscuro px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            )
          }
          return (
            <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm">
              {children}
            </code>
          )
        },
        hr: () => <hr className="my-8 border-t border-gray-200" />,
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-700">{children}</em>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-gray-200 text-sm">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-azul-primario text-white">{children}</thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className="border-b border-gray-200 even:bg-gray-50">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-gray-700">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

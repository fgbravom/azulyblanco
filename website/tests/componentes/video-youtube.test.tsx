// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MDXRenderer } from '@/components/mdx/MDXRenderer'

const URL_VIDEO = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

describe('videos de YouTube en las noticias', () => {
  it('incrusta el video cuando el link está solo en su párrafo', () => {
    const { container } = render(<MDXRenderer content={`Mira el resumen:\n\n${URL_VIDEO}\n\nGracias.`} />)
    const iframe = container.querySelector('iframe')

    expect(iframe?.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('usa el texto del link como título y respeta el inicio', () => {
    const { container } = render(<MDXRenderer content={`[Final 2026](https://youtu.be/dQw4w9WgXcQ?t=75)`} />)
    const iframe = container.querySelector('iframe')

    expect(iframe?.getAttribute('title')).toBe('Final 2026')
    expect(iframe?.getAttribute('src')).toContain('?start=75')
  })

  it('deja como link normal un video citado dentro de una frase', () => {
    const { container } = render(<MDXRenderer content={`Revisa ${URL_VIDEO} cuando puedas.`} />)

    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByRole('link')).toHaveAttribute('href', URL_VIDEO)
  })
})

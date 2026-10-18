import { describe, expect, it } from 'vitest'
import { idVideoYoutube, inicioVideoYoutube } from '@/lib/youtube'

describe('links de YouTube', () => {
  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?v=dQw4w9WgXcQ&list=PL123',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ?si=abc',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/live/dQw4w9WgXcQ?feature=share',
    '  https://youtu.be/dQw4w9WgXcQ  ',
  ])('reconoce %s', (url) => {
    expect(idVideoYoutube(url)).toBe('dQw4w9WgXcQ')
  })

  it.each([
    'https://www.youtube.com/@club',
    'https://www.youtube.com/watch?v=corto',
    'https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ',
    'https://vimeo.com/123456',
    'javascript:alert(1)',
    'no es un link',
  ])('rechaza %s', (url) => {
    expect(idVideoYoutube(url)).toBeNull()
  })

  it('lee el segundo de inicio', () => {
    expect(inicioVideoYoutube('https://youtu.be/dQw4w9WgXcQ?t=90')).toBe(90)
    expect(inicioVideoYoutube('https://youtu.be/dQw4w9WgXcQ?t=1m30s')).toBe(90)
    expect(inicioVideoYoutube('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull()
  })
})

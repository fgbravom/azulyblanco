// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

const { PestanasSerie } = await import('@/app/series/_components/PestanasSerie')
const { TabsContent, TabsList, TabsTrigger } = await import('@/components/ui/tabs')

function renderPestanas(tieneTabla = true) {
  return render(
    <PestanasSerie tieneTabla={tieneTabla}>
      <TabsList>
        <TabsTrigger value="plantel">Plantel</TabsTrigger>
        {tieneTabla && <TabsTrigger value="posiciones">Tabla de posiciones</TabsTrigger>}
      </TabsList>
      <TabsContent value="plantel">contenido del plantel</TabsContent>
      {tieneTabla && <TabsContent value="posiciones">contenido de la tabla</TabsContent>}
    </PestanasSerie>,
  )
}

describe('PestanasSerie', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('muestra el plantel por defecto', () => {
    renderPestanas()
    expect(screen.getByText('contenido del plantel')).toBeInTheDocument()
    expect(screen.queryByText('contenido de la tabla')).toBeNull()
  })

  it('abre la pestaña que llega en ?tab=posiciones', () => {
    window.history.replaceState(null, '', '/series/primera?tab=posiciones')
    renderPestanas()
    expect(screen.getByText('contenido de la tabla')).toBeInTheDocument()
    expect(screen.queryByText('contenido del plantel')).toBeNull()
  })

  it('ignora ?tab=posiciones cuando la serie no tiene tabla publicada', () => {
    window.history.replaceState(null, '', '/series/primera?tab=posiciones')
    renderPestanas(false)
    expect(screen.getByText('contenido del plantel')).toBeInTheDocument()
    expect(screen.queryByText('contenido de la tabla')).toBeNull()
  })

  it('deja la URL compartible al cambiar de pestaña', () => {
    renderPestanas()
    // Radix Tabs selecciona la pestaña en mousedown, como al usar el mouse
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Tabla de posiciones' }))
    expect(window.location.search).toBe('?tab=posiciones')

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Plantel' }))
    expect(window.location.search).toBe('')
  })
})

# 🚀 Probar el Sitio AHORA MISMO

## El proyecto está 100% listo para probar

Todo el código está instalado y funcionando. Solo tienes que ejecutar un comando.

---

## Paso 1: Abrir Terminal

Abre una terminal (CMD, PowerShell, o la terminal integrada de VS Code) y navega a la carpeta del proyecto:

```bash
cd "c:\Users\Felipe Bravo\Biblioteca\Proyectos\Personales\azulyblanco\website"
```

---

## Paso 2: Iniciar el Servidor

Ejecuta:

```bash
npm run dev
```

Verás algo como:

```
▲ Next.js 16.0.0 (Turbopack)
- Local:        http://localhost:3000
✓ Ready in 2.2s
```

---

## Paso 3: Abrir en el Navegador

Abre tu navegador y ve a:

**http://localhost:3000**

---

## ✨ ¿Qué verás?

### Header (parte superior)
- Logo "AyB" (placeholder, reemplazar con tu escudo real)
- Navegación: Club | Equipos | Noticias | Partidos | Galería | Contacto
- Botón "Únete al Club"

### Hero Section (primera sección)
- Fondo degradado azul
- Círculo con "AyB" (logo placeholder)
- Título: **"Azul y Blanco"**
- Subtítulo: "Pasión Amateur desde 2010"
- Dos botones:
  - "Únete al Club" (blanco)
  - "Nuestra Historia" (outline)

### Sección "Últimas Noticias"
- 3 cards de noticias (contenido placeholder)
- Fondo gris claro
- Botón "Ver todas →"

### Sección "Próximo Partido"
- Card destacado con borde azul
- Muestra "Azul y Blanco vs Próximamente"
- Fecha: Sábado 26 de Octubre - 15:00hs
- Ubicación: Estadio Municipal
- Botón "Ver Calendario Completo"

### Call to Action Final
- Fondo azul sólido
- Texto: "¿Te gusta el fútbol?"
- Botón "Contáctanos"

### Footer (parte inferior)
- 4 columnas con información del club
- Logo + descripción
- Enlaces rápidos
- Información de contacto
- Redes sociales
- Copyright

---

## 🎨 Diseño

El sitio ya tiene aplicado:

- ✅ Colores del club (azul primario #0047AB)
- ✅ Tipografías profesionales (Montserrat + Open Sans)
- ✅ Diseño responsive (funciona en mobile, tablet, desktop)
- ✅ Componentes de shadcn/ui
- ✅ Animaciones suaves
- ✅ Layout completo (Header + Footer)

---

## 📝 Próximos Pasos (DESPUÉS de probar)

Una vez que veas el sitio funcionando, estos son los próximos pasos:

### 1. Configurar Supabase (15 minutos)
Para que funcionen las noticias, partidos y galería reales, necesitas:

1. Crear cuenta en https://supabase.com
2. Crear proyecto
3. Ejecutar el SQL de [supabase-schema.sql](supabase-schema.sql)
4. Copiar credenciales a `website/.env.local`

Ver instrucciones completas en [INICIO-RAPIDO.md](INICIO-RAPIDO.md)

### 2. Personalizar Contenido

Reemplazar el contenido placeholder con:

- Logo y escudo real del club
- Fotos de jugadores
- Historia del club
- Noticias reales
- Datos de partidos

### 3. Continuar Desarrollo

Seguir el plan de implementación de [propuesta-tecnica-nextjs.md](propuesta-tecnica-nextjs.md):

- Crear páginas restantes (Club/Historia, Equipos, etc.)
- Implementar sistema de noticias completo
- Crear galería de fotos
- Panel de administración

---

## 🛠️ Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Detener servidor
Ctrl + C

# Build de producción
npm run build

# Iniciar servidor de producción
npm run start

# Verificar errores
npm run lint
```

---

## 📁 Archivos Importantes

- `website/app/(pages)/page.tsx` - Página de inicio (la que estás viendo)
- `website/components/layout/Header.tsx` - Barra de navegación superior
- `website/components/layout/Footer.tsx` - Pie de página
- `website/app/globals.css` - Estilos globales
- `website/lib/constants.ts` - Configuración del sitio (EDITAR AQUÍ para cambiar datos)
- `website/.env.local` - Variables de entorno (agregar credenciales de Supabase aquí)

---

## 🎯 Personalización Rápida

### Cambiar año de fundación

Editar `website/lib/constants.ts`:

```typescript
founded: 2010, // Cambiar por el año real
```

### Cambiar información de contacto

En el mismo archivo `website/lib/constants.ts`:

```typescript
contact: {
  email: 'contacto@azulyblanco.com', // Tu email
  phone: '+54 9 11 1234-5678',       // Tu teléfono
  address: 'Calle Principal 123, Ciudad', // Tu dirección
},
```

### Agregar logo y escudo reales

1. Guarda tus imágenes en `website/public/images/`
   - `escudo.png` - Escudo del club
   - `logo.png` - Logo completo

2. El sitio las cargará automáticamente

---

## ❓ Problemas Comunes

### Puerto 3000 ya está en uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número] /F

# Luego volver a ejecutar
npm run dev
```

### Error de dependencias

```bash
# Reinstalar todas las dependencias
rm -rf node_modules package-lock.json
npm install
```

### Cambios no se ven reflejados

- Guardar el archivo (Ctrl + S)
- El servidor se recarga automáticamente
- Refrescar el navegador (F5)

---

## 📚 Documentación Completa

- [README.md](README.md) - Documentación general
- [INICIO-RAPIDO.md](INICIO-RAPIDO.md) - Guía paso a paso completa
- [propuesta-ux-ui-azulyblanco.md](propuesta-ux-ui-azulyblanco.md) - Diseño UX/UI
- [propuesta-tecnica-nextjs.md](propuesta-tecnica-nextjs.md) - Documentación técnica
- [supabase-schema.sql](supabase-schema.sql) - Script de base de datos

---

## 🎉 ¡Disfruta tu sitio web!

El proyecto base está completamente funcional. Ahora puedes:

1. ✅ Ver el sitio funcionando
2. ✅ Explorar el código
3. ✅ Personalizar el contenido
4. ✅ Continuar el desarrollo

**Siguiente paso recomendado:** Configurar Supabase para tener datos dinámicos reales.

---

**¿Tienes preguntas?** Revisa la documentación o pregúntame cualquier cosa sobre el proyecto.

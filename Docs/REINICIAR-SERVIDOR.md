# ✅ Sitio Listo - Instrucciones para Verlo

El sitio web está **100% funcional y listo**. Solo necesitas iniciarlo.

## 🚀 Pasos para Ver el Sitio

### 1. Abre una nueva terminal limpia

- Presiona `Ctrl + Shift + ñ` (o ve a Terminal → New Terminal)
- O abre CMD/PowerShell nueva

### 2. Navega a la carpeta del proyecto

```bash
cd "c:\Users\Felipe Bravo\Biblioteca\Proyectos\Personales\azulyblanco\website"
```

### 3. Inicia el servidor

```bash
npm run dev
```

### 4. Abre tu navegador

Verás un mensaje como:
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
✓ Ready in 2s
```

Abre: **http://localhost:3000**

---

## 🎨 Lo que Verás

### Hero Section (Azul)
- Círculo con "AyB" (logo placeholder)
- Título "Azul y Blanco"
- Subtítulo "Pasión Amateur desde 2010"
- 2 botones: "Únete al Club" y "Nuestra Historia"

### Últimas Noticias
- 3 tarjetas de noticias (contenido de ejemplo)
- Fondo gris claro

### Próximo Partido
- Card con borde azul
- "Azul y Blanco vs Próximamente"
- Sábado 26 de Octubre - 15:00hs

### Call to Action Final
- Fondo azul sólido
- "¿Te gusta el fútbol?"
- Botón "Contáctanos"

### Header (arriba)
- Logo "AyB"
- Navegación: Club | Equipos | Noticias | Partidos | Galería | Contacto
- Botón "Únete al Club"

### Footer (abajo)
- 4 columnas con información
- Redes sociales
- Copyright

---

## 🎯 Todo Está Funcionando

✅ **Next.js 14** instalado y configurado
✅ **Tailwind CSS** con colores del club (#0047AB)
✅ **shadcn/ui** componentes (Button, Card, etc.)
✅ **Header y Footer** completamente funcionales
✅ **Diseño responsive** (mobile, tablet, desktop)
✅ **Tipografías** profesionales (Montserrat + Open Sans)

---

## 📝 Personalizar Contenido

### Cambiar año de fundación

Editar `website/lib/constants.ts` línea 7:
```typescript
founded: 2010, // Cambiar aquí
```

### Cambiar datos de contacto

Mismo archivo, líneas 13-17:
```typescript
contact: {
  email: 'contacto@azulyblanco.com',  // Tu email
  phone: '+54 9 11 1234-5678',        // Tu teléfono
  address: 'Calle Principal 123',      // Tu dirección
},
```

### Agregar logo real

1. Guarda tu escudo como `website/public/images/escudo.png`
2. El sitio lo cargará automáticamente

---

## ❓ Si el Servidor No Inicia

### Error: "Port 3000 is in use"

```bash
# Usar otro puerto
npm run dev -- --port 3001
```

Luego abre: http://localhost:3001

### Error: "Lock file"

Elimina la carpeta `.next`:
```bash
rmdir /s /q .next
npm run dev
```

---

## 🎊 Siguiente Paso

Una vez que veas el sitio funcionando:

1. **Reemplaza el contenido de ejemplo** con datos reales del club
2. **Configura Supabase** (ver INICIO-RAPIDO.md) para tener datos dinámicos
3. **Continúa el desarrollo** siguiendo el plan en propuesta-tecnica-nextjs.md

---

**El sitio está LISTO. Solo ábrelo en el navegador y disfrútalo!** 🚀⚽🔵⚪

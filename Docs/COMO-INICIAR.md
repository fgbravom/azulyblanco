# ⚽ Cómo Iniciar el Sitio Web - Azul y Blanco

## ✅ TODO ESTÁ LISTO

El sitio web está 100% funcional. Solo necesitas iniciarlo.

---

## 🚀 OPCIÓN 1: Inicio Automático (RECOMENDADO)

### En PowerShell o CMD:

```bash
cd "C:\Users\Felipe Bravo\Biblioteca\Proyectos\Personales\azulyblanco\website"
```

Luego ejecuta UNO de estos:

**PowerShell:**
```powershell
.\iniciar-limpio.ps1
```

**CMD:**
```cmd
iniciar-limpio.bat
```

Esto limpiará procesos anteriores e iniciará el servidor.

---

## 🚀 OPCIÓN 2: Inicio Manual

### 1. Abre PowerShell o CMD

### 2. Navega a la carpeta:
```bash
cd "C:\Users\Felipe Bravo\Biblioteca\Proyectos\Personales\azulyblanco\website"
```

### 3. Si hay errores de "port in use" o "lock", ejecuta:

**Eliminar caché:**
```bash
rmdir /s /q .next
```

**Matar procesos (CMD):**
```bash
for /f "tokens=5" %a in ('netstat -aon ^| findstr ":3000"') do taskkill /F /PID %a
```

**Matar procesos (PowerShell):**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 4. Inicia el servidor:
```bash
npm run dev
```

---

## 🌐 Abrir en el Navegador

Después de ejecutar, verás:

```
▲ Next.js 16.0.0 (Turbopack)
- Local:        http://localhost:3000
✓ Ready in 2.2s
```

**Abre tu navegador en:** http://localhost:3000

Si usa puerto 3001: http://localhost:3001

---

## 🎨 Lo que Verás

### ✅ Header (arriba)
- Logo "AyB" (placeholder)
- Navegación: Club | Equipos | Noticias | Partidos | Galería | Contacto
- Botón "Únete al Club"

### ✅ Hero Section (Azul)
- Círculo con "AyB"
- Título "Azul y Blanco"
- Subtítulo "Pasión Amateur desde 2010"
- 2 botones blancos

### ✅ Últimas Noticias
- 3 cards de ejemplo
- Fondo gris claro

### ✅ Próximo Partido
- Card con borde azul
- "Azul y Blanco vs Próximamente"
- Info del partido de ejemplo

### ✅ Call to Action
- Fondo azul sólido
- "¿Te gusta el fútbol?"
- Botón "Contáctanos"

### ✅ Footer (abajo)
- 4 columnas de información
- Redes sociales
- Copyright

---

## 📝 Personalizar el Sitio

### Cambiar año de fundación:

Edita: `lib/constants.ts` línea 7

```typescript
founded: 2010,  // Cambia aquí
```

### Cambiar datos de contacto:

Mismo archivo, líneas 13-17:

```typescript
contact: {
  email: 'tu-email@azulyblanco.com',
  phone: '+54 9 11 XXXX-XXXX',
  address: 'Tu dirección real',
},
```

### Agregar logo real:

1. Guarda tu escudo como: `public/images/escudo.png`
2. Reinicia el servidor
3. ¡Listo! Se mostrará automáticamente

---

## ❓ Solución de Problemas

### Error: "Port 3000 is in use"

```bash
npm run dev -- --port 3001
```

Abre: http://localhost:3001

### Error: "Unable to acquire lock"

```bash
rmdir /s /q .next
npm run dev
```

### No se ven los cambios

1. Detén el servidor (Ctrl + C)
2. Borra caché: `rmdir /s /q .next`
3. Reinicia: `npm run dev`
4. Recarga el navegador (Ctrl + F5)

---

## 📚 Documentación Completa

- **[PROBAR-AHORA.md](../PROBAR-AHORA.md)** - Guía detallada
- **[INICIO-RAPIDO.md](../INICIO-RAPIDO.md)** - Configurar Supabase y deploy
- **[propuesta-ux-ui-azulyblanco.md](../propuesta-ux-ui-azulyblanco.md)** - Diseño UX/UI
- **[propuesta-tecnica-nextjs.md](../propuesta-tecnica-nextjs.md)** - Documentación técnica

---

## 🎊 ¡El Sitio Está LISTO!

✅ Next.js 14 configurado
✅ Tailwind CSS con colores del club
✅ shadcn/ui componentes instalados
✅ Header y Footer funcionales
✅ Diseño responsive completo
✅ Tipografías profesionales

**Siguiente paso:** Reemplazar el contenido de ejemplo con datos reales del Club Azul y Blanco.

**¿Necesitas ayuda?** Revisa la documentación o pregunta cualquier duda.

---

**¡Disfruta tu sitio web!** ⚽🔵⚪

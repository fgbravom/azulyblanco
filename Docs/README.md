# Documentación del Proyecto - Azul y Blanco

Bienvenido a la documentación completa del sitio web del Club Azul y Blanco.

---

## 📚 Índice de Documentación

### 🚀 Inicio Rápido
- **[INICIO-RAPIDO.md](./INICIO-RAPIDO.md)** - Guía de inicio rápido para desarrolladores
- **[COMO-INICIAR.md](./COMO-INICIAR.md)** - Instrucciones detalladas para configurar el proyecto
- **[PROBAR-AHORA.md](./PROBAR-AHORA.md)** - Cómo probar el sitio localmente
- **[REINICIAR-SERVIDOR.md](./REINICIAR-SERVIDOR.md)** - Guía para reiniciar el servidor de desarrollo

### 🎨 Diseño y Frontend
- **[propuesta-ux-ui-azulyblanco.md](./propuesta-ux-ui-azulyblanco.md)** - Propuesta de diseño UX/UI completa
- **[propuesta-tecnica-nextjs.md](./propuesta-tecnica-nextjs.md)** - Propuesta técnica con Next.js
- **[PAGINAS-CREADAS.md](./PAGINAS-CREADAS.md)** - Lista de páginas implementadas

### 🔐 Panel de Administración
- **[SETUP_ADMIN.md](./SETUP_ADMIN.md)** - Guía de configuración del panel administrativo
- **[ADMIN_COMPLETADO.md](./ADMIN_COMPLETADO.md)** - Estado de completitud del panel admin (44%)
- **[PASOS_VERIFICACION.md](./PASOS_VERIFICACION.md)** - Pasos para verificar el funcionamiento del admin

### 📅 Sesiones de Desarrollo
- **[SESION-31-DIC-2024.md](./SESION-31-DIC-2024.md)** - Implementación de Gestión de Jugadores y mejoras UI/UX

### 🗄️ Base de Datos
- **[supabase-schema-OLD.sql](./supabase-schema-OLD.sql)** - Schema original de Supabase (no utilizado)
- **Schema actual**: Ver `/database/schema.sql` (en uso)

---

## 🏗️ Estructura del Proyecto

```
azulyblanco/
├── Docs/                      # 📚 Documentación completa
│   ├── README.md             # Este archivo
│   ├── SETUP_ADMIN.md        # Guía del panel admin
│   ├── SESION-31-DIC-2024.md # Log de la última sesión
│   └── ...
├── database/                  # 🗄️ Esquemas de base de datos
│   ├── schema.sql            # Schema principal PostgreSQL
│   └── seeds-fixed.sql       # Datos de prueba
├── website/                   # 🌐 Aplicación Next.js
│   ├── app/                  # App Router de Next.js
│   │   ├── (admin)/         # Rutas del panel admin
│   │   └── ...
│   ├── components/          # Componentes React
│   │   ├── admin/          # Componentes del admin
│   │   └── ui/             # Componentes de UI (shadcn)
│   ├── lib/                # Utilidades y helpers
│   │   ├── auth/          # Sistema de autenticación
│   │   ├── data/          # Acceso a datos
│   │   ├── supabase/      # Clientes de Supabase
│   │   └── validations/   # Schemas de validación
│   └── types/             # Definiciones TypeScript
└── test-password.js       # Script de prueba de passwords
```

---

## 🎯 Estado Actual del Proyecto

### ✅ Completado
1. **Sitio Web Público**
   - Diseño y estructura completa
   - Páginas principales implementadas
   - Responsive design

2. **Panel de Administración** (44% completado)
   - ✅ Autenticación con password
   - ✅ Layout con sidebar
   - ✅ Dashboard básico
   - ✅ **Gestión de Jugadores (100%)**
     - CRUD completo
     - Formulario de 4 pestañas
     - Visualización de fichas
     - UI/UX coherente

### ⏳ En Progreso
- Gestión de Partidos
- Gestión de Estadísticas
- Gestión de Noticias/Galería

### 📊 Progreso General
**Panel Admin**: 44% (4 de 9 fases completadas)

---

## 🚀 Quick Start

### Requisitos Previos
- Node.js 18+
- npm o pnpm
- Cuenta de Supabase

### Instalación

```bash
# 1. Clonar el repositorio
git clone [url-del-repo]
cd azulyblanco

# 2. Instalar dependencias
cd website
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Ejecutar base de datos
# Ir a Supabase Dashboard → SQL Editor
# Ejecutar database/schema.sql
# Ejecutar database/seeds-fixed.sql

# 5. Iniciar servidor de desarrollo
npm run dev

# 6. Abrir navegador
# Sitio público: http://localhost:3000
# Panel admin: http://localhost:3000/admin
# Contraseña: asd123
```

---

## 🔐 Acceso al Panel Admin

- **URL**: http://localhost:3000/admin
- **Contraseña actual**: `asd123`
- **Duración de sesión**: 8 horas

### Funcionalidades Disponibles
- ✅ Dashboard con estadísticas
- ✅ Gestión completa de jugadores
  - Crear, editar, eliminar
  - Ver fichas completas
  - Formulario de 4 pestañas
- ⏳ Gestión de partidos (próximamente)
- ⏳ Gestión de estadísticas (próximamente)
- ⏳ Gestión de noticias (próximamente)

---

## 🎨 Identidad Visual

### Paleta de Colores
```css
azul-primario: #020280  /* Azul principal del club */
azul-oscuro: #01015A    /* Azul oscuro para hovers */
azul-claro: #0580FA     /* Azul claro para acentos */
```

### Tipografía
- **Headings**: Montserrat
- **Body**: Inter

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 16.1.0 (App Router)
- **React**: 19.2.0
- **Estilos**: Tailwind CSS v4
- **Componentes**: Radix UI + shadcn/ui
- **Validación**: Zod + React Hook Form
- **Notificaciones**: Sonner

### Backend
- **Base de Datos**: Supabase PostgreSQL
- **Autenticación**: bcryptjs + HTTP-only cookies
- **API**: Next.js Route Handlers

### DevOps
- **Hosting**: Vercel (recomendado)
- **Database**: Supabase Cloud

---

## 📖 Guías por Tema

### Para Desarrolladores
1. Leer [INICIO-RAPIDO.md](./INICIO-RAPIDO.md)
2. Seguir [COMO-INICIAR.md](./COMO-INICIAR.md)
3. Revisar [propuesta-tecnica-nextjs.md](./propuesta-tecnica-nextjs.md)

### Para Configurar el Admin
1. Leer [SETUP_ADMIN.md](./SETUP_ADMIN.md)
2. Seguir [PASOS_VERIFICACION.md](./PASOS_VERIFICACION.md)
3. Revisar [ADMIN_COMPLETADO.md](./ADMIN_COMPLETADO.md) para ver estado

### Para Diseñadores
1. Revisar [propuesta-ux-ui-azulyblanco.md](./propuesta-ux-ui-azulyblanco.md)
2. Ver [PAGINAS-CREADAS.md](./PAGINAS-CREADAS.md)

---

## 🐛 Problemas Conocidos y Soluciones

### 1. Equipos no cargan en formulario
**Solución**: Ya corregido en sesión del 31-dic-2024. El endpoint ahora devuelve todos los equipos activos sin filtro de temporada.

### 2. Hash de contraseña en .env
**Solución temporal**: Hash hardcodeado en `lib/auth/password.ts`
**Solución futura**: Migrar a Supabase Auth

### 3. RLS policies bloqueando escritura
**Solución temporal**: Service role client en `lib/supabase/admin.ts`
**Solución futura**: Ajustar RLS o migrar a Supabase Auth

---

## 📝 Changelog

### [31 Diciembre 2024]
- ✅ Implementada gestión completa de jugadores
- ✅ Agregada visualización de fichas de jugador
- ✅ Corregidos colores y legibilidad en UI
- ✅ Solucionado problema de carga de equipos
- ✅ Mejorada validación de formularios con toast

### [Versiones anteriores]
- Ver archivos individuales de sesiones

---

## 🤝 Contribuir

Para contribuir al proyecto:

1. Leer la documentación relevante
2. Seguir las convenciones de código establecidas
3. Mantener coherencia con la identidad visual del club
4. Actualizar documentación con cambios importantes

---

## 📧 Contacto

Para preguntas sobre el proyecto:
- Email del club: contacto@azulyblanco.com
- Repositorio: [URL del repositorio]

---

## 📄 Licencia

[Especificar licencia del proyecto]

---

**Última actualización**: 31 de Diciembre 2024
**Versión**: 0.4.4 (44% panel admin completado)
**Estado**: En desarrollo activo

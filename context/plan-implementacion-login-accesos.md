# 🔐 Plan de Implementación: Login y Control de Accesos Configurable

**Proyecto:** CRM para Clústeres Empresariales - XIXIM
**Módulo:** Sistema de Autenticación y Control de Accesos
**Versión:** 1.1  
**Fecha:** Febrero 2026  
**Duración estimada:** 2-3 semanas  
**Prioridad:** ALTA  
**Progreso:** ~40% implementado

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estado Actual](#estado-actual)
3. [Arquitectura Propuesta](#arquitectura-propuesta)
4. [Base de Datos](#base-de-datos)
5. [Plan de Implementación por Fases](#plan-de-implementación-por-fases)
6. [Estructura de Archivos](#estructura-de-archivos)
7. [Componentes y Páginas](#componentes-y-páginas)
8. [Servicios y Hooks](#servicios-y-hooks)
9. [Flujos de Usuario](#flujos-de-usuario)
10. [Checklist de Implementación](#checklist-de-implementación)
11. [Criterios de Aceptación](#criterios-de-aceptación)

---

## 1. Resumen Ejecutivo

Este plan detalla la implementación completa del **Sistema de Login y Control de Accesos Configurable** para el CRM, permitiendo:

- ✅ Gestión completa de usuarios con roles y permisos granulares
- ✅ Sistema de invitaciones para nuevos usuarios
- ✅ Login personalizable visualmente desde la UI
- ✅ Seguridad avanzada (intentos fallidos, bloqueo, 2FA)
- ✅ Auditoría completa de accesos y acciones
- ✅ Control de permisos por módulo y acción

### Objetivos Principales

1. **Autonomía:** Sistema 100% configurable sin tocar código
2. **Seguridad:** Protección contra ataques y accesos no autorizados
3. **Flexibilidad:** Permisos granulares personalizables por usuario
4. **Usabilidad:** Interfaz intuitiva para gestión de usuarios
5. **Branding:** Login personalizable con identidad del clúster

---

## 2. Estado Actual

### ✅ Ya Implementado (Según PRD)

- Autenticación con Supabase Auth
- Login básico con email/password
- Roles en BD: `super_admin`, `admin`, `editor`, `viewer`, `coordinador_cce`
- Row Level Security (RLS) configurado
- Gestión de sesiones con Supabase

### ❌ Pendiente de Implementar

| Funcionalidad | Prioridad | Estimación |
|---------------|-----------|------------|
| Sistema de permisos granulares | CRÍTICA | 3 días |
| Gestión de usuarios (UI) | CRÍTICA | 4 días |
| Sistema de invitaciones | ALTA | 3 días |
| Login personalizable | ALTA | 3 días |
| Seguridad avanzada (lockout, 2FA) | ALTA | 3 días |
| Auditoría de accesos | MEDIA | 2 días |

---

## 3. Arquitectura Propuesta

### 3.1 Modelo de Permisos de 3 Niveles

```
Nivel 1: Roles
├── super_admin      → Acceso total
├── admin            → Control de su organismo
├── editor           → Editar contenido
├── viewer           → Solo lectura
└── coordinador_cce  → Vista consolidada multi-organismo

Nivel 2: Módulos
├── organizaciones
├── empresas
├── admisiones
├── eventos
├── comunicacion
├── reportes
├── usuarios
├── configuracion
├── documentos
└── pagos

Nivel 3: Acciones por Módulo
├── create   → Crear nuevos registros
├── read     → Ver información
├── update   → Editar registros existentes
├── delete   → Eliminar registros
└── export   → Exportar datos
```

### 3.2 Flujo de Verificación de Permisos

```
Usuario solicita acción
    ↓
¿Es super_admin?
    ├── SÍ → Permitir
    └── NO → Continuar
        ↓
¿Tiene permisos personalizados?
    ├── SÍ → Usar permisos personalizados
    └── NO → Usar permisos del rol
        ↓
¿Tiene el permiso específico?
    ├── SÍ → Permitir
    └── NO → Denegar
```

---

## 4. Base de Datos

### 4.1 Nuevas Tablas a Crear

#### Tabla 1: `role_permissions`
Plantilla de permisos por defecto para cada rol.

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL,
  module TEXT NOT NULL,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT true,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, module)
);
```

**Permisos por defecto:**
- `super_admin`: Todos los permisos en todos los módulos
- `admin`: Control completo de su organismo
- `editor`: Crear y editar contenido
- `viewer`: Solo lectura
- `coordinador_cce`: Vista consolidada (solo lectura + export)

#### Tabla 2: `user_permissions`
Permisos personalizados que sobreescriben permisos del rol.

```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  module TEXT NOT NULL,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT true,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  scope TEXT DEFAULT 'own_org',
  specific_org_ids UUID[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  UNIQUE(user_id, module)
);
```

**Scopes:**
- `own_org`: Solo su propio organismo
- `all_orgs`: Todos los organismos
- `specific`: Organismos específicos (definidos en `specific_org_ids`)

#### Tabla 3: `user_invitations`
Sistema de invitaciones para nuevos usuarios.

```sql
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  invited_by UUID REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  custom_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);
```

#### Tabla 4: `login_config`
Configuración visual y de seguridad del login.

```sql
CREATE TABLE login_config (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) UNIQUE,

  -- Branding
  logo_url TEXT,
  background_image_url TEXT,
  background_color TEXT DEFAULT '#f3f4f6',
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#64748b',

  -- Textos
  welcome_message TEXT DEFAULT 'Bienvenido al Sistema CRM',
  subtitle TEXT,
  login_button_text TEXT DEFAULT 'Iniciar Sesión',
  footer_text TEXT,

  -- Seguridad
  enable_2fa BOOLEAN DEFAULT false,
  require_2fa BOOLEAN DEFAULT false,
  password_min_length INTEGER DEFAULT 8,
  password_require_uppercase BOOLEAN DEFAULT true,
  password_require_lowercase BOOLEAN DEFAULT true,
  password_require_numbers BOOLEAN DEFAULT true,
  password_require_symbols BOOLEAN DEFAULT false,
  max_login_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 30,
  session_timeout_minutes INTEGER DEFAULT 480,

  -- OAuth
  enable_google_login BOOLEAN DEFAULT false,
  enable_microsoft_login BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla 5: `login_attempts`
Registro de intentos de login para seguridad.

```sql
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  location_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla 6: `user_2fa`
Configuración de autenticación de dos factores.

```sql
CREATE TABLE user_2fa (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES profiles(id),
  secret TEXT NOT NULL,
  backup_codes TEXT[],
  enabled BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Funciones SQL Importantes

```sql
-- Verificar permiso de usuario
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_module TEXT,
  p_action TEXT
) RETURNS BOOLEAN;

-- Verificar bloqueo por intentos fallidos
CREATE OR REPLACE FUNCTION check_login_lockout(
  p_email TEXT,
  p_max_attempts INTEGER,
  p_lockout_minutes INTEGER
) RETURNS BOOLEAN;

-- Expirar invitaciones antiguas
CREATE OR REPLACE FUNCTION expire_old_invitations() RETURNS void;

-- Limpiar intentos de login antiguos
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts() RETURNS void;
```

### 4.3 Archivo de Migración

**Ubicación:** `/scripts/migrations/016_create_access_control_system.sql`

**Contenido:**
- ✅ Creación de 6 tablas nuevas
- ✅ Inserción de permisos por defecto
- ✅ Configuración de RLS para cada tabla
- ✅ Creación de funciones auxiliares
- ✅ Creación de triggers
- ✅ Configuración por defecto global

---

## 5. Plan de Implementación por Fases

### **FASE 1: Infraestructura de Base de Datos y Backend (Semana 1: Días 1-5)**

#### Día 1-2: Base de Datos
- [x] Crear script SQL `016_create_access_control_system.sql`
- [ ] Ejecutar migración en Supabase (Dev) ⚠️ PENDIENTE
- [ ] Verificar creación de tablas
- [ ] Probar políticas RLS
- [ ] Insertar datos de prueba
- [ ] Validar funciones SQL

**Entregables:**
- Script SQL completo y ejecutado
- Tablas creadas con RLS
- Permisos por defecto insertados

#### Día 3-4: Servicios Backend
- [x] Crear `hooks/useAuth.ts` ✅
- [x] Crear `hooks/usePermissions.ts` ✅
- [x] Crear `hooks/useLoginConfig.ts` ✅
- [x] Crear `lib/services/PermissionService.ts` ✅
- [x] Crear `lib/services/InvitationService.ts` ✅
- [x] Crear `lib/services/SecurityService.ts` ✅
- [ ] Crear tipos TypeScript en `types/permissions.ts`

**Entregables:**
- Hooks y servicios funcionales
- Tipos TypeScript completos
- Documentación de uso

#### Día 5: Componentes de Protección
- [x] Crear `components/auth/ProtectedRoute.tsx` ✅
- [x] Crear `components/auth/Can.tsx` ✅
- [ ] Crear `components/auth/withPermission.tsx` (HOC)
- [ ] Crear utilidades en `lib/utils/permissions.ts`
- [ ] Probar componentes de protección

**Entregables:**
- Componentes de protección funcionales
- Tests unitarios básicos

---

### **FASE 2: Gestión de Usuarios (Semana 1-2: Días 6-12)**

#### Día 6-8: Listado y Gestión de Usuarios
- [x] Crear página `/dashboard/usuarios/page.tsx` ✅ (tabla, filtros, búsqueda, acciones inline)
- [ ] Crear página `/dashboard/usuarios/[id]/page.tsx` (detalle + matriz de permisos)
- [ ] Crear componente `PermissionMatrix.tsx`
- [ ] Crear componente `UserActivityLog.tsx`

**Características:**
- Tabla con columnas: Nombre, Email, Rol, Organismo, Estado, Última conexión
- Filtros: Por rol, por organismo, por estado
- Búsqueda: Por nombre o email
- Acciones: Editar, Desactivar, Cambiar rol, Ver permisos

#### Día 9-10: Sistema de Invitaciones
- [x] Crear modal `InviteUserModal` (integrado en `/dashboard/usuarios`) ✅
- [x] Crear página `/invitacion/[token]/page.tsx` ✅
- [x] Implementar generación de tokens (vía BD) ✅
- [ ] Crear plantilla de email de invitación con SendGrid
- [ ] Integrar envío de emails automático
- [x] Manejar aceptación de invitación ✅

**Flujo de invitación:**
1. Admin abre modal de invitación
2. Completa: email, rol, organismo
3. Sistema envía email con link único
4. Invitado click en link → formulario de registro
5. Invitado completa: nombre, contraseña
6. Cuenta creada automáticamente

#### Día 11-12: Edición de Permisos
- [ ] Crear página `/dashboard/usuarios/[id]/page.tsx`
- [ ] Crear componente `PermissionMatrix.tsx`
- [ ] Crear componente `UserActivityLog.tsx`
- [ ] Implementar guardado de permisos personalizados
- [ ] Implementar vista de historial de usuario

**Matriz de permisos:**
```
Módulo          | Crear | Leer | Editar | Eliminar | Exportar
----------------|-------|------|--------|----------|----------
Organizaciones  |  [ ]  | [x]  |  [x]   |   [ ]    |   [x]
Empresas        |  [x]  | [x]  |  [x]   |   [x]    |   [x]
...
```

---

### **FASE 3: Personalización del Login (Semana 2: Días 13-17)**

#### Día 13-14: Configuración Visual
- [ ] Crear página `/dashboard/configuracion/login/page.tsx`
- [ ] Crear componente `LoginPreview.tsx`
- [ ] Crear componente `BrandingForm.tsx`
- [ ] Implementar upload de logo
- [ ] Implementar upload de imagen de fondo
- [ ] Implementar color pickers
- [ ] Preview en tiempo real

**Elementos configurables:**
- Logo del login
- Imagen de fondo
- Color de fondo
- Color primario (botones)
- Mensaje de bienvenida
- Subtítulo
- Texto del botón
- Texto del footer

#### Día 15-16: Configuración de Seguridad
- [ ] Crear tab "Seguridad" en configuración
- [ ] Formulario de requisitos de contraseña
- [ ] Configuración de intentos máximos
- [ ] Configuración de duración de bloqueo
- [ ] Configuración de timeout de sesión
- [ ] Toggle para habilitar 2FA

#### Día 17: Nueva Página de Login
- [x] Actualizar `/app/auth/login/page.tsx` ✅
- [x] Aplicar branding dinámico desde BD ✅
- [x] Implementar detección de bloqueo con indicador visual ✅
- [x] Toggle show/hide contraseña ✅
- [x] Link a recuperación de contraseña ✅
- [x] Diseño responsive y premium ✅
- [ ] Crear página `/auth/recuperar-contrasena`
- [ ] Crear página `/auth/restablecer-contrasena/[token]`

**Características:**
- Branding dinámico desde BD
- Validación según requisitos configurados
- Mensaje de cuenta bloqueada
- Link de recuperación de contraseña
- Diseño moderno y responsive

---

### **FASE 4: Seguridad Avanzada (Semana 3: Días 18-21)**

#### Día 18-19: Recuperación de Contraseña
- [ ] Crear página `/auth/recuperar-contrasena/page.tsx`
- [ ] Crear página `/auth/restablecer-contrasena/[token]/page.tsx`
- [ ] Implementar envío de email de recuperación
- [ ] Implementar validación de token
- [ ] Implementar cambio de contraseña
- [ ] Plantilla de email de recuperación

#### Día 20: Autenticación de Dos Factores (2FA)
- [ ] Instalar librería `otplib` o `speakeasy`
- [ ] Crear página `/dashboard/perfil/2fa/page.tsx`
- [ ] Generar código QR para 2FA
- [ ] Implementar verificación de código
- [ ] Generar códigos de backup
- [ ] Crear página `/auth/verificar-2fa/page.tsx`
- [ ] Integrar verificación en flujo de login

#### Día 21: Auditoría y Testing
- [ ] Implementar registro de acciones críticas
- [ ] Crear página `/dashboard/auditoria/page.tsx`
- [ ] Tabla de logs con filtros
- [ ] Exportar logs a CSV
- [ ] Testing de flujos completos
- [ ] Corrección de bugs
- [ ] Documentación de usuario

**Acciones a auditar:**
- Login / Logout
- Cambios de permisos
- Invitaciones enviadas
- Creación / Edición / Eliminación de usuarios
- Cambios en configuración de login
- Intentos de login fallidos

---

## 6. Estructura de Archivos

```
/crm-for-business-clusters
│
├── scripts/
│   └── migrations/
│       └── 016_create_access_control_system.sql ✅
│
├── hooks/
│   ├── usePermissions.ts ✅
│   ├── useAuth.ts (mejorar existente)
│   ├── useLoginConfig.ts
│   └── useInvitations.ts
│
├── lib/
│   ├── services/
│   │   ├── PermissionService.ts
│   │   ├── InvitationService.ts
│   │   ├── SecurityService.ts
│   │   └── LoginConfigService.ts
│   └── utils/
│       └── permissions.ts
│
├── types/
│   ├── permissions.ts
│   ├── auth.ts
│   └── invitations.ts
│
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx
│   │   ├── Can.tsx
│   │   ├── withPermission.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RecoverPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── TwoFactorForm.tsx
│   │
│   ├── users/
│   │   ├── UserTable.tsx
│   │   ├── UserFilters.tsx
│   │   ├── UserActionsMenu.tsx
│   │   ├── InviteUserModal.tsx
│   │   ├── PermissionMatrix.tsx
│   │   ├── UserActivityLog.tsx
│   │   └── UserStatusBadge.tsx
│   │
│   └── config/
│       ├── LoginPreview.tsx
│       ├── BrandingForm.tsx
│       ├── SecuritySettingsForm.tsx
│       └── ColorPicker.tsx
│
└── app/
    ├── auth/
    │   ├── login/
    │   │   └── page.tsx
    │   ├── recuperar-contrasena/
    │   │   └── page.tsx
    │   ├── restablecer-contrasena/
    │   │   └── [token]/
    │   │       └── page.tsx
    │   └── verificar-2fa/
    │       └── page.tsx
    │
    ├── invitacion/
    │   └── [token]/
    │       └── page.tsx
    │
    └── dashboard/
        ├── usuarios/
        │   ├── page.tsx
        │   └── [id]/
        │       └── page.tsx
        │
        ├── configuracion/
        │   ├── login/
        │   │   └── page.tsx
        │   └── seguridad/
        │       └── page.tsx
        │
        ├── auditoria/
        │   └── page.tsx
        │
        └── perfil/
            └── 2fa/
                └── page.tsx
```

---

## 7. Componentes y Páginas Detallados

### 7.1 Componentes de Protección

#### `ProtectedRoute`
Protege rutas completas basándose en permisos.

```tsx
<ProtectedRoute
  requiredModule="empresas"
  requiredAction="create"
  fallback={<NoAccess />}
>
  <CreateCompanyForm />
</ProtectedRoute>
```

#### `Can`
Componente condicional para mostrar UI según permisos.

```tsx
<Can module="empresas" action="delete">
  <DeleteButton />
</Can>

<Can module="reportes" action="export">
  <ExportButton />
</Can>
```

#### `withPermission` (HOC)
Higher-Order Component para proteger componentes.

```tsx
const ProtectedComponent = withPermission(
  MyComponent,
  'empresas',
  'create'
)
```

### 7.2 Páginas Principales

#### `/dashboard/usuarios`
**Listado de usuarios**

Características:
- Tabla con paginación
- Búsqueda en tiempo real
- Filtros: Rol, Organismo, Estado
- Acciones: Editar, Desactivar, Ver permisos
- Botón "Invitar Usuario"

#### `/dashboard/usuarios/[id]`
**Detalle y edición de usuario**

Tabs:
1. **General:** Información básica (nombre, email, rol, organismo)
2. **Permisos:** Matriz de permisos personalizables
3. **Actividad:** Historial de acciones del usuario

#### `/dashboard/configuracion/login`
**Configuración visual del login**

Secciones:
1. **Branding:** Upload de logo y fondo
2. **Colores:** Color pickers para fondo, botones
3. **Textos:** Mensaje bienvenida, subtítulo, botón
4. **Preview:** Vista previa en tiempo real

#### `/dashboard/configuracion/seguridad`
**Configuración de seguridad**

Opciones:
- Longitud mínima de contraseña
- Requisitos: mayúsculas, números, símbolos
- Máximo de intentos de login
- Duración de bloqueo
- Timeout de sesión
- Habilitar/Requerir 2FA

---

## 8. Servicios y Hooks

### 8.1 Hooks

#### `usePermissions()`
```typescript
const {
  checkPermission,     // (module, action) => boolean
  canAccess,          // (module) => boolean
  canCreate,          // (module) => boolean
  canUpdate,          // (module) => boolean
  canDelete,          // (module) => boolean
  canExport,          // (module) => boolean
  permissions,        // UserPermissions
  isLoading,          // boolean
  refreshPermissions  // () => Promise<void>
} = usePermissions()
```

#### `useLoginConfig(orgId?)`
```typescript
const {
  config,             // LoginConfig
  updateConfig,       // (config) => Promise<void>
  isLoading,          // boolean
  error              // Error | null
} = useLoginConfig()
```

#### `useInvitations()`
```typescript
const {
  sendInvitation,     // (data) => Promise<Invitation>
  acceptInvitation,   // (token, userData) => Promise<void>
  cancelInvitation,   // (id) => Promise<void>
  invitations,        // Invitation[]
  isLoading
} = useInvitations()
```

### 8.2 Servicios

#### `PermissionService`
```typescript
class PermissionService {
  static getUserPermissions(userId: string)
  static getRolePermissions(role: string)
  static updateUserPermissions(userId, permissions, createdBy)
  static checkPermission(userId, module, action)
  static copyRolePermissionsToUser(userId, role, createdBy)
}
```

#### `InvitationService`
```typescript
class InvitationService {
  static sendInvitation(data: InvitationData)
  static acceptInvitation(token: string, userData: UserData)
  static getInvitation(token: string)
  static cancelInvitation(id: string)
}
```

#### `SecurityService`
```typescript
class SecurityService {
  static recordLoginAttempt(email, success, ip)
  static checkLockout(email)
  static validatePasswordRequirements(password, config)
  static generate2FASecret()
  static verify2FACode(secret, code)
}
```

---

## 9. Flujos de Usuario

### 9.1 Invitar Nuevo Usuario

```
1. Admin → /dashboard/usuarios
2. Click "Invitar Usuario"
3. Modal: email, rol, organismo
4. [Opcional] Configurar permisos personalizados
5. Click "Enviar Invitación"
6. Sistema genera token único
7. Sistema envía email al invitado
8. Invitado recibe email con link
9. Invitado click → /invitacion/[token]
10. Formulario: nombre, contraseña
11. Click "Crear Cuenta"
12. Cuenta creada → Login automático
13. Redirige a dashboard
```

### 9.2 Cambiar Permisos de Usuario

```
1. Admin → /dashboard/usuarios
2. Click en usuario específico
3. Tab "Permisos"
4. Matriz de permisos (módulos x acciones)
5. Modificar checkboxes según necesidad
6. Click "Guardar Cambios"
7. Confirmación
8. Permisos actualizados
9. Se registra en audit_log
10. Usuario afectado verá cambios en próximo login
```

### 9.3 Login con Seguridad Avanzada

```
1. Usuario → /auth/login
2. Login personalizado (branding del clúster)
3. Ingresa email y contraseña
4. Sistema valida requisitos de contraseña
5. ¿Primera validación exitosa?
   ├─ NO → Incrementar contador
   │       ¿Excede máximo de intentos?
   │       ├─ SÍ → Bloquear cuenta (mensaje)
   │       └─ NO → Mostrar error, intentos restantes
   └─ SÍ → Continuar
6. ¿Usuario tiene 2FA habilitado?
   ├─ SÍ → Redirigir a /auth/verificar-2fa
   │       Ingresa código 2FA
   │       Valida código
   │       ¿Código válido?
   │       ├─ SÍ → Login exitoso
   │       └─ NO → Error, reintentar
   └─ NO → Login exitoso
7. Registrar en login_attempts
8. Registrar en audit_log
9. Redirigir a dashboard
```

### 9.4 Recuperar Contraseña

```
1. Usuario → /auth/login
2. Click "¿Olvidaste tu contraseña?"
3. → /auth/recuperar-contrasena
4. Ingresa email
5. Click "Enviar"
6. Sistema genera token único
7. Sistema envía email con link
8. Usuario recibe email
9. Click en link → /auth/restablecer-contrasena/[token]
10. Verifica que token sea válido
11. ¿Token válido?
    ├─ NO → Mensaje "Link inválido o expirado"
    └─ SÍ → Formulario nueva contraseña
12. Ingresa nueva contraseña
13. Valida requisitos de contraseña
14. Click "Cambiar Contraseña"
15. Contraseña actualizada
16. Mensaje de éxito
17. Redirige a /auth/login
```

### 9.5 Configurar 2FA

```
1. Usuario → /dashboard/perfil/2fa
2. ¿2FA ya habilitado?
   ├─ SÍ → Mostrar estado, opción de deshabilitar
   └─ NO → Continuar
3. Click "Habilitar 2FA"
4. Sistema genera secret único
5. Sistema genera código QR
6. Mostrar código QR
7. Usuario escanea con app (Google Authenticator, Authy)
8. Usuario ingresa código de verificación
9. Sistema valida código
10. ¿Código válido?
    ├─ NO → Error, reintentar
    └─ SÍ → 2FA habilitado
11. Sistema genera códigos de backup (10 códigos)
12. Mostrar códigos de backup
13. Usuario guarda códigos en lugar seguro
14. Click "Confirmar"
15. 2FA completamente configurado
16. Próximo login requerirá código 2FA
```

---

## 10. Checklist de Implementación

### 10.1 Base de Datos

- [ ] Script SQL `016_create_access_control_system.sql` creado
- [ ] Migración ejecutada en Supabase (Dev)
- [ ] Tablas creadas correctamente:
  - [ ] `role_permissions`
  - [ ] `user_permissions`
  - [ ] `user_invitations`
  - [ ] `login_config`
  - [ ] `login_attempts`
  - [ ] `user_2fa`
- [ ] Permisos por defecto insertados para cada rol
- [ ] RLS configurado y probado en todas las tablas
- [ ] Funciones SQL creadas y probadas:
  - [ ] `check_user_permission()`
  - [ ] `check_login_lockout()`
  - [ ] `expire_old_invitations()`
  - [ ] `cleanup_old_login_attempts()`
- [ ] Triggers creados para `updated_at`
- [ ] Índices creados para optimización

### 10.2 Backend (Servicios y Hooks)

- [x] Hook `useAuth.ts` creado ✅
- [x] Hook `usePermissions.ts` creado ✅
- [x] Hook `useLoginConfig.ts` creado ✅
- [x] Servicio `PermissionService.ts` creado ✅
- [x] Servicio `InvitationService.ts` creado ✅
- [x] Servicio `SecurityService.ts` creado ✅
- [ ] Tipos TypeScript definidos en `types/`
- [ ] Utilidades en `lib/utils/permissions.ts`

### 10.3 Componentes de Protección

- [x] Componente `ProtectedRoute` creado ✅
- [x] Componente `Can` creado ✅
- [ ] HOC `withPermission` creado
- [ ] Tests unitarios para componentes de protección

### 10.4 UI - Gestión de Usuarios

- [x] Página `/dashboard/usuarios` implementada ✅
- [x] Tabla de usuarios con búsqueda y filtros ✅
- [x] Modal `InviteUserModal` completo ✅
- [x] Página `/invitacion/[token]` funcional ✅
- [x] Cambio de rol desde la UI ✅
- [x] Activar/Desactivar usuarios ✅
- [x] Lista de invitaciones pendientes ✅
- [ ] Página `/dashboard/usuarios/[id]` con tabs (detalle)
- [ ] Componente `PermissionMatrix` interactivo
- [ ] Componente `UserActivityLog` con datos reales
- [ ] Email automático de invitación vía SendGrid

### 10.5 UI - Configuración de Login

- [ ] Página `/dashboard/configuracion/login` creada
- [ ] Componente `LoginPreview` con preview en tiempo real
- [ ] Upload de logo funcional
- [ ] Upload de imagen de fondo funcional
- [ ] Color pickers funcionales
- [ ] Formulario de textos personalizables
- [ ] Guardado de configuración funciona
- [ ] Tab "Seguridad" implementado
- [ ] Configuración de requisitos de contraseña
- [ ] Configuración de intentos máximos
- [ ] Configuración de bloqueo y timeout
- [ ] Toggle 2FA funcional

### 10.6 UI - Login y Autenticación

- [x] Página `/auth/login` actualizada con branding dinámico ✅
- [x] Detección de bloqueo por intentos fallidos ✅
- [x] Indicador visual de intentos restantes ✅
- [x] Toggle show/hide contraseña ✅
- [x] Link a recuperación de contraseña ✅
- [x] Diseño premium y responsive ✅
- [ ] Página `/auth/recuperar-contrasena` (envío de email)
- [ ] Página `/auth/restablecer-contrasena/[token]`
- [ ] Email de recuperación vía SendGrid
- [ ] Página `/auth/verificar-2fa`
- [ ] 2FA con QR code y códigos de backup

### 10.7 Seguridad

- [ ] RLS probado para todos los roles
- [ ] Detección de intentos fallidos funciona
- [ ] Bloqueo temporal de cuenta funciona
- [ ] Validación de requisitos de contraseña
- [ ] Registro de login_attempts funcional
- [ ] 2FA opcional implementado
- [ ] Auditoría de acciones críticas
- [ ] Página `/dashboard/auditoria` con logs

### 10.8 Testing

- [ ] Probar invitación de usuarios (flujo completo)
- [ ] Probar aceptación de invitación
- [ ] Probar cambio de permisos
- [ ] Probar login con diferentes roles
- [ ] Probar bloqueo por intentos fallidos
- [ ] Probar recuperación de contraseña
- [ ] Probar configuración de 2FA
- [ ] Probar login con 2FA
- [ ] Probar cambio de branding del login
- [ ] Probar permisos personalizados vs rol
- [ ] Tests de integración para flujos críticos
- [ ] Tests de seguridad (intentar bypass de permisos)

### 10.9 Documentación

- [ ] Documentar uso de `usePermissions` hook
- [ ] Documentar servicios principales
- [ ] Crear guía de usuario para gestión de usuarios
- [ ] Crear guía de usuario para configuración de login
- [ ] Documentar proceso de invitación
- [ ] Documentar matriz de permisos
- [ ] Crear FAQ de seguridad

### 10.10 Deployment

- [ ] Migración ejecutada en Supabase (Producción)
- [ ] Variables de entorno configuradas
- [ ] Configuración de email verificada
- [ ] Configuración por defecto insertada
- [ ] Smoke tests en producción
- [ ] Monitoreo de errores configurado

---

## 11. Criterios de Aceptación

### Mínimo Viable (v1.0) - DEBE estar listo

1. ✅ **Gestión de usuarios**
   - Listado de usuarios con búsqueda y filtros
   - Invitar nuevos usuarios por email
   - Editar rol de usuarios existentes
   - Desactivar/activar usuarios

2. ✅ **Sistema de permisos**
   - Permisos por defecto según rol
   - Matriz de permisos personalizable por usuario
   - Verificación de permisos en frontend
   - Protección de rutas según permisos

3. ✅ **Login personalizable**
   - Upload de logo
   - Configuración de colores
   - Textos personalizables
   - Preview en tiempo real

4. ✅ **Seguridad básica**
   - Detección de intentos fallidos
   - Bloqueo temporal por intentos excesivos
   - Validación de requisitos de contraseña
   - Recuperación de contraseña

5. ✅ **Auditoría básica**
   - Registro de logins
   - Registro de cambios de permisos
   - Vista de logs con filtros

### Deseable (v1.1) - Puede posponerse

6. ⚙️ **2FA opcional**
   - Configuración de 2FA por usuario
   - Verificación con código QR
   - Códigos de backup

7. ⚙️ **Seguridad avanzada**
   - Requisitos complejos de contraseña
   - Expiración de contraseñas
   - Historial de contraseñas

8. ⚙️ **SSO (Single Sign-On)**
   - Login con Google
   - Login con Microsoft

### Futuro (v2.0) - Roadmap posterior

9. 🔮 **Autenticación avanzada**
   - Autenticación biométrica
   - Login sin contraseña (Magic Links)
   - Hardware tokens (YubiKey)

10. 🔮 **Análisis de seguridad**
    - Detección de logins sospechosos
    - Geolocalización de accesos
    - Notificaciones de seguridad
    - Dashboard de seguridad

---

## 12. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Migración de usuarios existentes pierde permisos** | Media | Alto | - Script de migración que copia roles a permisos<br>- Backup antes de migración<br>- Rollback plan |
| **Admin se bloquea a sí mismo** | Baja | Alto | - Super admin siempre tiene acceso<br>- Bypass de bloqueo para super_admin<br>- Recuperación via consola Supabase |
| **Performance en queries de permisos** | Media | Medio | - Índices optimizados en tablas<br>- Cache de permisos en frontend<br>- Función SQL optimizada |
| **Email de invitación no llega** | Media | Medio | - Validar configuración de email antes<br>- Mostrar link de invitación en UI<br>- Reintentar envío |
| **2FA bloquea a usuarios legítimos** | Baja | Alto | - Códigos de backup obligatorios<br>- Proceso de recuperación<br>- 2FA opcional, no obligatorio al inicio |
| **RLS mal configurado expone datos** | Baja | Crítico | - Testing exhaustivo de RLS<br>- Code review de políticas<br>- Tests automatizados |

---

## 13. Dependencias Externas

### Servicios Requeridos

1. **Supabase**
   - Base de datos PostgreSQL
   - Autenticación
   - Storage (para logos)

2. **Servicio de Email**
   - Resend / SendGrid
   - Plantillas de email
   - API key configurada

3. **Librerías NPM**
   ```json
   {
     "otplib": "^12.0.1",          // Para 2FA
     "qrcode": "^1.5.3",           // Para códigos QR
     "zod": "^3.22.4",             // Validaciones
     "react-hook-form": "^7.49.2", // Formularios
     "@tanstack/react-table": "^8.11.0" // Tablas
   }
   ```

### Integración con Sistema de Configuración

Este módulo **depende** del Sistema de Configuración Global (Fase 1 del roadmap principal):

- `cluster_config.logo_url` → Logo en login
- `cluster_config.primary_color` → Color de botones
- `cluster_config.cluster_name` → Nombre en mensajes

Si el sistema de configuración NO está implementado, usar valores hardcoded como fallback.

---

## 14. Cronograma Detallado

### Semana 1

| Día | Horas | Tareas | Responsable |
|-----|-------|--------|-------------|
| Lunes | 8h | BD: Script SQL, migraciones | Backend Dev |
| Martes | 8h | BD: Testing RLS, funciones | Backend Dev |
| Miércoles | 8h | Servicios: Permission, Invitation | Backend Dev |
| Jueves | 8h | Servicios: Security, LoginConfig | Backend Dev |
| Viernes | 8h | Componentes: ProtectedRoute, Can | Frontend Dev |

### Semana 2

| Día | Horas | Tareas | Responsable |
|-----|-------|--------|-------------|
| Lunes | 8h | UI: Página usuarios, tabla | Frontend Dev |
| Martes | 8h | UI: Filtros, búsqueda, acciones | Frontend Dev |
| Miércoles | 8h | UI: Modal invitación, página aceptar | Frontend Dev |
| Jueves | 8h | UI: Página detalle usuario, matriz permisos | Frontend Dev |
| Viernes | 8h | UI: Configuración login (branding) | Frontend Dev |

### Semana 3

| Día | Horas | Tareas | Responsable |
|-----|-------|--------|-------------|
| Lunes | 8h | UI: Configuración seguridad | Frontend Dev |
| Martes | 8h | UI: Nueva página login | Frontend Dev |
| Miércoles | 8h | Seguridad: Recuperación contraseña | Full Stack |
| Jueves | 8h | Seguridad: 2FA (opcional) | Full Stack |
| Viernes | 8h | Testing, bugs, documentación | QA + Devs |

**Total:** 120 horas (3 semanas × 5 días × 8 horas)

---

## 15. Métricas de Éxito

### Objetivos Cuantitativos

- ✅ 100% de usuarios pueden ser invitados via email
- ✅ 100% de permisos configurables desde UI
- ✅ 0 accesos no autorizados (RLS funcionando)
- ✅ < 500ms para verificar permisos
- ✅ < 3 segundos carga página de login
- ✅ 100% de logins registrados en audit_log

### Objetivos Cualitativos

- ✅ Login visualmente atractivo y profesional
- ✅ Proceso de invitación intuitivo (< 5 pasos)
- ✅ Matriz de permisos fácil de entender
- ✅ Mensajes de error claros y útiles
- ✅ Documentación completa para admins

---

## 16. Próximos Pasos Inmediatos

### Esta Semana

1. ✅ **Día 1:** Ejecutar script SQL en Supabase Dev
2. ⏳ **Día 2:** Validar RLS y permisos por defecto
3. ⏳ **Día 3:** Crear servicios backend
4. ⏳ **Día 4:** Crear componentes de protección
5. ⏳ **Día 5:** Comenzar página de usuarios

### Siguiente Sprint (Semana 2)

6. Sistema de invitaciones completo
7. Matriz de permisos funcional
8. Configuración de login básica

### Sprint Final (Semana 3)

9. Seguridad avanzada (2FA, recuperación)
10. Testing y corrección de bugs
11. Documentación y deployment

---

## 17. Notas Adicionales

### Consideraciones de UX

- **Feedback inmediato:** Mostrar confirmaciones en todas las acciones
- **Estados de carga:** Skeletons en lugar de spinners
- **Validación en tiempo real:** No esperar a submit de formulario
- **Mensajes de error útiles:** Explicar qué hacer, no solo qué salió mal

### Consideraciones de Performance

- **Cache de permisos:** Guardar en localStorage con TTL
- **Lazy loading:** Cargar matriz de permisos solo cuando se abre
- **Paginación:** Máximo 50 usuarios por página
- **Debouncing:** En búsqueda y filtros (300ms)

### Consideraciones de Seguridad

- **No confiar en frontend:** Validar permisos en RLS siempre
- **Tokens seguros:** Usar `crypto.randomBytes()` para tokens
- **Expiración de sesiones:** Implementar timeout configurable
- **HTTPS obligatorio:** En producción siempre
- **Sanitización:** Limpiar inputs antes de guardar

---

## 18. Contactos y Recursos

### Equipo

- **Backend Lead:** TBD
- **Frontend Lead:** TBD
- **QA Lead:** TBD
- **Product Owner:** TBD

### Recursos

- **Documentación Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **Documentación otplib (2FA):** https://www.npmjs.com/package/otplib
- **OWASP Auth Cheatsheet:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

---

**Última actualización:** Febrero 2026  
**Versión del documento:** 1.1  
**Estado:** En implementación (~40% completado)

### ✅ Entregables Completados en esta Sesión

| Archivo | Descripción |
|---------|-------------|
| `hooks/useAuth.ts` | Hook de sesión Supabase global |
| `hooks/useLoginConfig.ts` | Hook para config del login |
| `hooks/usePermissions.ts` | Hook de permisos (ya existía) |
| `lib/services/PermissionService.ts` | CRUD de permisos |
| `lib/services/InvitationService.ts` | Flujo completo de invitaciones |
| `lib/services/SecurityService.ts` | Intentos, lockout, validación de contraseña |
| `components/auth/Can.tsx` | Renderizado condicional por permisos |
| `components/auth/ProtectedRoute.tsx` | Protección de rutas |
| `app/dashboard/usuarios/page.tsx` | Gestión de usuarios (tabla + modal) |
| `app/auth/login/page.tsx` | Login premium con branding dinámico |
| `app/invitacion/[token]/page.tsx` | Aceptación de invitaciones |
| `scripts/migrations/016_*.sql` | Script SQL completo (ya existía) |

### ⏳ Siguiente Prioridad

1. **Ejecutar migración SQL** en Supabase Dev (script ya listo)
2. Crear `/dashboard/usuarios/[id]` con PermissionMatrix
3. Crear `/auth/recuperar-contrasena` (password reset)
4. Integrar SendGrid para envío de emails de invitación

---

## Apéndices

### Apéndice A: Ejemplos de Uso de Componentes

```tsx
// Ejemplo 1: Proteger una ruta completa
<ProtectedRoute requiredModule="empresas" requiredAction="create">
  <CreateCompanyPage />
</ProtectedRoute>

// Ejemplo 2: Mostrar botón condicionalmente
<Can module="empresas" action="delete">
  <Button onClick={handleDelete}>Eliminar</Button>
</Can>

// Ejemplo 3: Verificar permiso en código
const { checkPermission } = usePermissions()

if (checkPermission('reportes', 'export')) {
  // Habilitar exportación
}

// Ejemplo 4: Obtener todos los permisos
const { permissions } = usePermissions()
console.log(permissions)
// {
//   empresas: { can_create: true, can_read: true, ... },
//   reportes: { can_create: false, can_read: true, ... }
// }
```

### Apéndice B: Estructura de Email de Invitación

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .button { background: #3b82f6; color: white; padding: 12px 24px; }
  </style>
</head>
<body>
  <h1>Has sido invitado a {{cluster_name}}</h1>
  <p>Hola,</p>
  <p>{{invited_by}} te ha invitado a unirte al sistema CRM como <strong>{{role}}</strong>.</p>
  <p>
    <a href="{{invitation_link}}" class="button">Aceptar Invitación</a>
  </p>
  <p>Este link expira en 7 días.</p>
  <p>Si no solicitaste esta invitación, puedes ignorar este correo.</p>
</body>
</html>
```

### Apéndice C: Matriz de Permisos por Defecto

| Rol | Módulo | Crear | Leer | Editar | Eliminar | Exportar |
|-----|--------|-------|------|--------|----------|----------|
| **super_admin** | Todos | ✅ | ✅ | ✅ | ✅ | ✅ |
| **admin** | organizaciones | ❌ | ✅ | ✅ | ❌ | ✅ |
| **admin** | empresas | ✅ | ✅ | ✅ | ✅ | ✅ |
| **admin** | admisiones | ✅ | ✅ | ✅ | ✅ | ✅ |
| **admin** | usuarios | ✅ | ✅ | ✅ | ❌ | ❌ |
| **editor** | empresas | ✅ | ✅ | ✅ | ❌ | ✅ |
| **editor** | eventos | ✅ | ✅ | ✅ | ❌ | ✅ |
| **viewer** | Todos | ❌ | ✅ | ❌ | ❌ | ❌ |
| **coordinador_cce** | Todos | ❌ | ✅ | ❌ | ❌ | ✅ |

---

**FIN DEL DOCUMENTO**

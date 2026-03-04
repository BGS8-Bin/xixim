# Roadmap de Implementación - Sistema CRM Autónomo

## 📅 Plan de Trabajo Detallado

---

## FASE 1: SISTEMA AUTÓNOMO Y CONFIGURABLE
**Duración estimada: 1-2 semanas**  
**Prioridad: CRÍTICA**

### Semana 1: Base de Configuración

#### Día 1-2: Base de Datos
- [ ] Crear script SQL `012_create_configuration_system.sql`
  - [ ] Tabla `cluster_config`
  - [ ] Tabla `email_templates` 
  - [ ] Insertar configuración por defecto
  - [ ] Insertar plantillas de email predefinidas
  - [ ] Políticas RLS apropiadas
  - [ ] Ejecutar script en Supabase

#### Día 2-3: Backend Services
- [ ] Crear hook `useClusterConfig.ts`
  - [ ] Fetch de configuración
  - [ ] Cache de configuración
  - [ ] Revalidación automática
- [ ] Crear servicio `EmailService` 
  - [ ] Método `sendEmail()`
  - [ ] Reemplazo de variables en plantillas
  - [ ] Integración con Resend/SendGrid
  - [ ] Logging de emails enviados
- [ ] Crear utilidades de export
  - [ ] `exportToPDF()`
  - [ ] `exportToExcel()`

#### Día 3-5: UI de Configuración
- [ ] Crear página `/dashboard/configuracion`
  - [ ] Layout con tabs
  - [ ] Tab "General" - Info básica del clúster
  - [ ] Tab "Branding" - Logos y assets
  - [ ] Tab "Tema" - Color pickers
  - [ ] Tab "Emails" - Editor de plantillas
  - [ ] Tab "Admisión" - Parámetros
- [ ] Componente `DynamicLogo`
  - [ ] Versión completa y compacta
  - [ ] Fallback a texto
  - [ ] Loading state
- [ ] Componente `DynamicThemeProvider`
  - [ ] Aplicar CSS variables dinámicas
  - [ ] Actualizar favicon
  - [ ] Actualizar título de página

#### Día 5-7: Gestión de Assets
- [ ] Sistema de upload de logos
  - [ ] Upload a Supabase Storage
  - [ ] Validación de formato (PNG, SVG, WEBP)
  - [ ] Preview antes de guardar
  - [ ] Crop/resize de imágenes
- [ ] Gestión de múltiples versiones
  - [ ] Logo principal
  - [ ] Logo icono
  - [ ] Logo para fondo oscuro
  - [ ] Favicon
- [ ] Editor de colores
  - [ ] Color pickers con preview en tiempo real
  - [ ] Presets de temas
  - [ ] Validación de contraste (accesibilidad)
  - [ ] Reset a valores por defecto

### Semana 2: Integración y Testing

#### Día 8-9: Integración en Componentes Existentes
- [ ] Actualizar `Sidebar` para usar colores dinámicos
- [ ] Actualizar `Header` con logo dinámico
- [ ] Actualizar todas las páginas para usar config
- [ ] Actualizar emails automáticos (en próxima fase)
- [ ] Actualizar documentos PDF generados

#### Día 10-11: Editor de Plantillas de Email
- [ ] Lista de plantillas con categorías
- [ ] Editor WYSIWYG para HTML
- [ ] Preview de email con datos de prueba
- [ ] Sistema de variables con autocomplete
- [ ] Envío de email de prueba
- [ ] Guardar cambios con versionado

#### Día 12-14: Testing y Documentación
- [ ] Probar cambio de logos
- [ ] Probar cambio de colores
- [ ] Probar edición de plantillas
- [ ] Verificar que todo se persiste en BD
- [ ] Verificar que cambios se reflejan en tiempo real
- [ ] Crear documentación de usuario
- [ ] Crear video tutorial (opcional)

---

## FASE 2: FUNCIONALIDADES CORE PENDIENTES
**Duración estimada: 2-3 semanas**  
**Prioridad: ALTA**

### Semana 3: Páginas de Detalle y Edición

#### Organismo
- [ ] Crear `/dashboard/organismos/[id]/page.tsx`
  - [ ] Vista de detalles completos
  - [ ] Tabs: General, Mesa Directiva, Comisiones, Empresas, Documentos
  - [ ] Estadísticas del organismo
  - [ ] Timeline de actividades
- [ ] Crear `/dashboard/organismos/[id]/editar/page.tsx`
  - [ ] Formulario de edición completo
  - [ ] Upload de nuevo logo
  - [ ] Edición de datos de contacto
  - [ ] Guardar cambios con validación

#### Empresa
- [ ] Crear `/dashboard/empresas/[id]/page.tsx`
  - [ ] Vista de detalles completos
  - [ ] Tabs: General, Contactos, Productos/Servicios, Historial, Documentos
  - [ ] Indicadores de la empresa
  - [ ] Timeline de actividades
- [ ] Crear `/dashboard/empresas/[id]/editar/page.tsx`
  - [ ] Formulario de edición
  - [ ] Gestión de contactos inline
  - [ ] Upload de logo empresarial
  - [ ] Guardar cambios

#### Evento
- [ ] Crear `/dashboard/eventos/[id]/page.tsx`
  - [ ] Detalles del evento
  - [ ] Lista de asistentes
  - [ ] Estadísticas de asistencia
  - [ ] QR code de registro
- [ ] Crear `/dashboard/eventos/[id]/editar/page.tsx`
  - [ ] Edición completa del evento
  - [ ] Gestión de invitados
  - [ ] Envío de invitaciones

### Semana 4: Sistema de Productos y Servicios

#### Base de Datos
- [ ] Crear script SQL `013_create_offerings_system.sql`
  - [ ] Tabla `company_offerings`
  - [ ] Función de matching `match_offerings()`
  - [ ] Índices y RLS
  - [ ] Ejecutar en Supabase

#### UI de Gestión
- [ ] Agregar sección en `/dashboard/empresas/[id]`
  - [ ] Tab "Productos y Servicios"
  - [ ] Lista de ofertas
  - [ ] Lista de requerimientos
  - [ ] Formulario de agregar producto/servicio
  - [ ] Filtros y búsqueda
- [ ] Página de matching `/dashboard/matching`
  - [ ] Vista de oportunidades
  - [ ] Recomendaciones por empresa
  - [ ] Filtros avanzados
  - [ ] Exportar matches

### Semana 5: Sistema de Notificaciones por Email

#### Integración con Proveedor
- [ ] Configurar cuenta en Resend/SendGrid
- [ ] Agregar API keys a variables de entorno
- [ ] Implementar `EmailService` completo
- [ ] Crear funciones helper para cada tipo de email

#### Automatización de Emails
- [ ] Email al recibir solicitud de admisión
  - [ ] Trigger en submit del formulario
  - [ ] Envío al solicitante
  - [ ] Envío a administradores
- [ ] Email al aprobar/rechazar solicitud
  - [ ] Trigger en cambio de status
  - [ ] Personalización según decisión
  - [ ] Próximos pasos incluidos
- [ ] Email de invitación a evento
  - [ ] Opción de envío masivo
  - [ ] Personalización por invitado
  - [ ] Link de confirmación
- [ ] Email de recordatorio de evento
  - [ ] Envío automático 24-48 hrs antes
  - [ ] Incluir detalles y link
- [ ] Email de recordatorio de pago
  - [ ] Trigger en fecha de vencimiento
  - [ ] Incluir monto y método de pago
- [ ] Email de comunicado institucional
  - [ ] Envío segmentado
  - [ ] Rich HTML
  - [ ] Tracking de apertura (opcional)

#### Panel de Control de Emails
- [ ] Página `/dashboard/emails`
  - [ ] Historial de emails enviados
  - [ ] Estadísticas de entrega
  - [ ] Filtros por tipo, destinatario, fecha
  - [ ] Reenvío de emails

---

## FASE 3: GESTIÓN AVANZADA
**Duración estimada: 2 semanas**  
**Prioridad: MEDIA-ALTA**

### Semana 6: Comisiones y Mesa Directiva

#### Base de Datos
- [ ] Crear script SQL `014_create_governance_system.sql`
  - [ ] Tabla `work_commissions`
  - [ ] Tabla `commission_members`
  - [ ] Tabla `board_members`
  - [ ] RLS y políticas
  - [ ] Ejecutar en Supabase

#### UI - Comisiones
- [ ] Página `/dashboard/comisiones`
  - [ ] Lista de comisiones
  - [ ] Crear nueva comisión
  - [ ] Ver miembros
  - [ ] Editar comisión
- [ ] Página `/dashboard/comisiones/[id]`
  - [ ] Detalles de la comisión
  - [ ] Lista de miembros
  - [ ] Agregar/remover miembros
  - [ ] Calendario de reuniones
  - [ ] Documentos de la comisión

#### UI - Mesa Directiva
- [ ] Sección en `/dashboard/organismos/[id]`
  - [ ] Tab "Mesa Directiva"
  - [ ] Vista de mesa actual
  - [ ] Historial de mesas anteriores
  - [ ] Agregar nuevo miembro
  - [ ] Definir períodos
  - [ ] Responsabilidades por cargo

### Semana 7: Gestión de Usuarios y Auditoría

#### Sistema de Auditoría
- [ ] Crear script SQL `015_create_audit_system.sql`
  - [ ] Tabla `audit_log`
  - [ ] Función `log_audit()`
  - [ ] Triggers automáticos en tablas críticas
  - [ ] Ejecutar en Supabase

#### Logging Automático
- [ ] Implementar logging en acciones críticas
  - [ ] Create/Update/Delete de organismos
  - [ ] Create/Update/Delete de empresas
  - [ ] Aprobación/Rechazo de admisiones
  - [ ] Cambios de configuración
  - [ ] Envío de emails masivos
  - [ ] Exportación de datos

#### UI de Gestión de Usuarios
- [ ] Página `/dashboard/usuarios`
  - [ ] Lista de usuarios
  - [ ] Filtros por rol
  - [ ] Invitar nuevo usuario
  - [ ] Editar rol de usuario
  - [ ] Desactivar usuario
  - [ ] Ver actividad de usuario
- [ ] Página `/dashboard/auditoria`
  - [ ] Log de todas las acciones
  - [ ] Filtros avanzados
  - [ ] Búsqueda por usuario, acción, entidad
  - [ ] Exportar log

---

## FASE 4: MEJORAS DE UX Y EXPORTACIÓN
**Duración estimada: 1-2 semanas**  
**Prioridad: MEDIA**

### Semana 8: Sistema de Exportación

#### Exportación de Directorios
- [ ] Botón "Exportar a PDF" en `/dashboard/empresas`
  - [ ] Generar PDF con lista filtrada
  - [ ] Incluir logo del clúster
  - [ ] Formato profesional
  - [ ] Información completa por empresa
- [ ] Exportar directorio público
  - [ ] PDF con empresas activas
  - [ ] Categorizado por sector
  - [ ] Información de contacto
  - [ ] Logos empresariales

#### Exportación de Reportes
- [ ] Exportar reportes a Excel
  - [ ] Estadísticas por sector
  - [ ] Datos de admisiones
  - [ ] Métricas de eventos
  - [ ] Hojas múltiples por categoría
- [ ] Exportar reportes a PDF
  - [ ] Gráficos incluidos
  - [ ] Tablas de datos
  - [ ] Formato ejecutivo

#### Exportación de Listas
- [ ] Exportar lista de empresas a CSV/Excel
  - [ ] Con filtros aplicados
  - [ ] Campos seleccionables
  - [ ] Bulk export
- [ ] Exportar asistentes a eventos
  - [ ] Lista de confirmados
  - [ ] Lista de asistentes reales
  - [ ] Con datos de contacto

### Semana 9: Vista de Calendario

#### Componente de Calendario
- [ ] Instalar librería de calendario (react-big-calendar o similar)
- [ ] Crear componente `CalendarView`
  - [ ] Vista mensual
  - [ ] Vista semanal
  - [ ] Vista de agenda
  - [ ] Click en día para crear evento
  - [ ] Click en evento para ver detalles

#### Integración
- [ ] Actualizar `/dashboard/calendario`
  - [ ] Toggle entre vista lista y calendario
  - [ ] Filtros por tipo de evento
  - [ ] Filtros por organismo
  - [ ] Vista pública en `/eventos`
- [ ] Mini calendario en dashboard
  - [ ] Próximos eventos destacados
  - [ ] Link a calendario completo

---

## FASE 5: PULIDO Y OPTIMIZACIÓN
**Duración estimada: 1-2 semanas**  
**Prioridad: MEDIA-BAJA**

### Semana 10: Mejoras de UI/UX

#### Navegación y Búsqueda
- [ ] Búsqueda global en header
  - [ ] Search bar con hotkey (Cmd+K / Ctrl+K)
  - [ ] Búsqueda en empresas, organismos, eventos
  - [ ] Resultados agrupados
  - [ ] Navegación rápida
- [ ] Breadcrumbs en todas las páginas
  - [ ] Ruta de navegación clara
  - [ ] Links funcionales
  - [ ] Responsive

#### Componentes y Feedback
- [ ] Loading states mejorados
  - [ ] Skeletons en lugar de spinners
  - [ ] Animaciones suaves
  - [ ] Estados de error informativos
- [ ] Tooltips informativos
  - [ ] En campos de formulario
  - [ ] En botones de acción
  - [ ] Explicaciones breves
- [ ] Confirmaciones de acciones
  - [ ] Modal de confirmación para delete
  - [ ] Toasts de éxito
  - [ ] Alerts de advertencia

#### Mobile Responsiveness
- [ ] Revisar todas las páginas en móvil
- [ ] Optimizar tablas para móvil
  - [ ] Cards en lugar de tablas
  - [ ] Scroll horizontal con gradientes
- [ ] Sidebar colapsable en móvil
  - [ ] Overlay en móvil
  - [ ] Swipe para abrir/cerrar
- [ ] Formularios optimizados
  - [ ] Inputs de tamaño apropiado
  - [ ] Labels siempre visibles
  - [ ] Teclado numérico para números

### Semana 11: Accesibilidad y Performance

#### Accesibilidad (WCAG AA)
- [ ] Agregar labels ARIA a todos los componentes
- [ ] Navegación por teclado completa
  - [ ] Tab order lógico
  - [ ] Shortcuts documentados
  - [ ] Focus visible
- [ ] Contraste de colores
  - [ ] Validar ratios de contraste
  - [ ] Ajustar colores si es necesario
  - [ ] Opción de alto contraste
- [ ] Alt text en todas las imágenes
- [ ] Formularios accesibles
  - [ ] Labels asociados
  - [ ] Error messages claros
  - [ ] Instrucciones visibles

#### Performance
- [ ] Optimización de imágenes
  - [ ] Lazy loading
  - [ ] WebP format
  - [ ] Responsive images
- [ ] Code splitting
  - [ ] Rutas dinámicas
  - [ ] Componentes pesados lazy-loaded
- [ ] Caché estratégico
  - [ ] React Query/SWR para datos
  - [ ] Service worker para assets
- [ ] Reducir bundle size
  - [ ] Tree shaking
  - [ ] Eliminar dependencias no usadas
  - [ ] Análisis con webpack-bundle-analyzer

#### Modo Oscuro (Opcional)
- [ ] Implementar dark mode
  - [ ] Toggle en header
  - [ ] Persistir preferencia
  - [ ] Colores apropiados
  - [ ] Logos adaptados

---

## CHECKLIST PRE-LANZAMIENTO

### 🔒 Seguridad
- [ ] Todas las tablas tienen RLS configurado
- [ ] Políticas de seguridad probadas para cada rol
- [ ] API keys en variables de entorno
- [ ] Datos sensibles encriptados
- [ ] Rate limiting en endpoints críticos
- [ ] Política de privacidad implementada
- [ ] Términos y condiciones
- [ ] Cookie consent banner
- [ ] Backup automático configurado
- [ ] Plan de recuperación de desastres

### ⚙️ Configuración
- [ ] Sistema de configuración completo
- [ ] Todos los valores hardcodeados movidos a BD
- [ ] Logo personalizable
- [ ] Colores personalizables
- [ ] Datos de contacto configurables
- [ ] Plantillas de email personalizables
- [ ] Parámetros de admisión configurables

### ✅ Funcionalidades
- [ ] CRUD completo para organismos
- [ ] CRUD completo para empresas
- [ ] Proceso de admisión end-to-end
- [ ] Sistema de emails automáticos funcional
- [ ] Calendario con eventos
- [ ] Sistema de comunicados
- [ ] Reportes y estadísticas
- [ ] Exportación de datos
- [ ] Gestión de usuarios
- [ ] Sistema de auditoría

### 🎨 UI/UX
- [ ] Diseño responsive en todos los dispositivos
- [ ] Navegación intuitiva
- [ ] Búsqueda global funcional
- [ ] Loading states apropiados
- [ ] Error handling claro
- [ ] Confirmaciones de acciones destructivas
- [ ] Accesibilidad básica (WCAG AA)
- [ ] Performance optimizado (<3s load time)

### 📝 Documentación
- [ ] Manual de usuario completado
- [ ] Manual de administrador completado
- [ ] Documentación técnica
- [ ] Guía de configuración inicial
- [ ] FAQs preparadas
- [ ] Videos tutoriales (opcional)

### 🧪 Testing
- [ ] Pruebas de todos los flujos principales
- [ ] Pruebas en diferentes roles (admin, editor, viewer)
- [ ] Pruebas en diferentes navegadores
- [ ] Pruebas en móvil y tablet
- [ ] Pruebas de carga (stress testing)
- [ ] Pruebas de seguridad básicas

### 🚀 Deployment
- [ ] Variables de entorno configuradas en producción
- [ ] Base de datos migrada a producción
- [ ] Storage configurado
- [ ] Email service configurado
- [ ] Dominio configurado
- [ ] SSL/HTTPS activo
- [ ] Analytics configurado
- [ ] Error tracking configurado (Sentry, etc.)
- [ ] Backups automáticos activos

---

## 📊 MÉTRICAS DE ÉXITO

### Al finalizar Fase 1
- [ ] Sistema 100% configurable sin tocar código
- [ ] Logos y colores cambiables desde UI
- [ ] Configuración persiste en base de datos

### Al finalizar Fase 2
- [ ] Todas las páginas de detalle funcionando
- [ ] Sistema de emails enviando automáticamente
- [ ] Exportación básica de datos funcional

### Al finalizar Fase 3
- [ ] Gestión completa de comisiones y mesa directiva
- [ ] Sistema de usuarios con permisos granulares
- [ ] Log de auditoría registrando todas las acciones

### Al finalizar Fase 4
- [ ] Exportación a PDF de directorios
- [ ] Vista de calendario completa
- [ ] Experiencia de usuario pulida

### Al finalizar Fase 5
- [ ] Performance optimizado
- [ ] Accesibilidad básica cumplida
- [ ] 100% responsive
- [ ] Listo para producción

---

## ⏱️ ESTIMACIÓN TOTAL

| Fase | Duración | Prioridad |
|------|----------|-----------|
| Fase 1: Sistema Autónomo | 1-2 semanas | CRÍTICA |
| Fase 2: Funcionalidades Core | 2-3 semanas | ALTA |
| Fase 3: Gestión Avanzada | 2 semanas | MEDIA-ALTA |
| Fase 4: UX y Exportación | 1-2 semanas | MEDIA |
| Fase 5: Pulido | 1-2 semanas | MEDIA-BAJA |

**Total Estimado: 7-11 semanas (1.5 - 2.5 meses)**

---

## 🎯 SIGUIENTES PASOS INMEDIATOS

1. **ESTA SEMANA:**
   - Crear las tablas de configuración en Supabase
   - Implementar el hook `useClusterConfig`
   - Comenzar la página de configuración

2. **PRÓXIMA SEMANA:**
   - Terminar página de configuración
   - Implementar sistema de upload de logos
   - Crear componente de logo dinámico
   - Integrar colores dinámicos en sidebar

3. **TERCERA SEMANA:**
   - Sistema de plantillas de email
   - Servicio de envío de emails
   - Automatización de notificaciones básicas

**Objetivo del Mes 1:** Sistema 100% autónomo y configurable ✅

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0
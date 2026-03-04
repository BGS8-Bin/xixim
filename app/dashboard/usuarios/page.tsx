"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
    Users,
    MoreHorizontal,
    UserPlus,
    Search,
    Shield,
    ShieldAlert,
    Eye,
    Pencil,
    Ban,
    CheckCircle,
    RefreshCw,
    Loader2,
    AlertTriangle,
    KeyRound,
} from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface UserProfile {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    role: "super_admin" | "admin" | "editor" | "viewer" | "coordinador_cce"
    organization_id: string | null
    is_active: boolean
    phone: string | null
    position: string | null
    created_at: string
}

const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Administrador",
    editor: "Editor",
    viewer: "Visualizador",
    coordinador_cce: "Coordinador CCE",
}

const ROLE_COLORS: Record<string, string> = {
    super_admin: "bg-red-100 text-red-800 border-red-200",
    admin: "bg-purple-100 text-purple-800 border-purple-200",
    editor: "bg-blue-100 text-blue-800 border-blue-200",
    viewer: "bg-gray-100 text-gray-700 border-gray-200",
    coordinador_cce: "bg-amber-100 text-amber-800 border-amber-200",
}

export default function UsuariosPage() {
    const supabase = createClient()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [showCreateModal, setShowCreateModal] = useState(false)

    // Form state
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        role: "editor" as "admin" | "editor" | "viewer" | "coordinador_cce",
        phone: "",
        position: "",
    })
    const [formError, setFormError] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    const fetchUsers = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false })
            if (error) throw error
            setUsers(data ?? [])
        } catch {
            toast.error("Error al cargar usuarios")
        } finally {
            setIsLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            !searchQuery ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === "all" || u.role === roleFilter
        return matchesSearch && matchesRole
    })

    const handleCreateUser = async () => {
        setFormError(null)

        if (!form.email || !form.password || !form.firstName || !form.lastName) {
            setFormError("Completa todos los campos obligatorios")
            return
        }
        if (form.password.length < 8) {
            setFormError("La contraseña debe tener al menos 8 caracteres")
            return
        }
        if (form.password !== form.confirmPassword) {
            setFormError("Las contraseñas no coinciden")
            return
        }

        setIsCreating(true)
        try {
            // Obtener el JWT del usuario actual desde el cliente
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setFormError("Sesión expirada. Vuelve a iniciar sesión.")
                return
            }

            // Llamar directamente a la Edge Function con el JWT del admin
            const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-user`
            const response = await fetch(edgeFunctionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                    "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    firstName: form.firstName,
                    lastName: form.lastName,
                    role: form.role,
                    phone: form.phone || undefined,
                    position: form.position || undefined,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                setFormError(result.error ?? "Error al crear el usuario")
                return
            }

            toast.success(`Usuario ${form.firstName} ${form.lastName} creado exitosamente`)
            setShowCreateModal(false)
            setForm({
                email: "",
                password: "",
                confirmPassword: "",
                firstName: "",
                lastName: "",
                role: "editor",
                phone: "",
                position: "",
            })
            fetchUsers()
        } catch {
            setFormError("Error de conexión. Intenta de nuevo.")
        } finally {
            setIsCreating(false)
        }
    }

    const handleChangeRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ role: newRole })
                .eq("id", userId)
            if (error) throw error
            toast.success("Rol actualizado")
            fetchUsers()
        } catch {
            toast.error("Error al cambiar el rol")
        }
    }

    const handleToggleActive = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ is_active: !currentStatus })
                .eq("id", userId)
            if (error) throw error
            toast.success(currentStatus ? "Usuario desactivado" : "Usuario activado")
            fetchUsers()
        } catch {
            toast.error("Error al cambiar estado")
        }
    }

    const getUserInitials = (u: UserProfile) => {
        const f = u.first_name?.[0] ?? ""
        const l = u.last_name?.[0] ?? ""
        return (f + l).toUpperCase() || u.email[0].toUpperCase()
    }

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })

    return (
        <ProtectedRoute requiredModule="usuarios" requiredAction="read">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Gestión de Usuarios
                        </h1>
                        <p className="text-muted-foreground mt-1">Administra los accesos al sistema</p>
                    </div>
                    <Button onClick={() => { setFormError(null); setShowCreateModal(true) }} className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Agregar Usuario
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: "Total Usuarios", value: users.length, icon: Users, color: "text-blue-600 bg-blue-50" },
                        { label: "Activos", value: users.filter((u) => u.is_active !== false).length, icon: CheckCircle, color: "text-green-600 bg-green-50" },
                        { label: "Admins", value: users.filter((u) => u.role === "admin" || u.role === "super_admin").length, icon: ShieldAlert, color: "text-purple-600 bg-purple-50" },
                    ].map((s) => (
                        <div key={s.label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${s.color}`}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Filtrar por rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los roles</SelectItem>
                            {Object.entries(ROLE_LABELS).map(([v, l]) => (
                                <SelectItem key={v} value={v}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={fetchUsers}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Table */}
                <div className="border rounded-xl overflow-hidden bg-card">
                    {isLoading ? (
                        <div className="p-8 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-3 opacity-40" />
                            <p>No se encontraron usuarios</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead className="hidden md:table-cell">Estado</TableHead>
                                    <TableHead className="hidden lg:table-cell">Registrado</TableHead>
                                    <TableHead className="w-10" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                                        {getUserInitials(user)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {user.first_name && user.last_name
                                                            ? `${user.first_name} ${user.last_name}`
                                                            : "Sin nombre"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    {user.position && (
                                                        <p className="text-xs text-muted-foreground/70">{user.position}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`text-xs font-medium ${ROLE_COLORS[user.role] ?? ""}`}>
                                                <Shield className="h-3 w-3 mr-1" />
                                                {ROLE_LABELS[user.role] ?? user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="outline" className={user.is_active !== false
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-red-50 text-red-700 border-red-200"
                                            }>
                                                {user.is_active !== false ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                            {formatDate(user.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="gap-2" onClick={() =>
                                                        window.location.assign(`/dashboard/usuarios/${user.id}`)
                                                    }>
                                                        <Eye className="h-4 w-4" />
                                                        Ver detalle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {["admin", "editor", "viewer", "coordinador_cce"]
                                                        .filter((r) => r !== user.role)
                                                        .map((role) => (
                                                            <DropdownMenuItem key={role} className="gap-2"
                                                                onClick={() => handleChangeRole(user.id, role)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                Cambiar a {ROLE_LABELS[role]}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="gap-2 text-destructive"
                                                        onClick={() => handleToggleActive(user.id, user.is_active !== false)}
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                        {user.is_active !== false ? "Desactivar" : "Activar"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            {/* Modal: Agregar Usuario */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" />
                            Agregar Nuevo Usuario
                        </DialogTitle>
                        <DialogDescription>
                            Crea un acceso directo al sistema. El usuario podrá iniciar sesión inmediatamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-1">
                        {formError && (
                            <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
                                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        {/* Nombre y apellido */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="u-first">Nombre *</Label>
                                <Input id="u-first" placeholder="Juan" value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="u-last">Apellido *</Label>
                                <Input id="u-last" placeholder="García" value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="u-email">Correo Electrónico *</Label>
                            <Input id="u-email" type="email" placeholder="usuario@email.com" value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>

                        {/* Contraseña */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="u-password" className="flex items-center gap-1.5">
                                <KeyRound className="h-3.5 w-3.5" />
                                Contraseña Temporal *
                            </Label>
                            <Input id="u-password" type="password" placeholder="Mín. 8 caracteres" value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="u-confirm">Confirmar Contraseña *</Label>
                            <Input id="u-confirm" type="password" placeholder="Repite la contraseña" value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                        </div>

                        {/* Rol */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="u-role">Rol *</Label>
                            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as typeof form.role })}>
                                <SelectTrigger id="u-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrador — Control total del organismo</SelectItem>
                                    <SelectItem value="editor">Editor — Puede crear y editar</SelectItem>
                                    <SelectItem value="viewer">Visualizador — Solo lectura</SelectItem>
                                    <SelectItem value="coordinador_cce">Coordinador CCE — Vista consolidada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Opcionales */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="u-position">Cargo (opcional)</Label>
                                <Input id="u-position" placeholder="Gerente" value={form.position}
                                    onChange={(e) => setForm({ ...form, position: e.target.value })} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="u-phone">Teléfono (opcional)</Label>
                                <Input id="u-phone" placeholder="618 123 4567" value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                            💡 Comparte las credenciales de forma segura con el usuario. Se recomienda que cambie su contraseña al primer inicio de sesión.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
                        <Button onClick={handleCreateUser} disabled={isCreating} className="gap-2">
                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                            {isCreating ? "Creando..." : "Crear Usuario"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ProtectedRoute>
    )
}

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cake } from "lucide-react"
import Link from "next/link"

export async function UpcomingBirthdaysServer() {
    const supabase = await createClient()

    // Get all contacts with birthdays
    const { data: contacts } = await supabase
        .from("company_contacts")
        .select(`
      id,
      first_name,
      last_name,
      birthday,
      position,
      company_id,
      companies (
        id,
        name
      )
    `)
        .not("birthday", "is", null)
        .eq("is_primary", true)
        .order("birthday")

    if (!contacts || contacts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Cake className="h-5 w-5 text-primary" />
                        <CardTitle>Cumpleaños Próximos</CardTitle>
                    </div>
                    <CardDescription>Cumpleaños de representantes en los próximos 30 días</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No hay cumpleaños registrados</p>
                </CardContent>
            </Card>
        )
    }

    // Filter birthdays in the next 30 days
    const today = new Date()
    const currentYear = today.getFullYear()

    const upcomingBirthdays = contacts
        .map((contact) => {
            const birthday = new Date(contact.birthday!)
            // Create this year's birthday
            const thisYearBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate())
            // If already passed this year, use next year
            const nextBirthday = thisYearBirthday < today
                ? new Date(currentYear + 1, birthday.getMonth(), birthday.getDate())
                : thisYearBirthday

            const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

            return {
                ...contact,
                nextBirthday,
                daysUntil,
                isToday: daysUntil === 0,
            }
        })
        .filter((c) => c.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil)

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Cake className="h-5 w-5 text-primary" />
                    <CardTitle>Cumpleaños Próximos</CardTitle>
                </div>
                <CardDescription>
                    {upcomingBirthdays.length === 0
                        ? "No hay cumpleaños en los próximos 30 días"
                        : `${upcomingBirthdays.length} cumpleaños en los próximos 30 días`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {upcomingBirthdays.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay cumpleaños próximos</p>
                ) : (
                    <div className="space-y-3">
                        {upcomingBirthdays.slice(0, 5).map((contact) => {
                            const company = Array.isArray(contact.companies)
                                ? contact.companies[0]
                                : contact.companies as { id: string; name: string } | null
                            return (
                                <Link
                                    key={contact.id}
                                    href={`/dashboard/empresas/${contact.company_id}`}
                                    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <Cake className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium leading-none">
                                                {contact.first_name} {contact.last_name}
                                            </p>
                                            {contact.isToday && (
                                                <Badge variant="default" className="ml-2">
                                                    ¡Hoy!
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{company?.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {contact.isToday
                                                ? "¡Es su cumpleaños hoy!"
                                                : contact.daysUntil === 1
                                                    ? "Mañana"
                                                    : `En ${contact.daysUntil} días - ${contact.nextBirthday.toLocaleDateString("es-MX", { day: "numeric", month: "long" })}`}
                                        </p>
                                    </div>
                                </Link>
                            )
                        })}
                        {upcomingBirthdays.length > 5 && (
                            <p className="pt-2 text-center text-xs text-muted-foreground">
                                Y {upcomingBirthdays.length - 5} más...
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

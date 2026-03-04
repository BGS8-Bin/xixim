import type React from "react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ADMISSION_STATUS } from "@/shared/status/admission-statuses"
import { PAYMENT_STATUS } from "@/shared/status/payment-statuses"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  // Fetch admission pending count
  const { count: pendingAdmissionsCount } = await supabase
    .from("admission_requests")
    .select("*", { count: "exact", head: true })
    .in("status", [ADMISSION_STATUS.PENDING, ADMISSION_STATUS.UNDER_REVIEW])

  // Fetch payments pending count
  const { count: pendingPaymentsCount } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("status", PAYMENT_STATUS.PENDING)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        profile={profile}
        pendingAdmissionsCount={pendingAdmissionsCount || 0}
        pendingPaymentsCount={pendingPaymentsCount || 0}
      />
      <div className="pl-64 transition-all duration-300">
        <Header profile={profile} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

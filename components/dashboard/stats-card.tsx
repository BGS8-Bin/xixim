import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "primary" | "secondary"
}

export function StatsCard({ title, value, description, icon: Icon, trend, variant = "default" }: StatsCardProps) {
  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("text-sm font-medium", variant === "default" && "text-muted-foreground")}>
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", variant === "default" && "text-muted-foreground")} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {(description || trend) && (
          <p className={cn("text-xs mt-1", variant === "default" && "text-muted-foreground")}>
            {trend && (
              <span
                className={cn(
                  "font-medium mr-1",
                  trend.isPositive ? "text-green-600" : "text-red-600",
                  variant !== "default" && (trend.isPositive ? "text-green-300" : "text-red-300"),
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

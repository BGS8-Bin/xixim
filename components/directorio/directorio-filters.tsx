"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

const sectorLabels: Record<string, string> = {
  software: "Software",
  hardware: "Hardware",
  telecomunicaciones: "Telecomunicaciones",
  consultoria: "Consultoría",
  manufactura: "Manufactura",
  servicios: "Servicios",
  educacion: "Educación",
  investigacion: "I+D",
  otro: "Otro",
}

export function DirectorioFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar empresa..." className="pl-9" />
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-full sm:w-[200px]">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Sector" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los sectores</SelectItem>
          {Object.entries(sectorLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

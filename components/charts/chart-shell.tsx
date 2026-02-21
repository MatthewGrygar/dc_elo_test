"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type RangeKey = "7d" | "30d" | "3m" | "6m"
export const rangeOptions: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "3m", label: "Last 3 months" },
  { key: "6m", label: "Last 6 months" }
]

export function ChartShell({
  title,
  children,
  defaultRange = "30d"
}: {
  title: string
  children: (range: RangeKey) => React.ReactNode
  defaultRange?: RangeKey
}) {
  const [range, setRange] = React.useState<RangeKey>(defaultRange)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn("glass card-edge shine rounded-3xl")}>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-2xl gap-2 bg-background/30">
                {rangeOptions.find((o) => o.key === range)?.label ?? "Range"}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {rangeOptions.map((o) => (
                <DropdownMenuItem key={o.key} onClick={() => setRange(o.key)}>
                  {o.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="pt-0">{children(range)}</CardContent>
      </Card>
    </motion.div>
  )
}

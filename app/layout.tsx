import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { RatingProvider } from "@/components/providers/rating-provider"

export const metadata: Metadata = {
  title: "DC ELO",
  description: "Modern dashboard for DC ELO rating system"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <RatingProvider>{children}</RatingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

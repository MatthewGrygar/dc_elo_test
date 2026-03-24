import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RatingModeProvider } from "@/components/RatingModeProvider";

export const metadata: Metadata = {
  title: "DC ELO — Rating Dashboard",
  description: "Profesionální ELO rating dashboard pro DC Duel Commander komunitu v České republice",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310e572' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="dc-elo-theme">
          <RatingModeProvider>
            {children}
          </RatingModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

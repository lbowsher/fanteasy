import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import ThemeInitializer from './theme-initializer'
import NavBar from './components/nav-bar'
import { cn } from "@/lib/utils";
import { Toaster } from 'sonner';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fanteasy',
  description: 'Fantasy sports league application'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <ThemeInitializer />
      <body className={inter.className}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm">
          Skip to content
        </a>
        <NavBar />
        <main id="main-content">
          {children}
        </main>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}

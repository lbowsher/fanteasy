import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import ThemeInitializer from './theme-initializer'
import NavBar from './components/nav-bar'
import { cn } from "@/lib/utils";

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
        <NavBar />
        {children}
      </body>
    </html>
  )
}

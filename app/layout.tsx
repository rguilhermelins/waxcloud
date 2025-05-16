import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WaxCloud - Sistema de Inventário de Discos',
  description: 'Sistema de gerenciamento de inventário para loja de discos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
} 
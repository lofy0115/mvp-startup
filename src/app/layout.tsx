import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "MVP创业工具 - 从想法到验证的完整路径",
  description: "面向小规模创业者的创业辅助工具，支持从用户洞察到MVP验证的全流程",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className={`${inter.variable} font-sans h-full antialiased bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}

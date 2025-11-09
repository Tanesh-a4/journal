"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative border-[#669BBC]/40 hover:bg-[#669BBC]/10">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#003049] dark:text-[#669BBC]" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#003049] dark:text-[#669BBC]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#FDF0D5] dark:bg-[#003049] border-[#669BBC]/30 dark:border-[#669BBC]/30">
        <DropdownMenuItem onClick={() => setTheme("light")} className="text-[#003049] dark:text-[#FDF0D5] hover:bg-[#669BBC]/20 dark:hover:bg-[#669BBC]/20">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="text-[#003049] dark:text-[#FDF0D5] hover:bg-[#669BBC]/20 dark:hover:bg-[#669BBC]/20">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="text-[#003049] dark:text-[#FDF0D5] hover:bg-[#669BBC]/20 dark:hover:bg-[#669BBC]/20">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
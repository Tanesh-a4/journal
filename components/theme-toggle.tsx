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
        <Button variant="outline" size="icon" className="relative border-[#08CB00]/40 dark:border-[#08CB00]/40 hover:bg-[#08CB00]/10 dark:hover:bg-[#08CB00]/10">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#000000] dark:text-[#08CB00]" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#000000] dark:text-[#08CB00]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#EEEEEE] dark:bg-[#000000] border-[#08CB00]/30 dark:border-[#08CB00]/30">
        <DropdownMenuItem onClick={() => setTheme("light")} className="text-[#000000] dark:text-[#EEEEEE] hover:bg-[#08CB00]/20 dark:hover:bg-[#08CB00]/20">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="text-[#000000] dark:text-[#EEEEEE] hover:bg-[#08CB00]/20 dark:hover:bg-[#08CB00]/20">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="text-[#000000] dark:text-[#EEEEEE] hover:bg-[#08CB00]/20 dark:hover:bg-[#08CB00]/20">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
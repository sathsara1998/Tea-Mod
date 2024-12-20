'use client'

import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ThemeToggleProps = {
  side?: 'left' | 'top' | 'right' | 'bottom'
}

const ThemeToggle = ({ side }: ThemeToggleProps) => {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <SunIcon className="h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transform transition-transform duration-300 ease-in-out dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute left-1/2 top-1/2 h-[1.4rem] w-[1.4rem] -translate-x-1/2 -translate-y-1/2 rotate-90 scale-0 transform transition-transform duration-300 ease-in-out dark:rotate-0 dark:scale-100 dark:text-white dark:opacity-90 dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side={side}>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeToggle

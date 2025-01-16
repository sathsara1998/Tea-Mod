'use client'
import React, { useState, useEffect } from 'react'
import {
  ShoppingCart,
  FileText,
  PieChart,
  ListCheck,
  LogOut,
  FileChartColumn,
  Snowflake,
  LeafIcon,
  ChevronLeft,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  IndentDecrease,
  Menu,
  LeafyGreen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { createBrowserClient } from '@/utils/supabase'
import { motion } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

const Sidebar: React.FC<{
  onSnowfallToggle: (enabled: boolean) => void
  isSnowfallEnabled: boolean
}> = ({ onSnowfallToggle, isSnowfallEnabled }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  const handleExpand = (expanded: boolean) => {
    setIsExpanded(expanded)
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    } else {
      router.push('/login')
    }
  }

  const handleSnowfallToggle = () => {
    onSnowfallToggle(!isSnowfallEnabled)
  }

  const menuItems = [
    { name: 'Dashboard', icon: <PieChart />, route: '/dashboard' },
    { name: 'Blend Creation', icon: <FileText />, route: '/create' },
    { name: 'Allocation', icon: <ListCheck />, route: '/allocate' },
    { name: 'Tea', icon: <LeafIcon />, route: '/teaInfo' },
    {
      name: 'Blends',
      icon: <FileChartColumn />,
      route: '/blendview',
    },
  ]

  return (
    <motion.div
      initial={{ width: isExpanded ? 64 : 18 }} // Initial sidebar width
      animate={{ width: isExpanded ? 256 : 64 }} // Animates width
      transition={{ duration: 0.1, type: 'tween' }} // Smooth animation
      className={cn(
        'duration-20 flex h-full flex-col bg-gray-100 text-gray-800',
      )}
    >
      <div
        className={cn(
          'flex h-full flex-col border-r transition-all duration-200 ease-in-out',
          'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900',
          isExpanded ? 'w-64' : 'w-16',
        )}
      >
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleExpand(!isExpanded)}
            className="h-10 w-10 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            {isExpanded ? (
              <IndentDecrease className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            ) : (
              <Menu className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            )}
          </Button>
        </div>

        <div className="mb-8 flex flex-col items-center p-4">
          <motion.span
            className={cn(
              'font-bold tracking-wide transition-all duration-300',
              'text-slate-800 dark:text-slate-200',
              isExpanded ? 'text-xl' : 'text-sm opacity-80',
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isExpanded ? 'Tea Management' : 'TM'}
          </motion.span>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </div>

        <nav className="flex-1 px-2">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link href={item.route} className="block">
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start rounded-lg text-left transition-colors',
                      'hover:bg-slate-200 dark:hover:bg-slate-800',
                      'text-slate-800 dark:text-slate-200',
                      isExpanded ? 'my-5 px-2 py-7' : 'my-5 px-2 py-7',
                      'flex items-center',
                      pathname === item.route &&
                        'bg-slate-200 dark:bg-slate-800',
                    )}
                  >
                    <span
                      className={cn(
                        'flex items-center',
                        isExpanded ? 'mr-3' : 'mr-0',
                      )}
                    >
                      {item.icon}
                    </span>
                    {isExpanded && <span>{item.name}</span>}
                  </Button>
                </Link>
              </li>
            ))}

            {/* <li>
              <Button
                variant="ghost"
                onClick={handleSnowfallToggle}
                className={cn(
                  'w-full justify-start rounded-lg text-left transition-colors',
                  'hover:bg-slate-200 dark:hover:bg-slate-800',
                  'text-slate-800 dark:text-slate-200',
                  isExpanded ? 'my-5 px-2 py-7' : 'my-5 px-2 py-7',
                  'flex items-center',
                )}
              >
                <span
                  className={cn(
                    'flex items-center',
                    isExpanded ? 'mr-3' : 'mr-0',
                  )}
                >
                  <LeafyGreen
                    className={
                      isSnowfallEnabled
                        ? 'text-blue-400'
                        : 'text-slate-400 dark:text-slate-600'
                    }
                  />
                </span>
                {isExpanded && (
                  <span>
                    {isSnowfallEnabled ? 'Disable Snow' : 'Enable Snow'}
                  </span>
                )}
              </Button>
            </li> */}
          </ul>
        </nav>

        <div className="flex flex-col items-center justify-center ">
          <Avatar className="mb-2 h-10 w-10">
            <AvatarImage
              src={
                user?.user_metadata?.avatar_url ||
                'https://picsum.photos/200/300'
              }
              alt="User Avatar"
            />
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {isExpanded && (
            <>
              <span className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                {user?.email || 'Loading...'}
              </span>
              <Button
                variant="destructive"
                className="mt-2 flex w-full items-center justify-center bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2" size={16} />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Sidebar

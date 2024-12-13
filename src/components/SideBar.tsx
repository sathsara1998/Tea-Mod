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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { createBrowserClient } from '@/utils/supabase'

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
    { name: 'Purchasing', icon: <ShoppingCart />, route: '/purchase' },
    { name: 'Blend Creation', icon: <FileText />, route: '/create' },
    { name: 'Allocation', icon: <ListCheck />, route: '/allocate' },
    { name: 'Tea', icon: <LeafIcon />, route: '/tea-info' },
    {
      name: 'Blends',
      icon: <FileChartColumn />,
      route: '/blend-view',
    },
  ]

  return (
    <div
      className={cn(
        'duration-20 flex h-full flex-col bg-gray-100 text-gray-800 transition-all ease-in-out',
        isExpanded ? 'w-64' : 'w-16',
      )}
      onMouseEnter={() => handleExpand(true)}
      onMouseLeave={() => handleExpand(false)}
    >
      <div className="mb-8 flex h-16 items-center p-4 text-xl font-bold">
        <span className="truncate">{isExpanded ? 'Tea Management' : 'TM'}</span>
      </div>
      <nav className="flex-1 px-2">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link href={item.route} className="block">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start rounded-lg text-left !text-gray-800 transition-colors hover:bg-gray-200',
                    isExpanded ? 'my-5 px-2 py-7' : 'my-5 px-2 py-7',
                    'flex items-center',
                    pathname === item.route && 'bg-gray-200',
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

          {/* Snowfall Toggle */}
          <li>
            <Button
              variant="ghost"
              onClick={handleSnowfallToggle}
              className={cn(
                'w-full justify-start rounded-lg text-left !text-gray-800 transition-colors hover:bg-gray-200',
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
                <Snowflake
                  className={
                    isSnowfallEnabled ? 'text-blue-400' : 'text-gray-400'
                  }
                />
              </span>
              {isExpanded && (
                <span>
                  {isSnowfallEnabled ? 'Disable Snow' : 'Enable Snow'}
                </span>
              )}
            </Button>
          </li>
        </ul>
      </nav>

      <div className="flex flex-col items-center justify-center p-4">
        <Avatar className="mb-2 h-10 w-10">
          <AvatarImage
            src={
              user?.user_metadata?.avatar_url || 'https://picsum.photos/200/300'
            }
            alt="User Avatar"
          />
          <AvatarFallback>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        {isExpanded && (
          <>
            <span className="mb-2 text-sm text-gray-600">
              {user?.email || 'Loading...'}
            </span>
            <Button
              className="mt-2 flex w-full items-center justify-center rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2" size={16} />
              Logout
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default Sidebar

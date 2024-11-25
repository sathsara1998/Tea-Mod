'use client'
import React, { useState, useEffect } from 'react'
import { ShoppingCart, FileText, PieChart, ListCheck, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { createBrowserClient } from '@/utils/supabase'

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleExpand = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      router.push('/login');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <PieChart />, route: '/dashboard' },
    { name: 'Purchasing', icon: <ShoppingCart />, route: '/purchase' },
    { name: 'Blend Creation', icon: <FileText />, route: '/create' },
    { name: 'Allocation', icon: <ListCheck />, route: '/allocate' },
  ]

  return (
    <div
      className={cn(
        "bg-gray-800 text-white transition-all duration-20 ease-in-out h-full flex flex-col",
        isExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => handleExpand(true)}
      onMouseLeave={() => handleExpand(false)}
    >
      <div className="p-4 font-bold text-xl mb-8 h-16 flex items-center">
        <span className="truncate">
          {isExpanded ? "Tea Management" : "TM"}
        </span>
      </div>
      <nav className="flex-1 px-2">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link href={item.route} className="block">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full !text-white text-left hover:bg-gray-700 transition-colors rounded-lg justify-start",
                    isExpanded ? "px-2 py-7 my-5" : "px-2 py-7 my-5",
                    "flex items-center", pathname === item.route && "bg-gray-700"
                  )}
                >
                  <span className={cn("flex items-center", isExpanded ? "mr-3" : "mr-0")}>
                    {item.icon}
                  </span>
                  {isExpanded && <span>{item.name}</span>}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col items-center justify-center p-4">
        <Avatar className="h-10 w-10 mb-2">
          <AvatarImage src={user?.user_metadata?.avatar_url || 'https://picsum.photos/200/300'} alt="User Avatar" />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        {isExpanded && (
          <>
            <span className="text-sm text-gray-300 mb-2">{user?.email || 'Loading...'}</span>
            <Button
              className="bg-red-600 hover:bg-red-700 rounded-md px-4 py-2 w-full text-white mt-2 flex items-center justify-center"
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
'use client'
import React, { useState } from 'react'
import { ShoppingCart, FileText, PieChart, ListCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { usePathname } from 'next/navigation'


const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  const handleExpand = (expanded: boolean) => {
    setIsExpanded(expanded);
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
    </div>
  )
}

export default Sidebar
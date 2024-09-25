import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, FileText, PieChart , ListCheck } from "lucide-react"

interface SidebarProps {
  activeView: 'purchasing' | 'allocation' | 'dashboard' |'blend Creation'
  setActiveView: (view: 'purchasing' | 'allocation' | 'dashboard' |'blend Creation') => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getIcon = (view: string) => {
    switch (view) {
      case 'blend Creation': return <ListCheck className="h-5 w-5" />
      case 'purchasing': return <ShoppingCart className="h-5 w-5" />
      case 'allocation': return <FileText className="h-5 w-5" />
      case 'dashboard': return <PieChart className="h-5 w-5" />
      default: return null
    }
  }

  return (
    <div 
      className={`bg-gray-800 text-white p-4 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <h2 className={`text-2xl font-bold mb-6 ${isExpanded ? 'block' : 'hidden'}`}>Tea Management</h2>
      <nav>
        <ul className="space-y-2">
          {['dashboard','purchasing','blend Creation', 'allocation'].map((view) => (
            <li key={view}>
              <Button 
                variant={activeView === view ? 'secondary' : 'ghost'} 
                className={`w-full justify-start ${isExpanded ? 'px-4' : 'px-2'}`}
                onClick={() => setActiveView(view as 'purchasing' | 'allocation' | 'dashboard' | 'blend Creation')}
              >
                {getIcon(view)}
                <span className={`ml-2 ${isExpanded ? 'inline-block' : 'hidden'}`}>
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
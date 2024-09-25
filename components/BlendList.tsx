import React from 'react'
import { Badge } from "@/components/ui/badge"
import { BlendAllocation } from "./types"

interface BlendListProps {
  blendAllocations: BlendAllocation[]
  editingBlendId: string | null
  loadBlendAllocation: (blendId: string) => void
}

export default function BlendList({ blendAllocations, editingBlendId, loadBlendAllocation }: BlendListProps) {
  return (
    <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">All Blends</h2>
      {blendAllocations.map((blend) => (
        <div 
          key={blend.id} 
          className={`mb-2 p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-50 transition-colors ${editingBlendId === blend.id ? 'ring-2 ring-primary' : ''}`}
          onClick={() => loadBlendAllocation(blend.id)}
        >
          <p className="font-medium">{blend.name}</p>
          <p className="text-sm text-gray-600">{blend.blendNo}</p>
          <p className="text-sm">{blend.totalQuantity} kg</p>
          <Badge 
            variant={blend.status === 'draft' ? 'default' : blend.status === 'confirmed' ? 'success' : 'destructive'}
          >
            {blend.status.charAt(0).toUpperCase() + blend.status.slice(1)}
          </Badge>
        </div>
      ))}
    </div>
  )
}
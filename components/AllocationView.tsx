import React, { useState, useCallback } from "react"
import BlendList from "./BlendList"
import BlendForm from "./BlendForm"
import { Tea, BlendAllocation } from "./types"
import { useToast } from "@/components/ui/use-toast"

interface AllocationViewProps {
  availableTeas: Tea[]
  setAvailableTeas: React.Dispatch<React.SetStateAction<Tea[]>>
  blendAllocations: BlendAllocation[]
  setBlendAllocations: React.Dispatch<React.SetStateAction<BlendAllocation[]>>
  blendNameSequence: number
  setBlendNameSequence: React.Dispatch<React.SetStateAction<number>>
  blendNumberSequence: number
  setBlendNumberSequence: React.Dispatch<React.SetStateAction<number>>
}

export default function AllocationView({
  availableTeas,
  setAvailableTeas,
  blendAllocations,
  setBlendAllocations,
  blendNameSequence,
  setBlendNameSequence,
  blendNumberSequence,
  setBlendNumberSequence
}: AllocationViewProps) {
  const [editingBlendId, setEditingBlendId] = useState<string | null>(null)
  const [newBlend, setNewBlend] = useState<BlendAllocation>({ 
    id: "", 
    name: "", 
    blendNo: "", 
    allocations: [], 
    totalQuantity: 0, 
    toAllocate: 0,
    balance: 0,
    status: 'draft',
    createdAt: new Date()
  })
  const { toast } = useToast()

  const loadBlendAllocation = useCallback((blendId: string) => {
    const blendToLoad = blendAllocations.find(blend => blend.id === blendId)
    if (blendToLoad) {
      setNewBlend(blendToLoad)
      setEditingBlendId(blendId)
    }
  }, [blendAllocations])

  return (
    <div className="flex-1 flex">
      <BlendList 
        blendAllocations={blendAllocations} 
        editingBlendId={editingBlendId}
        loadBlendAllocation={loadBlendAllocation}
      />
      <BlendForm
        newBlend={newBlend}
        setNewBlend={setNewBlend}
        editingBlendId={editingBlendId}
        setEditingBlendId={setEditingBlendId}
        availableTeas={availableTeas}
        setAvailableTeas={setAvailableTeas}
        blendAllocations={blendAllocations}
        setBlendAllocations={setBlendAllocations}
        blendNameSequence={blendNameSequence}
        setBlendNameSequence={setBlendNameSequence}
        blendNumberSequence={blendNumberSequence}
        setBlendNumberSequence={setBlendNumberSequence}
        toast={toast}
      />
    </div>
  )
}
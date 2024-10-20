import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import BlendCard from '../BlendHeaderCreationViewComponents/BlendCard'
import NewBlendDialog from '../BlendHeaderCreationViewComponents/NewBlendDialog'
import EditBlendDialog from '../BlendHeaderCreationViewComponents/EditBlendDialog'
import { useApiMethods } from '@/hooks/useApiMethods'
import { TeaBlend } from '../types'

export type Blend = {
  id: number;
  name: string;
  blendName: string;
  quantity: number;
  status: 'draft' | 'confirmed';
  allocations: BlendAllocation[];
}

type BlendAllocation = {
  id: number;
  sale_order_id: number;
  sale_order_name: string;
  sale_order_line_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
}

type BlendsComponentProps = {
  blends: TeaBlend[];
  fetchBlends: () => Promise<void>;
}

export default function BlendsComponent({ blends, fetchBlends }: BlendsComponentProps) {
  const [newBlendName, setNewBlendName] = useState('')
  const [editingBlend, setEditingBlend] = useState<TeaBlend | null>(null)
  const { toast } = useToast()
  const { createBlend, updateBlend, deleteBlend } = useApiMethods();

  const handleCreateNewBlend = async () => {
    if (newBlendName.trim() === '') return

    try {
      await createBlend({
        blendName: newBlendName,
        allocations: []
      })

      await fetchBlends()
      setNewBlendName('')
      toast({
        title: "New Blend Created",
        description: `Created new blend: ${newBlendName}`,
      })
    } catch (error) {
      console.error('Error creating new blend:', error)
      toast({
        title: "Error",
        description: "Failed to create new blend. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleOnBlendCreated = (data) =>{
    console.log("Blend Created" , data)
  }
  const handleEditBlend = (blend: TeaBlend) => {
    setEditingBlend(blend)
  }

  const handleUpdateBlend = async () => {
    if (!editingBlend) return

    try {
      await updateBlend(editingBlend.id, editingBlend)

      await fetchBlends()
      setEditingBlend(null)
      toast({
        title: "Blend Updated",
        description: `Updated blend: ${editingBlend.name}`,
      })
    } catch (error) {
      console.error('Error updating blend:', error)
      toast({
        title: "Error",
        description: "Failed to update blend. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBlend = async (blendId: number) => {
    try {
      await deleteBlend(blendId)
      await fetchBlends()
      toast({
        title: "Blend Deleted",
        description: `Deleted blend with ID: ${blendId}`,
      })
    } catch (error) {
      console.error('Error deleting blend:', error)
      toast({
        title: "Error",
        description: "Failed to delete blend. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Blends
          <NewBlendDialog
            newBlendName={newBlendName}
            setNewBlendName={setNewBlendName}
            handleCreateNewBlend={handleCreateNewBlend}
            onCreateBlend={handleOnBlendCreated}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-200px)]">
          {blends.map((blend) => (
            <BlendCard
              key={blend.id}
              data={blend}
              onEdit={handleEditBlend}
              onDelete={handleDeleteBlend}
            />
          ))}
        </ScrollArea>
      </CardContent>
      {editingBlend && (
        <EditBlendDialog
          editingBlend={editingBlend}
          setEditingBlend={setEditingBlend}
          handleUpdateBlend={handleUpdateBlend}
        />
      )}
    </Card>
  )
}
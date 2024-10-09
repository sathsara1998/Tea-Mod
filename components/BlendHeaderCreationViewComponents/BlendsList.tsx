import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import BlendCard from '../BlendHeaderCreationViewComponents/BlendCard'
import NewBlendDialog from '../BlendHeaderCreationViewComponents/NewBlendDialog'
import EditBlendDialog from '../BlendHeaderCreationViewComponents/EditBlendDialog'
import { API_BASE_URL,API_KEY } from '../BlendHeaderCreationView'

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
  blends: Blend[];
  fetchBlends: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiRequest(endpoint: string, method: string, data?: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
  
    return response.json();
  }

export default function BlendsComponent({ blends, fetchBlends }: BlendsComponentProps) {
  const [newBlendName, setNewBlendName] = useState('')
  const [editingBlend, setEditingBlend] = useState<Blend | null>(null)
  const { toast } = useToast()

  const handleCreateNewBlend = async () => {
    if (newBlendName.trim() === '') return

    try {
      await apiRequest('/create_blend', 'POST', {
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

  const handleEditBlend = (blend: Blend) => {
    setEditingBlend(blend)
  }

  const handleUpdateBlend = async () => {
    if (!editingBlend) return

    try {
      await apiRequest(`/update_blend/${editingBlend.id}`, 'PUT', {
        blendName: editingBlend.blendName,
        status: editingBlend.status,
        allocations: editingBlend.allocations.map(a => ({
          lineId: a.sale_order_line_id,
          quantity: a.quantity
        }))
      })

      await fetchBlends()
      setEditingBlend(null)
      toast({
        title: "Blend Updated",
        description: `Updated blend: ${editingBlend.blendName}`,
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
      await apiRequest(`/delete_blend/${blendId}`, 'DELETE')
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
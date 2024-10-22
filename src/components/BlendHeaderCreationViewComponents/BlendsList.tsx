import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import BlendCard from '../BlendHeaderCreationViewComponents/BlendCard'
import NewBlendDialog, { CustomerFullBlends } from '../BlendHeaderCreationViewComponents/NewBlendDialog'
import EditBlendDialog from '../BlendHeaderCreationViewComponents/EditBlendDialog'
import { useApiMethods } from '@/hooks/useApiMethods'
import { Customer, TeaBlend } from '../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'

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
  customerId: number;
  blends: TeaBlend[];
  fetchBlends: () => Promise<void>;
  onNewBlendDataAdd: (customerBlends: CustomerFullBlends) => void;
  onEditPress: (blend: TeaBlend) => void;
}

export default function BlendsComponent({ customerId, blends, fetchBlends, onNewBlendDataAdd, onEditPress }: BlendsComponentProps) {
  const [newBlendName, setNewBlendName] = useState('')
  const [editingBlend, setEditingBlend] = useState<TeaBlend | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isNewOpen, setIsNewOpen] = useState(false);
  const { toast } = useToast()
  const { 
    createBlend, 
    updateBlend, 
    deleteBlend,
    getCustomers
  } = useApiMethods();

  const handleCreateNewBlend = async (customerOrders: CustomerFullBlends) => {
    onNewBlendDataAdd(customerOrders);
  }

  const fetchCustomers = useCallback(async () => {
    try {
      const customers = await getCustomers()
      setCustomers(customers)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }, [])

  const handleEditBlend = (blend: TeaBlend) => {
    onEditPress(blend);
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

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Blends
          <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setIsNewOpen(true)}>
                New Blend
              </Button>
            </DialogTrigger>
            <NewBlendDialog
              isEdit={false}
              isOpen={isNewOpen}
              setIsOpen={setIsNewOpen}
              onCreateBlend={handleCreateNewBlend}
              customerId={customerId}
            />
          </Dialog>
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
      {/* {editingBlend && (
        <EditBlendDialog
          editingBlend={editingBlend}
          setEditingBlend={setEditingBlend}
          handleUpdateBlend={handleUpdateBlend}
        />
      )} */}
    </Card>
  )
}
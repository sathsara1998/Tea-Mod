"use client"
import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import EditBlendDialog from './BlendHeaderCreationViewComponents/EditBlendDialog';
import TotalDemandCard from './BlendHeaderCreationViewComponents/TotalDemandCard';
import BlendCreation from './BlendHeaderCreationViewComponents/BlendCreation';
import BlendsList from './BlendHeaderCreationViewComponents/BlendsList'
import { useApiMethods } from '@/hooks/useApiMethods'
import { 
  TeaBlendDetail, 
  OrderLine, 
  SalesOrder, 
  BlendAllocation, 
  Blend, 
  SelectedBlend, 
  ConfirmedSaleOrder, 
  TeaBlend
} from './types'


export default function BlendAllocator() {
  const [confirmedSaleOrders, setConfirmedSaleOrders] = useState<ConfirmedSaleOrder[]>([])
  const [selectedSalesOrders, setSelectedSalesOrders] = useState<SalesOrder[]>([])
  const [blends, setBlends] = useState<TeaBlend[]>([])
  const [selectedBlends, setSelectedBlends] = useState<SelectedBlend[]>([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingBlend, setEditingBlend] = useState<TeaBlend | null>(null)
  const { toast } = useToast()
  const { 
    getConfirmedSaleOrders, 
    getBlends, 
    getTeaBlendSales, 
    createBlend,
    updateBlend
  } = useApiMethods();

  const fetchConfirmedSaleOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getConfirmedSaleOrders();
      setConfirmedSaleOrders(data)
    } catch (err) {
      setError('Error fetching confirmed sale orders. Please try again.')
      toast({
        title: "Error",
        description: 'Error fetching confirmed sale orders. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchBlends = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getBlends();
      
      setBlends(data);
    } catch (err: any) {
      setError('Error fetching blends. Please try again.')
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfirmedSaleOrders()
    fetchBlends()
  }, [fetchConfirmedSaleOrders, fetchBlends])

  const fetchSalesOrderDetails = async (saleOrderNumber: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getTeaBlendSales(saleOrderNumber);
      return data;
    } catch (err: any) {
      setError('Error fetching sales order details. Please try again.')
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handleSalesOrderSelect = async (orderId: string) => {
    const order = confirmedSaleOrders.find(so => so.id.toString() === orderId)
    if (order) {
      const orderDetails = await fetchSalesOrderDetails(order.name)
      if (orderDetails) {
        setSelectedSalesOrders(prev => [...prev, orderDetails])
      }
    }
  }

  const handleRemoveSalesOrder = (orderId: number) => {
    setSelectedSalesOrders(prev => prev.filter(order => order.id !== orderId))
  }

  const handleBlendSelect = (blendName: string, lineId: number, checked: boolean) => {
    if (checked) {
      setSelectedBlends(prev => {
        const existingBlend = prev.find(b => b.blendName === blendName)
        if (existingBlend) {
          return prev.map(b => 
            b.blendName === blendName 
              ? { ...b, quantities: { ...b.quantities, [lineId]: 0 } }
              : b
          )
        } else {
          return [...prev, { blendName, quantities: { [lineId]: 0 } }]
        }
      })
    } else {
      setSelectedBlends(prev => 
        prev.map(b => 
          b.blendName === blendName 
            ? { ...b, quantities: Object.fromEntries(Object.entries(b.quantities).filter(([id]) => id !== lineId.toString())) }
            : b
        ).filter(b => Object.keys(b.quantities).length > 0)
      )
    }
  }

  const handleBlendQuantityChange = (blendName: string, lineId: number, quantity: number) => {
    setSelectedBlends(prev =>
      prev.map(b => 
        b.blendName === blendName 
          ? { ...b, quantities: { ...b.quantities, [lineId]: quantity } }
          : b
      )
    )
  }

  const handleAllocateFullQuantity = (blendName: string, lineId: number, fullQuantity: number) => {
    setSelectedBlends(prev =>
      prev.map(b => 
        b.blendName === blendName 
          ? { ...b, quantities: { ...b.quantities, [lineId]: fullQuantity } }
          : b
      )
    )
  }

  const calculateTotalDemand = () => {
    return selectedBlends.map(blend => ({
      blendName: blend.blendName,
      totalQuantity: Object.values(blend.quantities).reduce((sum, q) => sum + q, 0)
    }))
  }

  const handleConfirm = async () => {
    if (selectedSalesOrders.length === 0) return

    setIsConfirming(true)

    try {
      const totalDemand = calculateTotalDemand()
      for (const demand of totalDemand) {
        const allocations = selectedSalesOrders.flatMap(order =>
          order.order_lines.map(line => ({
            lineId: line.line_id,
            quantity: selectedBlends.find(b => b.blendName === demand.blendName)?.quantities[line.line_id] || 0
          })).filter(a => a.quantity > 0)
        )

        await createBlend({
          blendName: demand.blendName,
          allocations: allocations
        })
      }

      await fetchBlends()
      toast({
        title: "Blends Created",
        description: `Created ${totalDemand.length} new blend(s).`,
      })
    } catch (error) {
      console.error('Error creating blends:', error)
      toast({
        title: "Error",
        description: "Failed to create blends. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConfirming(false)
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchConfirmedSaleOrders} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container w-full p-4 flex flex-row ml-0 mr-0">
      {/* Left Side - Blends */}
      <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4 ml-0">
        <BlendsList blends={blends} fetchBlends={fetchBlends} />
      </div>

      {/* Middle - Blend Creation */}
      <div className="w-full md:w-1/2 mb-4 md:mb-0 md:mr-4">
        <BlendCreation
          confirmedSaleOrders={confirmedSaleOrders}
          selectedSalesOrders={selectedSalesOrders}
          selectedBlends={selectedBlends}
          isConfirming={isConfirming}
          handleSalesOrderSelect={handleSalesOrderSelect}
          handleRemoveSalesOrder={handleRemoveSalesOrder}
          handleBlendSelect={handleBlendSelect}
          handleBlendQuantityChange={handleBlendQuantityChange}
          handleAllocateFullQuantity={handleAllocateFullQuantity}
          handleConfirm={handleConfirm}
        />
      </div>

      {/* Right Side - Total Demand */}
      <div className="w-full md:w-1/4">
        <TotalDemandCard totalDemand={calculateTotalDemand()} />
      </div>

      {/* Edit Blend Dialog */}
      {editingBlend && (
        <EditBlendDialog
        editingBlend={editingBlend}
        setEditingBlend={setEditingBlend}
        handleUpdateBlend={handleUpdateBlend}
      />
      )}
    </div>
  )
}
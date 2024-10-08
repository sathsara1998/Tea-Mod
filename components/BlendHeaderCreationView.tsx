"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertTriangle, RefreshCw, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import BlendCard from './BlendHeaderCreationViewComponents/BlendCard';
import { SelectedSalesOrders } from './BlendHeaderCreationViewComponents/SelectedSalesOrders';
import NewBlendDialog from './BlendHeaderCreationViewComponents/NewBlendDialog'
import EditBlendDialog from './BlendHeaderCreationViewComponents/EditBlendDialog';
import TotalDemandCard from './BlendHeaderCreationViewComponents/TotalDemandCard';
import BlendCreation from './BlendHeaderCreationViewComponents/BlendCreation';

type TeaBlendDetail = {
  product_id: number;
  product_name: string;
  quantity: number;
  uom: string;
}

type OrderLine = {
  line_id: number;
  product_id: number;
  product_name: string;
  product_uom_qty: number;
  product_uom: string;
  tea_blend_quantity: number;
  allocated_blend_quantity: number;
  tea_blend_details: TeaBlendDetail[];
}

export type SalesOrder = {
  id: number;
  name: string;
  partner_id: number;
  partner_name: string;
  date_order: string;
  amount_total: number;
  currency_id: string;
  state: string;
  order_lines: OrderLine[];
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

export type Blend = {
  id: number;
  name: string;
  blendName: string;
  quantity: number;
  status: 'draft' | 'confirmed';
  allocations: BlendAllocation[];
}

export type SelectedBlend = {
  blendName: string;
  quantities: Record<number, number>; // lineId: quantity
}

export type ConfirmedSaleOrder = {
  id: number;
  name: string;
  customer_name: string;
}

const API_BASE_URL = 'https://teatang-erp-dev-15719068.dev.odoo.com/api';
const API_KEY = 'daac9bf886540121de51681cd0f164dee3d13925';

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

export default function BlendAllocator() {
  const [confirmedSaleOrders, setConfirmedSaleOrders] = useState<ConfirmedSaleOrder[]>([])
  const [selectedSalesOrders, setSelectedSalesOrders] = useState<SalesOrder[]>([])
  const [blends, setBlends] = useState<Blend[]>([])
  const [selectedBlends, setSelectedBlends] = useState<SelectedBlend[]>([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newBlendName, setNewBlendName] = useState('')
  const [editingBlend, setEditingBlend] = useState<Blend | null>(null)
  const { toast } = useToast()

  const fetchConfirmedSaleOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiRequest('/confirmed_sale_orders', 'GET');
      setConfirmedSaleOrders(data)
    } catch (err) {
      setError('Error fetching confirmed sale orders. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchBlends = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiRequest('/get_blends', 'GET');
      // Transform the data to match our Blend type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedBlends: Blend[] = Object.values(data).map((blend: any) => ({
        id: blend.id,
        name: blend.name,
        blendName: blend.blendName,
        quantity: blend.quantity,
        status: blend.status,
        allocations: blend.allocations
      }));
      setBlends(transformedBlends)
    } catch (err) {
      setError('Error fetching blends. Please try again.')
      console.error(err)
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
      const data = await apiRequest(`/tea_blend_sales?sale_order_number=${saleOrderNumber}`, 'GET');
      if (data.length > 0) {
        return data[0]
      } else {
        throw new Error('No data found for the selected sales order')
      }
    } catch (err) {
      setError('Error fetching sales order details. Please try again.')
      console.error(err)
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

        await apiRequest('/create_blend', 'POST', {
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

  const getQuantityColor = (allocated: number, total: number) => {
    if (allocated === total) return 'bg-green-200'
    if (allocated < total) return 'bg-yellow-200'
    return 'bg-blue-200'
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
    <div className="container mx-auto p-4 flex flex-col md:flex-row">
      {/* Left Side - Blends */}
      <div className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-4">
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
        </Card>
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
"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, RefreshCw, X, ArrowRight, Info, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

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

type SalesOrder = {
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

type Blend = {
  id: number;
  name: string;
  blendName: string;
  quantity: number;
  status: 'draft' | 'confirmed';
  allocations: BlendAllocation[];
}

type SelectedBlend = {
  blendName: string;
  quantities: Record<number, number>; // lineId: quantity
}

type ConfirmedSaleOrder = {
  id: number;
  name: string;
  customer_name: string;
}

const API_BASE_URL = 'https://teatang-erp-dev-15377276.dev.odoo.com/api';
const API_KEY = '1c0054e7bd055658f79528f2bbf0ba1d1640abc4'; // Replace with your actual API key

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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Blend
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Blend</DialogTitle>
                    <DialogDescription>Enter a name for the new blend.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newBlendName}
                        onChange={(e) => setNewBlendName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateNewBlend}>Create Blend</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              {blends.map((blend) => (
                <div
                  key={blend.id}
                  className="p-2 mb-2 rounded bg-secondary flex flex-col"
                >
                  <div className="flex justify-between items-center">
                    <span>{blend.name}</span>
                    <Badge variant={blend.status === 'confirmed' ? 'default' : 'secondary'}>
                      {blend.status}
                    </Badge>
                  </div>
                  <small>Blend: {blend.blendName}</small>
                  <small>Quantity: {blend.quantity.toFixed(3)}</small>
                  <div className="flex justify-between mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Info className="h-4 w-4 mr-2" />
                          View Allocations
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <h4 className="font-semibold mb-2">Allocations</h4>
                        <ScrollArea className="h-60">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {blend.allocations.map((allocation, index) => (
                                <TableRow key={index}>
                                  <TableCell>{allocation.sale_order_name}</TableCell>
                                  <TableCell>{allocation.product_name}</TableCell>
                                  <TableCell>{allocation.quantity.toFixed(3)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="sm" onClick={() => handleEditBlend(blend)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteBlend(blend.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Middle - Blend Creation */}
      <div className="w-full md:w-1/2 mb-4 md:mb-0 md:mr-4">
        <Card>
          <CardHeader>
            <CardTitle>Create Blend</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleSalesOrderSelect}>
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select a sales order" />
              </SelectTrigger>
              <SelectContent>
                {confirmedSaleOrders.map((order) => (
                  <SelectItem key={order.id} value={order.id.toString()}>
                    {order.name} - {order.customer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSalesOrders.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedSalesOrders.map((order) => (
                  <Badge key={order.id} variant="secondary" className="flex items-center gap-1">
                    {order.name} - {order.partner_name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => handleRemoveSalesOrder(order.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {selectedSalesOrders.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sales Order</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Product Quantity</TableHead>
                    <TableHead>Blend</TableHead>
                    <TableHead>Blend Quantity</TableHead>
                    <TableHead>Allocated Blend Quantity</TableHead>
                    <TableHead>Select</TableHead>
                    <TableHead>Allocate</TableHead>
                    <TableHead>Auto Allocate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSalesOrders.flatMap((order) =>
                    order.order_lines.map((line) => (
                      <TableRow key={`${order.id}-${line.line_id}`}>
                        <TableCell>{order.name}</TableCell>
                        <TableCell>{line.product_name}</TableCell>
                        <TableCell>{line.product_uom_qty} {line.product_uom}</TableCell>
                        <TableCell>
                          {line.tea_blend_details.map((blend) => (
                            <div key={blend.product_id}>{blend.product_name}</div>
                          ))}
                        </TableCell>
                        <TableCell>
                          {line.tea_blend_details.map((blend) => (
                            <div key={blend.product_id}>{blend.quantity} {blend.uom}</div>
                          ))}
                        </TableCell>
                        <TableCell>{line.allocated_blend_quantity}</TableCell>
                        <TableCell>
                          {line.tea_blend_details.map((blend) => (
                            <div key={blend.product_id}>
                              <Checkbox
                                checked={selectedBlends.some(b => b.blendName === blend.product_name && b.quantities.hasOwnProperty(line.line_id))}
                                onCheckedChange={(checked) => handleBlendSelect(blend.product_name, line.line_id, checked === true)}
                              />
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>
                          {line.tea_blend_details.map((blend) => (
                            <div key={blend.product_id}>
                              <Input
                                type="number"
                                value={selectedBlends.find(b => b.blendName === blend.product_name)?.quantities[line.line_id] || 0}
                                onChange={(e) => handleBlendQuantityChange(blend.product_name, line.line_id, Number(e.target.value))}
                                max={blend.quantity}
                                className={`w-20 ${getQuantityColor(
                                  selectedBlends.find(b => b.blendName === blend.product_name)?.quantities[line.line_id] || 0,
                                  blend.quantity
                                )}`}
                                disabled={!selectedBlends.some(b => b.blendName === blend.product_name && b.quantities.hasOwnProperty(line.line_id))}
                              />
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>
                          {line.tea_blend_details.map((blend) => (
                            <div key={blend.product_id}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAllocateFullQuantity(blend.product_name, line.line_id, blend.quantity)}
                                disabled={!selectedBlends.some(b => b.blendName === blend.product_name && b.quantities.hasOwnProperty(line.line_id))}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            <Button onClick={handleConfirm} className="mt-4" disabled={isConfirming || selectedBlends.length === 0}>
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming
                </>
              ) : (
                'Confirm and Generate Blends'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Total Demand */}
      <div className="w-full md:w-1/4">
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle>Total Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Blend</TableHead>
                  <TableHead>Total Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculateTotalDemand().map((demand) => (
                  <TableRow key={demand.blendName}>
                    <TableCell>{demand.blendName}</TableCell>
                    <TableCell>{demand.totalQuantity.toFixed(3)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Blend Dialog */}
      {editingBlend && (
        <Dialog open={!!editingBlend} onOpenChange={() => setEditingBlend(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Blend: {editingBlend.blendName}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingBlend.blendName}
                  onChange={(e) => setEditingBlend({ ...editingBlend, blendName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingBlend.status}
                  onValueChange={(value) => setEditingBlend({ ...editingBlend, status: value as 'draft' | 'confirmed' })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingBlend.allocations.map((allocation, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`edit-allocation-${index}`} className="text-right">
                    {allocation.product_name}
                  </Label>
                  <Input
                    id={`edit-allocation-${index}`}
                    type="number"
                    value={allocation.quantity}
                    onChange={(e) => {
                      const newAllocations = [...editingBlend.allocations];
                      newAllocations[index] = { ...allocation, quantity: Number(e.target.value) };
                      setEditingBlend({ ...editingBlend, allocations: newAllocations });
                    }}
                    className="col-span-3"
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateBlend}>Update Blend</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
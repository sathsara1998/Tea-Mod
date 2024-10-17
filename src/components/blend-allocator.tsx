"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, RefreshCw, X, ArrowRight, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useApiMethods } from '@/hooks/useApiMethods'

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
  salesOrderId: number;
  salesOrderName: string;
  lineId: number;
  productName: string;
  quantity: number;
}

type Blend = {
  id: string;
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

export function BlendAllocatorComponent() {
  const [confirmedSaleOrders, setConfirmedSaleOrders] = useState<ConfirmedSaleOrder[]>([])
  const [selectedSalesOrders, setSelectedSalesOrders] = useState<SalesOrder[]>([])
  const [blends, setBlends] = useState<Blend[]>([])
  const [selectedBlends, setSelectedBlends] = useState<SelectedBlend[]>([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { getConfirmedSaleOrders, getTeaBlendSales } = useApiMethods()

  const fetchConfirmedSaleOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getConfirmedSaleOrders();
      setConfirmedSaleOrders(data)
    } catch (err: any) {
      setError('Error fetching confirmed sale orders. Please try again.')
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
  }, [fetchConfirmedSaleOrders])

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

    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    const totalDemand = calculateTotalDemand()
    const newBlends = totalDemand.map((demand, index) => {
      const allocations: BlendAllocation[] = []
      selectedSalesOrders.forEach(order => {
        order.order_lines.forEach(line => {
          const quantity = selectedBlends.find(b => b.blendName === demand.blendName)?.quantities[line.line_id] || 0
          if (quantity > 0) {
            allocations.push({
              salesOrderId: order.id,
              salesOrderName: order.name,
              lineId: line.line_id,
              productName: line.product_name,
              quantity: quantity
            })
          }
        })
      })
      return {
        id: `BLEND${blends.length + index + 1}`,
        blendName: demand.blendName,
        quantity: demand.totalQuantity,
        status: 'draft' as const,
        allocations: allocations
      }
    })

    setBlends(prev => [...prev, ...newBlends])
    setIsConfirming(false)
    toast({
      title: "Blends Created",
      description: `Created ${newBlends.length} new blend(s).`,
    })
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
            <CardTitle>Blends</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              {blends.map((blend) => (
                <div
                  key={blend.id}
                  className="p-2 mb-2 rounded bg-secondary flex flex-col"
                >
                  <div className="flex justify-between items-center">
                    <span>{blend.id}</span>
                    <Badge variant={blend.status === 'confirmed' ? 'default' : 'secondary'}>
                      {blend.status}
                    </Badge>
                  </div>
                  <small>Blend: {blend.blendName}</small>
                  <small>Quantity: {blend.quantity.toFixed(3)}</small>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-2">
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
                                <TableCell>{allocation.salesOrderName}</TableCell>
                                <TableCell>{allocation.productName}</TableCell>
                                <TableCell>{allocation.quantity.toFixed(3)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
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
    </div>
  )
}
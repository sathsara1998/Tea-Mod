"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Types
type Customer = {
  id: number;
  name: string;
}

type BlendStandard = {
  id: string;
  name: string;
}

type OrderLine = {
  id: string;
  orderId: string;
  orderName: string;
  productName: string;
  quantity: number;
  demandedBlends: BlendStandard[];
}

type Blend = {
  id: string;
  standardId: string;
  customerId: number;
  orderLines: OrderLine[];
  status: 'draft' | 'confirmed';
  blendNumber: string;
  allocations: Record<string, number>;
}

type Data = {
  customers: Customer[];
  blendStandards: BlendStandard[];
  orderLines: OrderLine[];
  blends: Blend[];
}

// Dummy data generator
const generateDummyData = (): Data => {
  const customers: Customer[] = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `Customer ${i + 1}`,
  }))

  const blendStandards: BlendStandard[] = Array.from({ length: 3 }, (_, i) => ({
    id: `BS${i + 1}`,
    name: `Blend Standard ${i + 1}`,
  }))

  const orderLines: OrderLine[] = customers.flatMap(customer =>
    Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
      id: `OL${customer.id}-${j + 1}`,
      orderId: `ORD${customer.id}-${j + 1}`,
      orderName: `Order ${customer.id}-${j + 1}`,
      productName: `Product ${j + 1}`,
      quantity: Math.floor(Math.random() * 100) + 1,
      demandedBlends: blendStandards.filter(() => Math.random() > 0.5),
    }))
  )

  const blends: Blend[] = []

  return { customers, blendStandards, orderLines, blends }
}

export default function BlendAllocator() {
  const [data, setData] = useState<Data>({ customers: [], blendStandards: [], orderLines: [], blends: [] })
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
  const [selectedBlendStandard, setSelectedBlendStandard] = useState<string | null>(null)
  const [selectedOrderLines, setSelectedOrderLines] = useState<string[]>([])
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCreatingBlend, setIsCreatingBlend] = useState(false)
  const [isEditingBlend, setIsEditingBlend] = useState(false)
  const [editingBlendId, setEditingBlendId] = useState<string | null>(null)
  const [selectedBlend, setSelectedBlend] = useState<Blend | null>(null)
  const [creationStep, setCreationStep] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    setData(generateDummyData())
  }, [])

  const generateBlendNumber = () => {
    return `BN${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
  }

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(parseInt(customerId, 10))
    setSelectedBlendStandard(null)
    setSelectedOrderLines([])
    setAllocations({})
  }

  const handleBlendStandardSelect = (blendStandardId: string) => {
    setSelectedBlendStandard(blendStandardId)
    setSelectedOrderLines([])
    setAllocations({})
  }

  const handleOrderLineSelect = (lineId: string) => {
    setSelectedOrderLines(prev => 
      prev.includes(lineId) ? prev.filter(id => id !== lineId) : [...prev, lineId]
    )
  }

  const handleAllocationChange = (lineId: string, quantity: number) => {
    setAllocations(prev => ({
      ...prev,
      [lineId]: quantity
    }))
  }

  const handleFullAllocation = (lineId: string, fullQuantity: number) => {
    setAllocations(prev => ({
      ...prev,
      [lineId]: prev[lineId] === fullQuantity ? 0 : fullQuantity
    }))
  }

  const handleBlendSelect = (blend: Blend) => {
    setSelectedBlend(blend)
    setSelectedCustomer(blend.customerId)
    setSelectedBlendStandard(blend.standardId)
    setSelectedOrderLines(blend.orderLines.map(line => line.id))
    setAllocations(blend.allocations)
  }

  const handleCreateBlend = () => {
    setSelectedCustomer(null)
    setSelectedBlendStandard(null)
    setSelectedOrderLines([])
    setAllocations({})
    setIsCreatingBlend(true)
    setIsEditingBlend(false)
    setEditingBlendId(null)
    setSelectedBlend(null)
    setCreationStep(0)
  }

  const handleEditBlend = (blend: Blend) => {
    if (blend.status === 'confirmed') {
      toast({
        title: "Cannot Edit Confirmed Blend",
        description: "Confirmed blends cannot be edited.",
        variant: "destructive",
      })
      return
    }
    setSelectedCustomer(blend.customerId)
    setSelectedBlendStandard(blend.standardId)
    setSelectedOrderLines(blend.orderLines.map(line => line.id))
    setAllocations(blend.allocations)
    setIsEditingBlend(true)
    setEditingBlendId(blend.id)
    setSelectedBlend(blend)
    setCreationStep(0)
  }

  const handleConfirm = async () => {
    setIsConfirming(true)
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    const newBlend: Blend = {
      id: editingBlendId || `BLEND${data.blends.length + 1}`,
      standardId: selectedBlendStandard!,
      customerId: selectedCustomer!,
      orderLines: data.orderLines.filter(line => selectedOrderLines.includes(line.id)),
      status: 'draft',
      blendNumber: generateBlendNumber(),
      allocations: allocations,
    }
    setData(prev => ({
      ...prev,
      blends: editingBlendId 
        ? prev.blends.map(b => b.id === editingBlendId ? newBlend : b)
        : [...prev.blends, newBlend],
    }))
    setIsConfirming(false)
    setIsCreatingBlend(false)
    setIsEditingBlend(false)
    setEditingBlendId(null)
    setSelectedBlend(newBlend)
    toast({
      title: editingBlendId ? "Blend Updated" : "Blend Created",
      description: editingBlendId ? `Blend ${newBlend.blendNumber} has been updated.` : `New blend created with number ${newBlend.blendNumber}.`,
    })
  }

  const handleConfirmBlend = async (blend: Blend) => {
    setIsConfirming(true)
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    const confirmedBlend: Blend = {
      ...blend,
      status: 'confirmed',
    }
    setData(prev => ({
      ...prev,
      blends: prev.blends.map(b => b.id === blend.id ? confirmedBlend : b),
    }))
    setIsConfirming(false)
    setSelectedBlend(confirmedBlend)
    toast({
      title: "Blend Confirmed",
      description: `Blend ${confirmedBlend.blendNumber} has been confirmed.`,
    })
  }

  const customerOrderLines = data.orderLines.filter(line => 
    line.orderId.startsWith(`ORD${selectedCustomer}`)
  )

  const demandedBlendStandards = Array.from(new Set(
    customerOrderLines.flatMap(line => line.demandedBlends.map(blend => blend.id))
  ))

  const filteredOrderLines = customerOrderLines.filter(line => 
    line.demandedBlends.some(blend => blend.id === selectedBlendStandard)
  )

  const handleNextStep = () => {
    setCreationStep(prev => Math.min(prev + 1, 2))
  }

  const handlePreviousStep = () => {
    setCreationStep(prev => Math.max(prev - 1, 0))
  }

  return (
    <div className="container mx-auto p-4 flex">
      {/* Left Side Panel */}
      <div className="w-1/4 pr-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Blends
              <Button size="sm" onClick={handleCreateBlend}>
                <Plus className="mr-2 h-4 w-4" /> New Blend
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              {data.blends.map((blend) => (
                <div
                  key={blend.id}
                  className={`p-2 mb-2 rounded bg-secondary flex justify-between items-center cursor-pointer ${selectedBlend?.id === blend.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleBlendSelect(blend)}
                >
                  <div>
                    <div>{blend.blendNumber}</div>
                    <small>Standard: {data.blendStandards.find(bs => bs.id === blend.standardId)?.name}</small>
                  </div>
                  <div>
                    <Badge variant={blend.status === 'confirmed' ? 'default' : 'secondary'} className="mr-2">
                      {blend.status}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={(e) => {
                      e.stopPropagation();
                      handleEditBlend(blend);
                    }} disabled={blend.status === 'confirmed'}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="w-3/4">
        <h1 className="text-2xl font-bold mb-4">Blend Creation</h1>

        <Dialog open={isCreatingBlend || isEditingBlend} onOpenChange={(open) => {
          if (!open) {
            setIsCreatingBlend(false)
            setIsEditingBlend(false)
            setEditingBlendId(null)
            setCreationStep(0)
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditingBlend ? 'Edit Blend' : 'Create New Blend'}</DialogTitle>
            </DialogHeader>
            {creationStep === 0 && (
              <div>
                <Select onValueChange={handleCustomerSelect} value={selectedCustomer?.toString()}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {creationStep === 1 && (
              <div>
                <Select onValueChange={handleBlendStandardSelect} value={selectedBlendStandard || undefined}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a blend standard" />
                  </SelectTrigger>
                  <SelectContent>
                    {demandedBlendStandards.map((blendId) => {
                      const blend = data.blendStandards.find(bs => bs.id === blendId)
                      return blend ? (
                        <SelectItem key={blend.id} value={blend.id}>
                          {blend.name}
                        </SelectItem>
                      ) : null
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            {creationStep === 2 && (
              <ScrollArea className="h-[300px]">
                {filteredOrderLines.map((line) => (
                  <div key={line.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      checked={selectedOrderLines.includes(line.id)}
                      onCheckedChange={() => handleOrderLineSelect(line.id)}
                    />
                    <Label>{line.productName} - {line.orderName}</Label>
                    <Input
                      type="number"
                      value={allocations[line.id] || 0}
                      onChange={(e) => handleAllocationChange(line.id, parseInt(e.target.value, 10))}
                      max={line.quantity}
                      className="w-20"
                    />
                    <Checkbox
                      checked={allocations[line.id] === line.quantity}
                      onCheckedChange={() => handleFullAllocation(line.id, line.quantity)}
                    />
                    <Label>Full</Label>
                  </div>
                ))}
              </ScrollArea>
            )}
            <div className="flex justify-between mt-4">
              <Button onClick={handlePreviousStep} disabled={creationStep === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {creationStep < 2 ? (
                <Button onClick={handleNextStep}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleConfirm} disabled={isConfirming || selectedOrderLines.length === 0}>
                  {isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming
                    </>
                  ) : (
                    isEditingBlend ? 'Update Blend' : 'Create Blend'
                  )}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Allocation Summary */}
        {selectedBlend && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Allocation Summary for Blend {selectedBlend.blendNumber}
                <Badge variant={selectedBlend.status === 'confirmed' ? 'default' : 'secondary'}>
                  {selectedBlend.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Allocation</TableHead>
                    <TableHead>Full Allocation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBlend.orderLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.orderName}</TableCell>
                      <TableCell>{line.productName}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={allocations[line.id] || 0}
                          onChange={(e) => handleAllocationChange(line.id, parseInt(e.target.value, 10))}
                          max={line.quantity}
                          className="w-20"
                          disabled={selectedBlend.status === 'confirmed'}
                        />
                        <Badge variant="outline" className="ml-2">
                          {allocations[line.id] || 0}/{line.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={allocations[line.id] === line.quantity}
                          onCheckedChange={() => handleFullAllocation(line.id, line.quantity)}
                          disabled={selectedBlend.status === 'confirmed'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {selectedBlend.status === 'draft' && (
                <Button onClick={() => handleConfirmBlend(selectedBlend)} className="mt-4" disabled={isConfirming}>
                  {isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming
                    </>
                  ) : (
                    'Confirm Blend'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
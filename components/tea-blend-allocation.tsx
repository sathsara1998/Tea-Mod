'use client'

import React, { useState, useCallback, useMemo , forwardRef } from "react"
import { Plus, Minus, X, Search, FileText, History, Download, ShoppingCart, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger , DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import dynamic from 'next/dynamic'

const jsPDF = dynamic(() => import('jspdf'), { ssr: false })
import 'jspdf-autotable'

interface Tea {
  id: string
  name: string
  boxNumber: string
  teaStandard: string
  gardenMark: string
  grade: string
  breakGrade: string
  lotNumber: string
  invoiceNumber: string
  freeQuantity: number
  packageWeight: number
  packages: number
}

interface BlendAllocation {
  id: string
  name: string
  blendNo: string
  allocations: { 
    teaId: string
    quantity: number
    packages: number
  }[]
  totalQuantity: number
  toAllocate: number
  balance: number
  status: 'draft' | 'confirmed' | 'cancel'
  createdAt: Date
}

const ForwardedSelect = forwardRef((props, ref) => (
  <Select {...props} />
))
ForwardedSelect.displayName = 'ForwardedSelect'

const generateTeas = (): Tea[] => {
  const teas: Tea[] = []
  const teaTypes = ["Assam", "Darjeeling", "Ceylon", "Earl Grey", "English Breakfast", "Green", "Oolong", "Pu-erh", "White", "Chai"]
  const grades = ["TGFOP", "FBOP", "OP", "BOP", "CTC"]
  
  for (let i = 0; i < 50; i++) {
    const teaType = teaTypes[Math.floor(Math.random() * teaTypes.length)]
    const grade = grades[Math.floor(Math.random() * grades.length)]
    const packageWeight = Math.floor(Math.random() * 10) + 20 // 20-30 kg packages
    const packages = Math.floor(Math.random() * 10) + 1 // 1-10 packages
    teas.push({
      id: `tea-${i + 1}`,
      name: `${teaType} Tea ${i + 1}`,
      boxNumber: `B${String(i + 1).padStart(3, '0')}`,
      teaStandard: `TS-${Math.floor(Math.random() * 1000)}`,
      gardenMark: `GM-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 100)}`,
      grade: grade,
      breakGrade: `BR-${Math.floor(Math.random() * 10)}`,
      lotNumber: `${teaType[0]}${String(i + 1).padStart(3, '0')}`,
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
      freeQuantity: packageWeight * packages,
      packageWeight: packageWeight,
      packages: packages
    })
  }
  
  return teas
}

export default function TeaBlendAllocation() {
  const [availableTeas, setAvailableTeas] = useState<Tea[]>(generateTeas())
  const [searchTerm, setSearchTerm] = useState("")
  const [blendAllocations, setBlendAllocations] = useState<BlendAllocation[]>([])
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
  const [editingBlendId, setEditingBlendId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [allocationMode, setAllocationMode] = useState<'kg' | 'package'>('kg')
  const [blendNameSequence, setBlendNameSequence] = useState(567)
  const [blendNumberSequence, setBlendNumberSequence] = useState(1000001)
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<'draft' | 'confirmed' | 'cancel'>('draft')
  const [activeView, setActiveView] = useState<'purchasing' | 'allocation' | 'dashboard'>('allocation')
  const { toast } = useToast()

  const filteredTeas = useMemo(() => {
    return availableTeas.filter(tea => 
      tea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tea.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tea.teaStandard.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tea.gardenMark.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [availableTeas, searchTerm])

  const handleQuantityChange = useCallback((teaId: string, quantity: number, packages: number) => {
    if (newBlend.status === 'confirmed' || newBlend.status === 'cancel') return

    setNewBlend(prevBlend => {
      const updatedAllocations = prevBlend.allocations.map(a => 
        a.teaId === teaId ? { ...a, quantity, packages } : a
      )
      const totalQuantity = updatedAllocations.reduce((sum, a) => sum + a.quantity, 0)
      return { ...prevBlend, allocations: updatedAllocations, totalQuantity }
    })
  }, [newBlend.status])

  const addTeaToBlend = useCallback((tea: Tea, quantity: number, packages: number) => {
    if (newBlend.status === 'confirmed' || newBlend.status === 'cancel') return

    if (quantity <= 0 || quantity > tea.freeQuantity) {
      toast({
        title: "Invalid quantity",
        description: `Please enter a quantity between 1 and ${tea.freeQuantity}.`,
        variant: "destructive",
      })
      return
    }

    setNewBlend(prevBlend => {
      const existingAllocation = prevBlend.allocations.find(a => a.teaId === tea.id)
      if (existingAllocation) {
        return {
          ...prevBlend,
          allocations: prevBlend.allocations.map(a => 
            a.teaId === tea.id 
              ? { ...a, quantity: a.quantity + quantity, packages: a.packages + packages } 
              : a
          ),
          totalQuantity: prevBlend.totalQuantity + quantity
        }
      } else {
        const updatedAllocations = [...prevBlend.allocations, { teaId: tea.id, quantity, packages }]
        const totalQuantity = updatedAllocations.reduce((sum, a) => sum + a.quantity, 0)
        if (totalQuantity > prevBlend.toAllocate) {
          toast({
            title: "Exceeds allocation",
            description: `The total quantity exceeds the amount to allocate. Please adjust the quantity.`,
            variant: "destructive",
          })
          return prevBlend
        }
        return {
          ...prevBlend,
          allocations: updatedAllocations,
          totalQuantity,
        }
      }
    })

    // Clear the input field after adding
    const input = document.querySelector(`input[data-tea-id="${tea.id}"]`) as HTMLInputElement
    if (input) input.value = ""
  }, [newBlend.status, toast])

  const removeTeaFromBlend = useCallback((teaId: string) => {
    if (newBlend.status === 'confirmed' || newBlend.status === 'cancel') return

    setNewBlend(prevBlend => {
      const updatedAllocations = prevBlend.allocations.filter(a => a.teaId !== teaId)
      const totalQuantity = updatedAllocations.reduce((sum, a) => sum + a.quantity, 0)
      return { ...prevBlend, allocations: updatedAllocations, totalQuantity }
    })
  }, [newBlend.status])

  const generateBlend = useCallback(() => {
    const currentYear = new Date().getFullYear().toString().slice(-2)
    const newBlendName = `BSTD${String(blendNameSequence).padStart(6, '0')}`
    const newBlendNumber = `${currentYear}/${blendNumberSequence}`
    
    const newBlendAllocation: BlendAllocation = {
      id: Date.now().toString(),
      name: newBlendName,
      blendNo: newBlendNumber,
      allocations: [],
      totalQuantity: 0,
      toAllocate: 0,
      balance: 0,
      status: 'draft',
      createdAt: new Date()
    }

    setBlendAllocations(prevAllocations => [...prevAllocations, newBlendAllocation])
    setNewBlend(newBlendAllocation)
    setEditingBlendId(newBlendAllocation.id)
    setBlendNameSequence(prev => prev + 1)
    setBlendNumberSequence(prev => prev + 1)

    toast({
      title: "New Blend Generated",
      description: `A new blend ${newBlendName} has been created in draft status.`,
    })
  }, [blendNameSequence, blendNumberSequence, toast])

  const addBlendAllocation = useCallback(() => {
    if (newBlend.status === 'confirmed' || newBlend.status === 'cancel') return

    if (!newBlend.name || !newBlend.blendNo) {
      toast({
        title: "Missing information",
        description: "Please enter both a blend name and blend number.",
        variant: "destructive",
      })
      return
    }

    if (newBlend.allocations.length === 0) {
      toast({
        title: "No teas allocated",
        description: "Please allocate at least one tea to the blend.",
        variant: "destructive",
      })
      return
    }

    if (newBlend.totalQuantity !== newBlend.toAllocate) {
      toast({
        title: "Allocation mismatch",
        description: "The total allocated quantity does not match the amount to allocate.",
        variant: "destructive",
      })
      return
    }

    setBlendAllocations(prevAllocations => {
      if (editingBlendId) {
        return prevAllocations.map(blend => 
          blend.id === editingBlendId ? { ...newBlend, id: editingBlendId } : blend
        )
      } else {
        return [...prevAllocations, { ...newBlend, id: Date.now().toString() }]
      }
    })

    // Update available quantities
    setAvailableTeas(prevTeas => 
      prevTeas.map(tea => {
        const allocation = newBlend.allocations.find(a => a.teaId === tea.id)
        return allocation
          ? { ...tea, freeQuantity: tea.freeQuantity - allocation.quantity, packages: tea.packages - allocation.packages }
          : tea
      })
    )

    setNewBlend({ id: "", name: "", blendNo: "", allocations: [], totalQuantity: 0, toAllocate: 0, balance: 0, status: 'draft', createdAt: new Date() })
    setEditingBlendId(null)

    toast({
      title: `Blend ${editingBlendId ? "updated" : "added"}`,
      description: `${newBlend.name} has been successfully ${editingBlendId ? "updated" : "added"}.`,
    })
  }, [newBlend, editingBlendId, toast])

  const loadBlendAllocation = useCallback((blendId: string) => {
    const blendToLoad = blendAllocations.find(blend => blend.id === blendId)
    if (blendToLoad) {
      setNewBlend(blendToLoad)
      setEditingBlendId(blendId)
    }
  }, [blendAllocations])

  const changeBlendStatus = useCallback((newStatus: 'draft' | 'confirmed' | 'cancel') => {
    if (newBlend.status === 'confirmed' || newBlend.status === 'cancel') return

    setNewBlend(prevBlend => ({ ...prevBlend, status: newStatus }))
    if (editingBlendId) {
      setBlendAllocations(prevAllocations =>
        prevAllocations.map(blend =>
          blend.id === editingBlendId ? { ...blend, status: newStatus } : blend
        )
      )
    }
    toast({
      title: "Status changed",
      description: `The blend status has been changed to ${newStatus}.`,
    })
    setIsStatusChangeDialogOpen(false)
  }, [newBlend.status, editingBlendId, toast])

  const generatePDF = useCallback((blend: BlendAllocation) => {
    if (typeof window === 'undefined') return; // Ensure we're on the client side

    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF()
        
        // Add title
        doc.setFontSize(18)
        doc.text(`Blend Report: ${blend.name}`, 14, 22)
        
        // Add blend details
        doc.setFontSize(12)
        doc.text(`Blend Number: ${blend.blendNo}`, 14, 32)
        doc.text(`Total Quantity: ${blend.totalQuantity} kg`, 14, 40)
        doc.text(`To Allocate: ${blend.toAllocate} kg`, 14, 48)
        doc.text(`Status: ${blend.status}`, 14, 56)
        
        // Add tea allocations table
        const tableData = blend.allocations.map(allocation => {
          const tea = availableTeas.find(t => t.id === allocation.teaId)!
          return [
            tea.name,
            tea.lotNumber,
            allocation.quantity.toString(),
            allocation.packages.toString(),
            tea.grade,
            tea.gardenMark,
            tea.teaStandard,
          ]
        })
        
        doc.autoTable({
          startY: 65,
          head: [['Tea Name', 'Lot Number', 'Quantity (kg)', 'Packages', 'Grade', 'Garden Mark', 'Tea Standard']],
          body: tableData,
        })
        
        // Save the PDF
        doc.save(`${blend.name}_report.pdf`)
        
        toast({
          title: "PDF Report Generated",
          description: `The report for ${blend.name} has been generated and downloaded.`,
        })
      })
    }).catch(error => {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    })
  }, [availableTeas, toast])

  const isReadOnly = newBlend.status === 'confirmed' || newBlend.status === 'cancel'


  

  const renderSidebar = () => (
    <div className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">Tea Management</h2>
      <nav>
        <ul className="space-y-2">
          {['purchasing', 'allocation', 'dashboard'].map((view) => (
            <li key={view}>
              <Button 
                variant={activeView === view ? 'secondary' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveView(view as 'purchasing' | 'allocation' | 'dashboard')}
              >
                {view === 'purchasing' && <ShoppingCart className="mr-2 h-4 w-4" />}
                {view === 'allocation' && <FileText className="mr-2 h-4 w-4" />}
                {view === 'dashboard' && <PieChart className="mr-2 h-4 w-4" />}
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )

  const renderPurchasingView = () => (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Purchasing</h2>
      <p>This is the purchasing view. Implement your purchasing logic here.</p>
    </div>
  )

  const renderDashboardView = () => (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p>This is the dashboard view. Implement your dashboard logic here.</p>
    </div>
  )

  const renderAllocationView = () => (
    <div className="flex-1 flex">
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

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{editingBlendId ? "Edit" : "Create New"} Blend Allocation</CardTitle>
            <div className="space-x-2">
              <Button onClick={generateBlend}>Generate Blend</Button>
              <Button onClick={() => generatePDF(newBlend)} disabled={!editingBlendId}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="blendName">Blend Name</Label>
                  <Input
                    id="blendName"
                    value={newBlend.name}
                    onChange={(e) => setNewBlend(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter blend name"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="blendNo">Blend Number</Label>
                  <Input
                    id="blendNo"
                    value={newBlend.blendNo}
                    onChange={(e) => setNewBlend(prev => ({ ...prev, blendNo: e.target.value }))}
                    placeholder="Enter blend number"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="toAllocate">Quantity to Allocate (kg)</Label>
                  <Input
                    id="toAllocate"
                    type="number"
                    value={newBlend.toAllocate}
                    onChange={(e) => setNewBlend(prev => ({ ...prev, toAllocate: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter quantity to allocate"
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={isReadOnly}>Add Tea</Button>
                  </DialogTrigger>
                  <DialogContent  className="sm:max-w-[800px] bg-background">
                    <DialogHeader>
                      <DialogTitle>Available Teas</DialogTitle>
                      <DialogDescription>
      Select teas to add to your blend allocation.
    </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Search className="w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="Search teas..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-between mb-2">
                        <Badge variant="secondary">
                          Current: {newBlend.totalQuantity} kg
                        </Badge>
                        <Badge variant="secondary">
                          To Allocate: {newBlend.toAllocate} kg
                        </Badge>
                      </div>
                      <Tabs defaultValue="kg" onValueChange={(value) => setAllocationMode(value as 'kg' | 'package')}>
                        <TabsList>
                          <TabsTrigger value="kg">Allocate by KG</TabsTrigger>
                          <TabsTrigger value="package">Allocate by Package</TabsTrigger>
                        </TabsList>
                        <TabsContent value="kg">
                          <ScrollArea className="h-[300px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Tea</TableHead>
                                  <TableHead>Lot Number</TableHead>
                                  <TableHead>Available (kg)</TableHead>
                                  <TableHead>Quantity (kg)</TableHead>
                                  <TableHead>Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredTeas.map((tea) => {
                                  const allocatedQuantity = newBlend.allocations.find(a => a.teaId === tea.id)?.quantity || 0
                                  return (
                                    <TableRow key={tea.id}>
                                      <TableCell>{tea.name}</TableCell>
                                      <TableCell>{tea.lotNumber}</TableCell>
                                      <TableCell>{tea.freeQuantity}</TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          placeholder="Quantity (kg)"
                                          min={0}
                                          max={tea.freeQuantity}
                                          data-tea-id={tea.id}
                                        />
                                        {allocatedQuantity > 0 && (
                                          <span className="text-red-500 text-sm ml-2">
                                            Allocated: {allocatedQuantity} kg
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            const input = document.querySelector(`input[data-tea-id="${tea.id}"]`) as HTMLInputElement
                                            const quantity = parseInt(input.value || '0')
                                            const packages = Math.ceil(quantity / tea.packageWeight)
                                            addTeaToBlend(tea, quantity, packages)
                                          }}
                                        >
                                          Add
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </TabsContent>
                        <TabsContent value="package">
                          <ScrollArea className="h-[300px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Tea</TableHead>
                                  <TableHead>Lot Number</TableHead>
                                  <TableHead>Available Packages</TableHead>
                                  <TableHead>Package Weight (kg)</TableHead>
                                  <TableHead>Packages</TableHead>
                                  <TableHead>Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredTeas.map((tea) => {
                                  const allocatedPackages = newBlend.allocations.find(a => a.teaId === tea.id)?.packages || 0
                                  return (
                                    <TableRow key={tea.id}>
                                      <TableCell>{tea.name}</TableCell>
                                      <TableCell>{tea.lotNumber}</TableCell>
                                      <TableCell>{tea.packages}</TableCell>
                                      <TableCell>{tea.packageWeight}</TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          placeholder="Packages"
                                          min={0}
                                          max={tea.packages}
                                          data-tea-id={tea.id}
                                        />
                                        {allocatedPackages > 0 && (
                                          <span className="text-red-500 text-sm ml-2">
                                            Allocated: {allocatedPackages} packages
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            const input = document.querySelector(`input[data-tea-id="${tea.id}"]`) as HTMLInputElement
                                            const packages = parseInt(input.value || '0')
                                            const quantity = packages * tea.packageWeight
                                            addTeaToBlend(tea, quantity, packages)
                                          }}
                                        >
                                          Add
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </DialogContent>
                </Dialog>
                <Badge variant="outline" className="ml-2">
                  Current: {newBlend.totalQuantity} kg
                </Badge>
                <Badge variant="outline" className="ml-2">
                  To Allocate: {newBlend.toAllocate} kg
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tea</TableHead>
                    <TableHead>Quantity (kg)</TableHead>
                    <TableHead>Packages</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newBlend.allocations.map((allocation) => {
                    const tea = availableTeas.find(t => t.id === allocation.teaId)!
                    return (
                      <TableRow key={allocation.teaId}>
                        <TableCell>{tea.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={allocation.quantity}
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value) || 0
                              const packages = Math.ceil(quantity / tea.packageWeight)
                              handleQuantityChange(allocation.teaId, quantity, packages)
                            }}
                            min={0}
                            max={tea.freeQuantity}
                            readOnly={isReadOnly}
                          />
                        </TableCell>
                        <TableCell>{allocation.packages}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newQuantity = allocation.quantity + tea.packageWeight
                                const newPackages = allocation.packages + 1
                                handleQuantityChange(allocation.teaId, newQuantity, newPackages)
                              }}
                              disabled={isReadOnly || allocation.quantity + tea.packageWeight > tea.freeQuantity}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newQuantity = allocation.quantity - tea.packageWeight
                                const newPackages = allocation.packages - 1
                                handleQuantityChange(allocation.teaId, newQuantity, newPackages)
                              }}
                              disabled={isReadOnly || allocation.packages <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeTeaFromBlend(allocation.teaId)}
                              disabled={isReadOnly}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center">
                <AlertDialog open={isStatusChangeDialogOpen} onOpenChange={setIsStatusChangeDialogOpen}>
                  <AlertDialogTrigger asChild>
                    
                  <ForwardedSelect
          value={newBlend.status}
          onValueChange={(value: 'draft' | 'confirmed' | 'cancel') => {
            setNewStatus(value)
            setIsStatusChangeDialogOpen(true)
          }}
          disabled={isReadOnly}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancel">Cancel</SelectItem>
          </SelectContent>
        </ForwardedSelect>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Change Blend Status</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to change the status to {newStatus}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => changeBlendStatus(newStatus)}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={addBlendAllocation} disabled={isReadOnly || newBlend.totalQuantity !== newBlend.toAllocate}>
                  {editingBlendId ? "Update" : "Add"} Blend Allocation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen">
      {renderSidebar()}
      {activeView === 'purchasing' && renderPurchasingView()}
      {activeView === 'allocation' && renderAllocationView()}
      {activeView === 'dashboard' && renderDashboardView()}
    </div>
  )
}
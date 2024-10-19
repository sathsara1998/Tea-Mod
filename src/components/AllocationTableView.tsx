

import React, { useState, useEffect, useRef , useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger , DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Info, Search } from "lucide-react"
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import "tabulator-tables/dist/css/tabulator.min.css"
import { generatePDF, generateTestData } from '@/lib/utils'
import BlendInformationSection, { FormField } from './BlendInformation'
import BlendList from './BlendList'
import AvailableTeaDialog from './AvailableTeaDialog'
import SelectBlendsDialog from './SelectBlendsDialog'
import { useApiMethods } from '@/hooks/useApiMethods'
import { useToast } from './ui/use-toast'
import { 
  Blend, 
  BlendInfo, 
  TeaAllocation, 
  BlendAllocation, 
  ManufacturingAllocationTableData, 
  TeaBlend
} from './types'


interface Tea {
  id: string
  name: string
  lotNumber: string
  freeQuantity: number
  packageWeight: number
  origin: string
  harvestDate: string
  grade: string,
  type:string
}

interface Allocation {
  teaId: string
  quantity: number
  packages: number
}

export default function AllocationTableView() {
  const [blend, setBlend] = useState<Blend>({
    id: 0,
    name: '',
    blendName: '',
    quantity: 0,
    status: 'draft',
    allocations: []
  })
  const [allocations, setAllocations] = useState<ManufacturingAllocationTableData[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBlendDialogOpen, setIsBlendDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [availableTeas, setAvailableTeas] = useState<Tea[]>([])
  const [selectedTeas, setSelectedTeas] = useState<Tea[]>([])
  const [selectedRowCount, setSelectedRowCount] = useState(0)
  const [selectedBlend, setSelectedBlend] = useState<TeaBlend>();
  const [isDraftBlend, setIsDraftBlend] = useState(true);
  const [isGenerateConfirmOpen, setIsGenerateConfirmOpen] = useState(false);

  const { getBlendById } = useApiMethods();
  const { toast } = useToast()
  
  const allocationsTableRef = useRef(null)
  const blendsTableRef = useRef(null)
  const availableTeaTableRef = useRef(null)
  const tabulatorRef = useRef<Tabulator>(null)

  useEffect(() => {
    if (allocationsTableRef.current) {
      tabulatorRef.current = new Tabulator(allocationsTableRef.current, {
        data: allocations,
        height: "600px",
        selectableRows: isDraftBlend,
        columns: [
          { title: "#", formatter: "rownum", width: 60, hozAlign: "center" },
          { title: "Tea", field: "lot_name", hozAlign: "center"},
          { title: "Lot Number", field: "lot_id", hozAlign: "center"},
          { title: "Allocated Quantity (kg)", field: "allocated_qty", hozAlign: "center"},
          { title: "Package Weight (kg)", field: "quantity_kgs", hozAlign: "center", editor: "number", editorParams: {
            min: 0,
            step: 0.1,
          }},
          { title: "Allocated Packages", field: "quantity_packages", hozAlign: "center", editor: "number", editorParams: {
            min: 0,
            step: 1,
          }},
        ],
      })

      tabulatorRef.current.on("rowSelectionChanged", function(data: any, rows: any){
        setSelectedRowCount(data.length)
      })

      tabulatorRef.current.on("cellEdited", function(cell: any){
        const row = cell.getRow()
        const data = row.getData()
        if (cell.getField() === "quantity_kgs") {
          handleQuantityChange(data.lot_name, cell.getValue(), 'kg')
        } else if (cell.getField() === "packages") {
          handleQuantityChange(data.lot_name, cell.getValue(), 'packages')
        }
      })

      return () => {
        if (tabulatorRef.current) {
          tabulatorRef.current.destroy()
        }
      }
    }
  }, [allocations, availableTeas])

  useEffect(() => {
    if (availableTeaTableRef.current) {
      const table = new Tabulator(availableTeaTableRef.current, {
        data: availableTeas,
        columns: [
          { title: "Select", formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 60 },
          { title: "Tea", field: "name" },
          { title: "Lot Number", field: "lotNumber" },
          { title: "Available (kg)", field: "freeQuantity" },
          { title: "Package Weight (kg)", field: "packageWeight" },
          { title: "Type", field: "type" },

        ],
        layout: "fitColumns",
        height: "400px",
        selectable: true,
        selectableRollingSelection: false,
      })

      table.on("rowSelectionChanged", function(data: any, rows: any){
        setSelectedTeas(data)
      })

      return () => {
        table.destroy()
      }
    }
  }, [availableTeas, searchTerm])

  const handleQuantityChange = (lotName: string, newValue: number, unit: 'kg' | 'packages') => {
    setAllocations(prev => prev.map(a => {
      if (a.lot_name === lotName) {
          if (unit === 'kg') {
            // return { ...a, quantity: Math.max(0, newValue), packages: Math.ceil(newValue / tea.packageWeight) }
          } else {
            return { ...a, allocated_qty: newValue * a.quantity_kgs, quantity_packages: Math.max(0, newValue) }
          }
      }
      return a
    }))
    updateTotalQuantity()
  }

  const addTeaToBlend = (tea: TeaAllocation, quantity: number) => {
    const existingAllocation = allocations.find(a => a.lot_name === tea.box_number)
    if (existingAllocation) {
      setAllocations(prev => prev.map(a => 
        a.lot_name === tea.box_number 
          ? { 
              ...a, 
              quantity: a.allocated_qty + quantity, 
              packages: Math.ceil((a.allocated_qty + quantity) / tea.net_weight),
              type: tea.blend_line_type  // Ensure type is updated even for existing allocations
            }
          : a
      ))
    } else {
      const newAllocation : ManufacturingAllocationTableData = {
        id: Math.random(),
        lot_name: tea.box_number,
        lot_id: Number(tea.lot_no),
        allocated_qty: tea.allocated_qty,
        quantity_kgs: tea.net_weight,
        quantity_packages: tea.allocated_packages,
        unit_cost: tea.purchased_price
      }
      setAllocations(prev => [...prev, newAllocation])
    }
    updateTotalQuantity()
  }

  const addSelectedTeasToBlend = (selectedTeas: TeaAllocation[]) => {
    selectedTeas.forEach(tea => {
      addTeaToBlend(tea, tea.net_weight)
    })
    setIsDialogOpen(false)
  }

  const updateTotalQuantity = () => {
    const total = allocations.reduce((sum, allocation) => sum + allocation.allocated_qty, 0)
    setBlend(prev => ({ ...prev, totalQuantity: total }))
  }

  const handleRemoveSelectedTeas = () => {
    if (tabulatorRef.current) {
      const selectedData = tabulatorRef.current.getSelectedData()
      if (selectedData.length > 0) {
        setIsConfirmDialogOpen(true)
      }
    }
  }

  const confirmRemoveSelectedTeas = () => {
    if (tabulatorRef.current) {
      const selectedData = tabulatorRef.current.getSelectedData()
      const selectedIds = selectedData.map((row: any) => row.id)
      setAllocations(prev => prev.filter((a: any) => !selectedIds.includes(a.id)))
      tabulatorRef.current.deselectRow()
      setSelectedRowCount(0)
      setIsConfirmDialogOpen(false)
      updateTotalQuantity()
    }
  }

  const selectAllRows = () => {
    if (tabulatorRef.current) {
      tabulatorRef.current.selectRow()
    }
  }

  const deselectAllRows = () => {
    if (tabulatorRef.current) {
      tabulatorRef.current.deselectRow()
    }
  }

  const [blendInfo, setBlendInfo] = useState<BlendInfo>({
    blendNo: '',
    blendRefNo: '',
    date: '',
    blendStandard: '',
    propSample: 0,
    requiredDate: '',
    packagingType: '',
    status: '',
    customer: 0,
    customerName: '',
    totalAllocated: 0,
    averagePrice: 0,
    averageCostToAllocate: 0,
    balanceToAllocate: 0,
    teaCost: 0
  })

  const handleBlendInfoChange = useCallback((info: Partial<BlendInfo>) => {
    setBlendInfo(prev => ({ ...prev, ...info }))
  }, [])

  const handleGenerateBlendSheet = useCallback(async () => {
    // Create a BlendAllocation object from blendInfo and allocations
    const blendAllocation: BlendAllocation = {
      ...blendInfo,
      allocations: allocations,
      // Add any other necessary fields
    }

    setIsGenerateConfirmOpen(false);

    const success = await generatePDF(blendAllocation, availableTeas)
    if (success) {
      console.log("Blend sheet generated successfully")
      // You can add a success message for the user here
    } else {
      console.error("Failed to generate blend sheet")
      // You can add an error message for the user here
    }
  }, [blendInfo, allocations, availableTeas])

  // Get blend data by blendid
  const fetchBlendData = useCallback(async (id: string) => {
    try {
      const data = await getBlendById(id)
      const teas: TeaBlend = data[0];
      const teablendInfo : BlendInfo = {
        blendNo: teas.name,
        blendRefNo: "",
        date: "",
        blendStandard: teas.product_name,
        propSample: 0,
        requiredDate: "",
        packagingType: "",
        status: teas.status,
        customer: teas.customer_id,
        customerName: teas.customer_name,
        totalAllocated: teas.allocated_quantity,
        averagePrice: teas.average_cost,
        averageCostToAllocate: teas.average_cost,
        balanceToAllocate: teas.export_quantity,
        teaCost: teas.average_cost
      }
      setBlendInfo(teablendInfo);
      const tableData = teas.manufacturing_allocations.map(item => {
        return {
         ...item,
         allocated_qty: item.quantity_kgs * item.quantity_packages
        }
      })
      setAllocations(tableData)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
    }
  }, [])

  useEffect(() => {
    if (selectedBlend) {
      fetchBlendData(selectedBlend.name)
    }
  }, [selectedBlend])

  return (
  <>
  
    <div className="p-4 mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tea Blend Allocation</h1>
      <div className="flex gap-4">
        <div>
        <Card className="flex-grow">
          <CardHeader className="top-0 z-10 flex flex-row items-center justify-between">
            <CardTitle>Selected Blend</CardTitle>
            <div className="flex gap-2">
              <label className="text-md">
                {selectedBlend? selectedBlend.name : '-'}
              </label>
              <Dialog open={isBlendDialogOpen} onOpenChange={setIsBlendDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 text-white">Select Blend</Button>
                </DialogTrigger>
                <SelectBlendsDialog
                  isOpen={isBlendDialogOpen}
                  onClose={() => setIsBlendDialogOpen(false)}
                  onSelectBlend={setSelectedBlend}
                />
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <FormField label="Total Allocated" value={blendInfo.totalAllocated} readOnly />
              <FormField label="Average Price" value={blendInfo.averagePrice} readOnly />
              <FormField label="Avg Cost to Allocate" value={blendInfo.averageCostToAllocate} readOnly />
              <FormField label="Balance to Allocate" value={blendInfo.balanceToAllocate} readOnly />
              <FormField label="Tea Cost" value={blendInfo.teaCost} readOnly />
            </div>
            <div ref={blendsTableRef}></div>
          </CardContent>
        </Card>
        <Card className="flex-grow">
          <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between">
            <CardTitle>Tea Allocations</CardTitle>
            {isDraftBlend && (
              <div className="flex gap-2">
              <Button onClick={selectAllRows} className="bg-blue-600 text-white">
                Select All
              </Button>
              <Button onClick={deselectAllRows} className="bg-gray-600 text-white">
                Deselect All
              </Button>
              <Button 
                onClick={handleRemoveSelectedTeas} 
                className="bg-red-600 text-white"
                disabled={selectedRowCount === 0}
              >
                Remove Selected Teas ({selectedRowCount})
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 text-white">Add Tea</Button>
                </DialogTrigger>
                <AvailableTeaDialog
                  isOpen={isDialogOpen}
                  onClose={() => setIsDialogOpen(false)}
                  onAddTeas={addSelectedTeasToBlend}
                />
              </Dialog>
            </div>
            )}
          </CardHeader>
          <CardContent>
            <div ref={allocationsTableRef}></div>
          </CardContent>
        </Card>
        </div>
        <BlendInformationSection 
         blendInfo={blendInfo} 
         onBlendInfoChange={handleBlendInfoChange}
         onGenerateBlendSheet={() => setIsGenerateConfirmOpen(true)}
        />
      </div>
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to remove the selected teas from the blend?</p>
          <DialogFooter>
            <Button onClick={() => setIsConfirmDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={confirmRemoveSelectedTeas} className="bg-red-600 text-white">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation for generate button */}
      <Dialog open={isGenerateConfirmOpen} onOpenChange={setIsGenerateConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Generation</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to generate the blend?</p>
          <DialogFooter>
            <Button onClick={() => setIsGenerateConfirmOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleGenerateBlendSheet} className="bg-green-600 text-white">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </>
  )
}
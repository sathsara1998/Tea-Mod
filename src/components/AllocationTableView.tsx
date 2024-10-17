

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
import BlendInformationSection from './BlendInformation'
import BlendList from './BlendList'
import AvailableTeaDialog from './AvailableTeaDialog'
import { BlendAllocation } from './types'


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

interface Blend {
  name: string
  number: string
  totalQuantity: number
  status: 'draft' | 'confirmed' | 'cancelled'
}




// interface Tea {
//   id: string
//   name: string
//   lotNumber: string
//   freeQuantity: number
//   packageWeight: number
//   origin: string
//   harvestDate: string
//   grade: string
// }

// interface Allocation {
//   teaId: string
//   quantity: number
//   packages: number
// }

// interface Blend {
//   name: string
//   number: string
//   totalQuantity: number
//   status: 'draft' | 'confirmed' | 'cancelled'
// }




export default function AllocationTableView() {
  const [blend, setBlend] = useState<Blend>({
    name: '',
    number: '',
    totalQuantity: 0,
    status: 'draft'
  })
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [availableTeas, setAvailableTeas] = useState<Tea[]>([])
  const [selectedTeas, setSelectedTeas] = useState<Tea[]>([])
  const [selectedRowCount, setSelectedRowCount] = useState(0)
  
  const allocationsTableRef = useRef(null)
  const availableTeaTableRef = useRef(null)
  const tabulatorRef = useRef<Tabulator>(null)

  useEffect(() => {
    setAvailableTeas(generateTestData())
  }, [])

  useEffect(() => {
    if (allocationsTableRef.current) {
      tabulatorRef.current = new Tabulator(allocationsTableRef.current, {
        data: allocations,
        height: "600px",
        selectableRows: true,
        columns: [
          { title: "#", formatter: "rownum", width: 60, hozAlign: "center" },
          { title: "Tea", field: "teaId", formatter: (cell) => {
            const tea = availableTeas.find(t => t.id === cell.getValue())
            return tea ? tea.name : ''
          }},
          { title: "Lot Number", field: "teaId", formatter: (cell) => {
            const tea = availableTeas.find(t => t.id === cell.getValue())
            return tea ? tea.lotNumber : ''
          }},
          { title: "Package Weight (kg)", field: "teaId", formatter: (cell) => {
            const tea = availableTeas.find(t => t.id === cell.getValue())
            return tea ? tea.packageWeight : ''
          }},
          { title: "Quantity (kg)", field: "quantity", editor: "number", editorParams: {
            min: 0,
            step: 0.1,
          }},
          { title: "Packages", field: "packages", editor: "number", editorParams: {
            min: 0,
            step: 1,
          }},
          { title: "Type", field: "type" },
        ],
      })

      tabulatorRef.current.on("rowSelectionChanged", function(data, rows){
        setSelectedRowCount(data.length)
      })

      tabulatorRef.current.on("cellEdited", function(cell){
        const row = cell.getRow()
        const data = row.getData()
        const tea = availableTeas.find(t => t.id === data.teaId)
        if (tea) {
          if (cell.getField() === "quantity") {
            handleQuantityChange(data.teaId, cell.getValue(), 'kg')
          } else if (cell.getField() === "packages") {
            handleQuantityChange(data.teaId, cell.getValue(), 'packages')
          }
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

      table.on("rowSelectionChanged", function(data, rows){
        setSelectedTeas(data)
      })

      return () => {
        table.destroy()
      }
    }
  }, [availableTeas, searchTerm])

  const handleQuantityChange = (teaId: string, newValue: number, unit: 'kg' | 'packages') => {
    setAllocations(prev => prev.map(a => {
      if (a.teaId === teaId) {
        const tea = availableTeas.find(t => t.id === teaId)
        if (tea) {
          if (unit === 'kg') {
            return { ...a, quantity: Math.max(0, newValue), packages: Math.ceil(newValue / tea.packageWeight) }
          } else {
            return { ...a, quantity: newValue * tea.packageWeight, packages: Math.max(0, newValue) }
          }
        }
      }
      return a
    }))
    updateTotalQuantity()
  }

  const addTeaToBlend = (tea: Tea, quantity: number) => {
    const existingAllocation = allocations.find(a => a.teaId === tea.id)
    if (existingAllocation) {
      setAllocations(prev => prev.map(a => 
        a.teaId === tea.id 
          ? { 
              ...a, 
              quantity: a.quantity + quantity, 
              packages: Math.ceil((a.quantity + quantity) / tea.packageWeight),
              type: tea.type  // Ensure type is updated even for existing allocations
            }
          : a
      ))
    } else {
      setAllocations(prev => [...prev, { 
        id: Math.random().toString(36).substr(2, 9), // Generate a unique id
        teaId: tea.id, 
        quantity, 
        packages: Math.ceil(quantity / tea.packageWeight),
        type: tea.type  // Add type to new allocations
      }])
    }
    updateTotalQuantity()
  }

  const addSelectedTeasToBlend = (selectedTeas: Tea[]) => {
    selectedTeas.forEach(tea => {
      addTeaToBlend(tea, tea.packageWeight)
    })
    setIsDialogOpen(false)
  }

  const updateTotalQuantity = () => {
    const total = allocations.reduce((sum, allocation) => sum + allocation.quantity, 0)
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
      const selectedIds = selectedData.map(row => row.id)
      setAllocations(prev => prev.filter(a => !selectedIds.includes(a.id)))
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
    blendNo: 'B202/1270',
    blendRefNo: 'B202/1270',
    date: '2024-05-09',
    blendStandard: 'BSTD000155',
    propSample: 250,
    requiredDate: '2024-05-15',
    packagingType: 'Bulk',
    status: 'Generated',
    customer: 'ERTW002',
    customerName: 'R.TWINING & CO LTD',
    totalAllocated: 5710.000,
    averagePrice: 1.265709,
    averageCostToAllocate: 0.000,
    balanceToAllocate: 0.000,
    teaCost: 160.714
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

    const success = await generatePDF(blendAllocation, availableTeas)
    if (success) {
      console.log("Blend sheet generated successfully")
      // You can add a success message for the user here
    } else {
      console.error("Failed to generate blend sheet")
      // You can add an error message for the user here
    }
  }, [blendInfo, allocations, availableTeas])

  return (
  <>
  
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Tea Blend Allocation</h1>
      <div className="flex gap-4">
        <Card className="flex-grow">
          <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between">
            <CardTitle>Tea Allocations</CardTitle>
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
  availableTeas={availableTeas}
  onAddTeas={addSelectedTeasToBlend}
/>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={allocationsTableRef}></div>
          </CardContent>
        </Card>
        <BlendInformationSection 
         blendInfo={blendInfo} 
         onBlendInfoChange={handleBlendInfoChange}
         onGenerateBlendSheet={handleGenerateBlendSheet}
        />      </div>
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
    </div>
  </>
  )
}
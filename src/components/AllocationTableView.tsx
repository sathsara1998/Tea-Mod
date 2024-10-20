

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
  Tea, 
  ManufacturingAllocationTableData, 
  TeaBlend,
  StockLot
} from './types'
import AllocationDetailsDialog from './AllocationDetailsDialog'

interface Allocation {
  teaId: string
  quantity: number
  packages: number
}

interface SavingAllocation {
  id: number;
  quantity_packages: number;
  quantity_kgs: number;
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
  const [isAllocationDetailsOpen, setIsAllocationDetailsOpen] = useState(false);
  const [allocationDetailsId, setAllocationDetailsId] = useState<number>(0);

  const { getBlendById, updateAllocations } = useApiMethods();
  const { toast } = useToast()
  
  const allocationsTableRef = useRef(null)
  const blendsTableRef = useRef(null)
  const availableTeaTableRef = useRef(null)
  const tabulatorRef = useRef<Tabulator | null>(null)
  const updatedRows = useRef<number[]>([]);
  const originalAllocations = useRef<ManufacturingAllocationTableData[]>([]);
  const isInitialAllocations = useRef(true)

  useEffect(() => {
    if (allocationsTableRef.current) {
      tabulatorRef.current = new Tabulator(allocationsTableRef.current, {
        data: allocations,
        height: "500px",
        selectable: isDraftBlend,
        selectableRollingSelection: false,
        columns: [
          { title: "Select", formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 60 },
          { title: "#", formatter: "rownum", width: 60, hozAlign: "center" },
          {
            title: "View Details",
            field: "view",
            hozAlign: "center",
            formatter: (cell) => {
              const cellValue = cell.getValue();
              return `
                <span style="display: flex; alight-items: center; justify-content: center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-black hover:text-gray-700">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12c0 0 3-9 9-9s9 9 9 9-3 9-9 9-9-9-9-9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
                  </svg>
                </span>`;
            },
            cellClick: (e, cell) => {
              const rowData = cell.getRow().getData();
              handleViewDetails(rowData.lot_id);
            }
          },
          { title: "Box Number", field: "box_number", hozAlign: "center"},
          { title: "Quantity", field: "quantity_kgs", hozAlign: "center"},
          { title: "Allocated Quantity (kg)", field: "quantity_kgs", hozAlign: "center"},
          { title: "Package Weight (kg)", field: "net_weight", hozAlign: "center"},
          { title: "Allocated Packages", field: "quantity_packages", hozAlign: "center", editor: "number", editorParams: {
            min: 0,
            step: 1,
          }},
          { title: "Cost", field: "total_cost", hozAlign: "center"},
          { title: "Weight Difference (kg)", field: "weight_diff", hozAlign: "center"},
        ],
        rowFormatter: (row) => {
          const rowData = row.getData();
          if (rowData.weight_diff > 0) {
            row.getElement().style.backgroundColor = "#8aedb8";
          } else if (rowData.weight_diff < 0) {
            row.getElement().style.backgroundColor = "#eda18a";
          }
        }
      })

      tabulatorRef.current.on("rowSelectionChanged", function(data: any, rows: any){
        setSelectedRowCount(data.length)
      })

      tabulatorRef.current.on("cellEdited", function(cell: any){
        const row = cell.getRow()
        const data = row.getData()
        if (cell.getField() === "view") {
          const rowData = cell.getRow().getData();
          // handleQuantityChange(data.lot_name, cell.getValue(), 'kg')
        } else if (cell.getField() === "quantity_packages") {
          handleQuantityChange(data.box_number, cell.getValue(), 'packages', data.id)
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

  const handleViewDetails = (id: number) => {
    setAllocationDetailsId(id);
    setIsAllocationDetailsOpen(true);
  }

  const handleQuantityChange = (boxNumber: string, newValue: number, unit: 'kg' | 'packages', id: number) => {
    setAllocations(prev => prev.map((a, index) => {
      if (a.box_number === boxNumber) {
          if (unit === 'kg') {
            // return { ...a, quantity: Math.max(0, newValue), packages: Math.ceil(newValue / tea.packageWeight) }
          } else {
            const newQuantity = newValue*a.net_weight;
            if (newQuantity != a.quantity_kgs) {
              updatedRows.current.push(id);
            }
            
            return { 
              ...a, 
              package_diff: (newValue - originalAllocations.current[index].quantity_packages), 
              weight_diff: (newQuantity - originalAllocations.current[index].quantity_kgs), 
              total_cost: a.unit_cost*newQuantity, 
              quantity_kgs: newQuantity, 
              quantity_packages: Math.max(0, newValue) 
            }
          }
      }
      return a
    }))
  }
  
  const addSelectedTeasToBlend = (selectedTeas: TeaAllocation[]) => {
    if (selectedBlend) {
      fetchBlendData(selectedBlend.name)
    }
  }

  const updateTotalQuantity = () => {
    const total = allocations.reduce((sum, allocation) => sum + allocation.quantity_kgs, 0);
    const totalCost = allocations.reduce((sum, allocation) => sum + allocation.total_cost, 0);
    const avgPrice = total > 0 ? parseFloat((totalCost / total).toFixed(2)) : 0; // Convert to number
  
    setBlendInfo(prev => {
      return { ...prev, totalAllocated: total, averagePrice: avgPrice };
    });
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
    teaCost: 0,
    export_quantity: 0
  })

  const handleBlendInfoChange = useCallback((info: Partial<BlendInfo>) => {
    setBlendInfo(prev => ({ ...prev, ...info }))
  }, [])

  const handleGenerateBlendSheet = useCallback(async () => {
    // Create a BlendAllocation object from blendInfo and allocations
    const blendAllocation: any = {
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


  useEffect(() => {
    if (isInitialAllocations.current == true) {
      isInitialAllocations.current = false;
    } else {
      updateTotalQuantity();
    }
  }, [allocations])

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
        teaCost: teas.average_cost,
        export_quantity: teas.export_quantity
      }
      setBlendInfo(teablendInfo);
      const tableData = teas.manufacturing_allocations.map(item => {
        return {
         ...item,
         package_diff: 0,
         weight_diff: 0,
         total_cost: item.unit_cost*item.quantity_kgs
        }
      })
      setAllocations(tableData)
      originalAllocations.current = tableData;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }, [])


  const saveTableData = async () => {
    const updatingObjs = updatedRows.current.map(item => {
      const allocation : ManufacturingAllocationTableData | undefined = allocations.find(alloc => item === alloc.id);
      if (allocation) {
        return {
          id: allocation.id,
          quantity_packages: allocation.quantity_packages,
          quantity_kgs: allocation.quantity_kgs
        }
      }
    }).filter(item => item != undefined)
    
    if (updatingObjs.length > 0) {
      try {
        await updateAllocations(updatingObjs);
        toast({
          title: "Success",
          description: "Allocation data updated successfully",
          variant: "default",
        })
        if (selectedBlend) {
          fetchBlendData(selectedBlend.name)
        }
      } catch(err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
      }
    }
  }


  const addTeaBtnClick = () => {
    if (selectedBlend) {
      setIsDialogOpen(true);
    } else {
      toast({
        title: "Error",
        description: "Please select a Blend first",
        variant: "destructive",
      })
    }
  }

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
              {blendInfo.export_quantity != undefined && <FormField label="Export Quantity" value={blendInfo.export_quantity?.toString()} readOnly />}
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
              <Button className="bg-green-600 text-white" onClick={addTeaBtnClick} >Add Tea</Button>
            </div>
            )}
          </CardHeader>
          <CardContent className='w-[750px]'>
            <div ref={allocationsTableRef}></div>
          </CardContent>
        </Card>
        </div>
        <BlendInformationSection 
         blendInfo={blendInfo} 
         onBlendInfoChange={handleBlendInfoChange}
         onGenerateBlendSheet={() => setIsGenerateConfirmOpen(true)}
         onSaveTableData={() => saveTableData()}
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

      {selectedBlend && (
        <AvailableTeaDialog
          selectedIds={allocations.map(item => item.box_number)}
          blendId={selectedBlend.id}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onAddTeas={addSelectedTeasToBlend}
        />
      )}

      {isAllocationDetailsOpen && (
        <AllocationDetailsDialog
          isOpen={isAllocationDetailsOpen}
          onClose={() => setIsAllocationDetailsOpen(false)}
          lotId={allocationDetailsId} />
      )}
    </div>
  </>
  )
}
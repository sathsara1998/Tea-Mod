

import React, { useState, useEffect, useRef , useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger , DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Info, Search } from "lucide-react"
import { ScrollArea } from './ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import "tabulator-tables/dist/css/tabulator_semanticui.min.css"
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
import { useRouter, usePathname, useSearchParams  } from 'next/navigation';
import SplitTeaDialog from './AllocationViewComponents/SplitTeaDialog'

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
  const [blendDetails, setBlendDetails] = useState<StockLot>();
  const [isOpenPlit, setIsOpenPlit] = useState(false);

  const { 
    getBlendById, 
    updateAllocations, 
    getLotInfoById,
    deleteManufactureAllocs,
    editPackageAllocation
  } = useApiMethods();
  const { toast } = useToast()
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const allocationsTableRef = useRef(null)
  const blendsTableRef = useRef(null)
  const availableTeaTableRef = useRef(null)
  const tabulatorRef = useRef<Tabulator | null>(null)
  const updatedRows = useRef<number[]>([]);
  const originalAllocations = useRef<ManufacturingAllocationTableData[]>([]);
  const isInitialAllocations = useRef(true)
  const selectedIdsRef = useRef<number[]>([]);

  useEffect(() => {
    if (allocationsTableRef.current) {
      const adjustedAllocations : ManufacturingAllocationTableData[] = allocations.map((item) => {
        return {
          ...item,
          option: item.option ? item.option : "Packages"
        }
      })
      
      tabulatorRef.current = new Tabulator(allocationsTableRef.current, {
        data: adjustedAllocations,
        height: "500px",
        selectable: isDraftBlend,
        selectableRollingSelection: false,
        columns: [
          { title: "Select", formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 60 },
          { title: "#", formatter: "rownum", width: 60, hozAlign: "center" },
          { title: "Box Number", field: "box_number", hozAlign: "center"},
          { title: "Package Weight (kg)", field: "net_weight", hozAlign: "center"},
          // { title: "Quantity", field: "quantity_kgs", hozAlign: "center" ,  topCalc:"sum"},
          { title: "Allocated Quantity (kg)", field: "quantity_kgs", topCalc:"sum", hozAlign: "center", editor: "number", editorParams: {
            min: 0,
          }, formatter: (cell) => {
            const value = cell.getValue();
            const element = cell.getElement();
            element.style.backgroundColor = "#f2de79";
            return value;
          }},
          {
            title: "Option",
            field: "option",
            hozAlign: "center",
            formatter: (cell) => {
              const value = cell.getValue();
              return `<button style="background-color: #b0b5b1; border-radius: 10px; padding: 5px 10px">${value || "Kgs"}</button>`;
            },
            cellClick: (e, cell) => {
              const row = cell.getRow();
              const currentValue = cell.getValue();
  
              // Toggle between "Option A" and "Option B"
              const newValue = currentValue === "Kgs" ? "Packages" : "Kgs";
              row.update({ option: newValue });  // Update the row data
            }
          },
          { title: "Allocated Packages", field: "quantity_packages", topCalc:"sum" , hozAlign: "center", editor: "number", editorParams: {
            min: 0,
            step: 1,
          }, formatter: (cell) => {
            const value = cell.getValue();
            const element = cell.getElement();
            element.style.backgroundColor = "#f2de79";
            return value;
          }},
          { title: "Cost", field: "total_cost", hozAlign: "center"},
          { title: "Weight Difference (kg)", field: "weight_diff", hozAlign: "center"},
          {
            title: "Submit",
            formatter: () => "<button style='color: blue'>Submit</button>",
            width: 100,
            frozen:true,
            hozAlign: "center",
            cellClick: (e, cell) => {
              const rowData = cell.getRow().getData();
              handleSubmitRow(rowData);
            }
          }
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
        selectedIdsRef.current = [...selectedIdsRef.current, data.id]
        setSelectedRowCount(data.length)
      })

      tabulatorRef.current.on("cellEdited", function(cell: any){
        const row = cell.getRow()
        const data = row.getData()

        // Show the submit button if any cell in this row has been edited
        const submitCell = row.getCell("Submit");
        if (submitCell) {
          const submitButton = submitCell.getElement().querySelector(".submit-button");
          if (submitButton) {
            submitButton.style.display = "inline-block";  // Make the submit button visible
          }
        }

        if (cell.getField() === "quantity_kgs") {
          handleKgChange(data.id, cell, 'kg')
        } else if (cell.getField() === "quantity_packages") {
          handleQuantityChange(data.id, cell.getValue(), 'packages')
        }
      })

      tabulatorRef.current.on("rowClick", function(e, row){
        const rowData = row.getData();
        handleViewDetails(rowData.lot_id);
    });

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

      table.on("rowClick", function(e, row){
        //e - the click event object
        //row - row component

        console.log(e)
        console.log(row)

    });

      return () => {
        table.destroy()
      }
    }
  }, [availableTeas, searchTerm])

  const handleViewDetails = (id: number) => {
    fetchLotInfo(id)
  }

  const handleSubmitRow = async (rowData: any) => {
    if (updatedRows.current && updatedRows.current.includes(rowData.id)) {
      const id = selectedBlend?.id;
      const lotId = rowData.lot_id;
      const allocationType = rowData.option === "Kgs" ? "total_quantity" : "package_count";
      const value = rowData.option === "Kgs" ? rowData.quantity_kgs : rowData.quantity_packages;
      const perPackage = rowData.net_weight;

      try {
        const param = {
          blend_id: id,
          lot_id: lotId,
          allocation_type: allocationType,
          value: value,
          per_package_quantity: perPackage,
        }

        await editPackageAllocation(param);
        toast({
          title: "Success",
          description: "Selected allocations have been removed",
          variant: "default",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  }

  const handleKgChange = (id: number, cell: any, unit: string) => {
    const row = cell.getRow();
    const data: ManufacturingAllocationTableData = row.getData();

    const enteredVal = cell.getValue();
    const packageWeight = data.net_weight;

    const updatedQuantity = Math.ceil(enteredVal / packageWeight) * data.net_weight;

    setAllocations(prev => prev.map((a, index) => {
      if (a.id === id) {
        const newPackages = updatedQuantity / a.net_weight;
        console.log(newPackages);
        if (newPackages != a.quantity_packages) {
          updatedRows.current.push(id);
        }

        return {
          ...a,
          package_diff: (newPackages - originalAllocations.current[index].quantity_packages),
          weight_diff: (updatedQuantity - originalAllocations.current[index].quantity_kgs),
          total_cost: a.unit_cost * updatedQuantity,
          quantity_kgs: updatedQuantity,
          quantity_packages: newPackages
        }
      }
      return a
    }))
  }

  const handleQuantityChange = (id: number, newValue: number, unit: 'kg' | 'packages') => {
    setAllocations(prev => prev.map((a, index) => {
      if (a.id === id) {
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

  const openSplit = () => {
    if (tabulatorRef.current) {
      const selectedData = tabulatorRef.current.getSelectedData();
      setIsOpenPlit(true)
    }
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

  const confirmRemoveSelectedTeas = async () => {
    if (tabulatorRef.current) {
      const selectedData = tabulatorRef.current.getSelectedData()
      const params = selectedData.map(item => {
        return {
          blend_id: selectedBlend?.id,
          lot_id: item.lot_id,
          allocation_type: "package_count",
          value: 0,
          per_package_quantity: item.net_weight
        }
      })

   
      const data = {allocations:params}
      
      try {
        await deleteManufactureAllocs(data);
        toast({
          title: "Success",
          description: "Selected allocations have been removed",
          variant: "default",
        });
        if (selectedBlend) {
          setSelectedRowCount(0)
          fetchBlendData(selectedBlend.name)
        }
      } catch (err: any) {
        toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
        });
      } finally {
        setIsConfirmDialogOpen(false)
      }
    }
  }

  const fetchLotInfo = async (lotId: number) => {
      try {
          const data = await getLotInfoById(lotId);
          setBlendDetails(data);
      } catch (err: any) {
          toast({
              title: "Error",
              description: err.message,
              variant: "destructive",
          });
      }
  };

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
  const fetchBlendData = useCallback(async (id: string, isEdit: boolean = false) => {
    try {
      const data = await getBlendById(id)
      const teas: TeaBlend = data[0];

      if (isEdit) {
        setSelectedBlend(teas);
        return;
      }
      
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
        balanceToAllocate: teas.to_allocate_quantity,
        teaCost: teas.average_cost,
        export_quantity: teas.export_quantity
      }
      setBlendInfo(teablendInfo);
      const tableData = teas.manufacturing_allocations.map((item, index) => {
        return {
         ...item,
         id: index + 1,
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

  const customerChanged = (blend: TeaBlend) => {
    if (blend) {
      router.replace(`${pathname}?id=${blend.name}`);
      setSelectedBlend(blend)
    }
  }

  useEffect(() => {
    if (selectedBlend) {
      fetchBlendData(selectedBlend.name)
    }
  }, [selectedBlend])

  // Get the id if it exists
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      fetchBlendData(id, true);
    }
  }, [searchParams]);

  return (
  <>
    <div className="p-4 mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tea Blend Allocation</h1>
      <div className="grid grid-cols-6 gap-4">
        {/* Show the allocations */}
        <div className="col-span-1">
          {selectedBlend && <Card className="mb-5 max-h-[80vh]">
            <CardHeader className="top-0 z-10 flex flex-row">
              <CardTitle>Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[80vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBlend.allocations.map((allocation, index) => (
                      <TableRow key={index}>
                        <TableCell>{allocation.sale_order_name}</TableCell>
                        <TableCell>{allocation.product_name}</TableCell>
                        <TableCell>{allocation.quantity.toFixed(3)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>}
        </div>
        <div className="col-span-3">
        <Card className="mb-5">
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
                  onSelectBlend={customerChanged}
                />
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={blendsTableRef}></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between">
            <CardTitle>Tea Allocations</CardTitle>
            {isDraftBlend && (
              <div className="flex gap-2">
              <Button onClick={openSplit} className="bg-blue-600 text-white">
                Split
              </Button>
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
          <CardContent className='w-100'>
            <div ref={allocationsTableRef}></div>
          </CardContent>
        </Card>
        </div>
        <div className="col-span-2">
          <BlendInformationSection 
          blendInfo={blendInfo} 
          lotDetails={blendDetails}
          onBlendInfoChange={handleBlendInfoChange}
          onGenerateBlendSheet={() => setIsGenerateConfirmOpen(true)}
          onSaveTableData={() => saveTableData()}
          />
        </div>
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

      {isOpenPlit && selectedBlend && (
        <SplitTeaDialog
          blendId={selectedBlend.id}
          isOpen={isOpenPlit}
          onClose={() => setIsOpenPlit(false)}
        />
      )}

      {selectedBlend && (
        <AvailableTeaDialog
          selectedIds={allocations.map(item => { return { weight: item.net_weight, boxNo: item.box_number } })}
          blendId={selectedBlend.id}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onAddTeas={addSelectedTeasToBlend}
        />
      )}
    </div>
  </>
  )
}
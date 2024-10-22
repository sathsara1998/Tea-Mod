import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import "tabulator-tables/dist/css/tabulator.min.css"
import { generateTestData } from '@/lib/utils'
import { AddAllocationObject, TeaAllocation } from './types'
import { useApiMethods } from '@/hooks/useApiMethods'
import { useToast } from './ui/use-toast'

interface Tea {
  id: string
  name: string
  lotNumber: string
  freeQuantity: number
  packageWeight: number
  origin: string
  harvestDate: string
  grade: string
  type: string
}

interface AvailableTeaDialogProps {
  blendId: number
  isOpen: boolean
  onClose: () => void
  onAddTeas: (selectedTeas: TeaAllocation[]) => void,
  selectedIds: string[]
}

const AvailableTeaDialog: React.FC<AvailableTeaDialogProps> = ({ isOpen, blendId, onClose, onAddTeas, selectedIds }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedTeas, setSelectedTeas] = useState<TeaAllocation[]>([])
  const [availableTeas, setAvailableTeas] = useState<TeaAllocation[]>([])
  const availableTeaTableRef = useRef(null)
  const { getAllAuctionData, addAllocationtoBlend } = useApiMethods();
  const { toast } = useToast()

  const fetchAllocations = useCallback(async () => {
    try {
      const data = await getAllAuctionData()
      const teas: TeaAllocation[] = data;
      
      setAvailableTeas(teas);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }, [])

  const addAllocations = async () => {
    try {
      if (blendId) {
        console.log("in add", selectedTeas);
        
        const allocations : AddAllocationObject[] = selectedTeas.map(item => {
          return {
            blend_id: blendId,
            lot_id: Number(item.id),
            quantity_packages: 1,
            quantity_kgs: item.net_weight
          }
        })
        console.log("alloc", allocations);
        
        await addAllocationtoBlend(allocations)
        
        // close on success
        onAddTeas(selectedTeas)
        onClose()
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAllocations()
    }
  }, [isOpen])

  const teaTypes = useMemo(() => ['All', ...Array.from(new Set(availableTeas.map(tea => tea.blend_line_type)))], [availableTeas]);

  const filteredTeas = useMemo(() => 
    availableTeas.filter(tea => 
      (tea.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
       tea.box_number.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedType === 'All' || tea.blend_line_type === selectedType)
    ), [availableTeas, searchTerm, selectedType]
  )

  useEffect(() => {
    if (availableTeaTableRef.current) {
      const table = new Tabulator(availableTeaTableRef.current, {
        data: filteredTeas,
        placeholder:"Loading ...",
        columns: [
          { title: "Select", formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 60 },
          { title: "Tea Standard", field: "standard", hozAlign: "left" , headerFilter:true, headerFilterPlaceholder:"Find a STD..."},
          { title: "Box Number", field: "box_number", hozAlign: "left" , headerFilter:true, headerFilterPlaceholder:"Find a BOX Number..."},
          { title: "Garden Mark", field: "garden_mark", hozAlign: "left"},
          { title: "Invoice No", field: "invoice_no", hozAlign: "left"},
          { title: "Package Weight (kg)", field: "net_weight", hozAlign: "left"},
          { title: "Available Qty", field: "free_quantity", hozAlign: "left"},
          { title: "Available Packages", field: "free_packages", hozAlign: "left"},
          { title: "Purchased Price", field: "purchased_price", hozAlign: "left"},
        ],
        height: "400px",
        selectable: true,
        selectableRollingSelection: false,
      
      })
      

      table.on("rowSelectionChanged", function (selectedData, rows) {
        // Filter out the rows with disabled IDs
        rows.forEach((row) => {
          const rowData = row.getData();
          if (selectedIds.includes(rowData.box_number)) {
            row.deselect(); // Automatically deselect rows with disabled ids
            row.getElement().style.backgroundColor = "#f5f5f5";
            row.getElement().style.color = "#999";
          }
        });
  
        // Set the selected teas excluding the disabled ones
        const validSelections = selectedData.filter(item => !selectedIds.includes(item.box_number));
        setSelectedTeas(validSelections);
      });

      return () => {
        table.destroy()
      }
    }
  }, [filteredTeas])

  const handleAddSelectedTeas = () => {
    if (selectedTeas.length) {
      addAllocations()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-4 rounded shadow-lg max-w-6xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Available Teas</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search teas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300"
          />
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {teaTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[650]">
          <div ref={availableTeaTableRef} className="flex-grow"></div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleAddSelectedTeas} className="bg-green-600 text-white">
            Add Selected Teas ({selectedTeas.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AvailableTeaDialog
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import "tabulator-tables/dist/css/tabulator.min.css"
import { generateTestData } from '@/lib/utils'
import { TeaAllocation } from './types'
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
  isOpen: boolean
  onClose: () => void
  onAddTeas: (selectedTeas: TeaAllocation[]) => void
}

const AvailableTeaDialog: React.FC<AvailableTeaDialogProps> = ({ isOpen, onClose, onAddTeas }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedTeas, setSelectedTeas] = useState<TeaAllocation[]>([])
  const [availableTeas, setAvailableTeas] = useState<TeaAllocation[]>([])
  const availableTeaTableRef = useRef(null)
  const { getAllAuctionData } = useApiMethods();
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

  useEffect(() => {
    if (isOpen) {
      fetchAllocations()
    }
  }, [isOpen])

  const teaTypes = useMemo(() => ['All', ...Array.from(new Set(availableTeas.map(tea => tea.blend_line_type)))], [availableTeas]);

  const filteredTeas = useMemo(() => 
    availableTeas.filter(tea => 
      (tea.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
       tea.lot_no.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedType === 'All' || tea.blend_line_type === selectedType)
    ), [availableTeas, searchTerm, selectedType]
  )

  useEffect(() => {
    if (availableTeaTableRef.current) {
      const table = new Tabulator(availableTeaTableRef.current, {
        data: filteredTeas,
        columns: [
          { title: "Select", formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 60 },
          { title: "Tea", field: "box_number", hozAlign: "center"},
          { title: "Lot Number", field: "lot_no", hozAlign: "center"},
          { title: "Garden Mark", field: "garden_mark", hozAlign: "center"},
          { title: "Grade", field: "grade", hozAlign: "center"},
          { title: "Package Weight (kg)", field: "net_weight", hozAlign: "center"},
          { title: "Bags", field: "bags", hozAlign: "center"},
          { title: "Allocated Quantity", field: "allocated_qty", hozAlign: "center"},
          { title: "Free Qty", field: "free_qty", hozAlign: "center"},
          { title: "Allocated Packages", field: "allocated_packages", hozAlign: "center"},
          { title: "Free Packages", field: "free_packages", hozAlign: "center"},
          { title: "Standard", field: "standard", hozAlign: "center"},
          { title: "Sample Allowance", field: "sample_allowance", hozAlign: "center"},
          { title: "Purchased Price", field: "purchased_price", hozAlign: "center"},
          { title: "Break", field: "break", hozAlign: "center"},
          { title: "Invoice No", field: "invoice_no", hozAlign: "center"},
          { title: "Type", field: "blend_line_type", hozAlign: "center" },
        ],
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
  }, [filteredTeas])

  const handleAddSelectedTeas = () => {
    onAddTeas(selectedTeas)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-4 rounded shadow-lg max-w-4xl max-h-[80vh] flex flex-col">
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
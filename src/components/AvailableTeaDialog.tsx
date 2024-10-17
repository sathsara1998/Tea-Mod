import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import "tabulator-tables/dist/css/tabulator.min.css"
import { generateTestData } from '@/lib/utils'

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
  onAddTeas: (selectedTeas: Tea[]) => void
}

const AvailableTeaDialog: React.FC<AvailableTeaDialogProps> = ({ isOpen, onClose, onAddTeas }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedTeas, setSelectedTeas] = useState<Tea[]>([])
  const [availableTeas, setAvailableTeas] = useState<Tea[]>([])
  const availableTeaTableRef = useRef(null)

  useEffect(() => {
    setAvailableTeas(generateTestData())
  }, [])

  const teaTypes = useMemo(() => ['All', ...new Set(availableTeas.map(tea => tea.type))], [availableTeas])

  const filteredTeas = useMemo(() => 
    availableTeas.filter(tea => 
      (tea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       tea.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedType === 'All' || tea.type === selectedType)
    ), [availableTeas, searchTerm, selectedType]
  )

  useEffect(() => {
    if (availableTeaTableRef.current) {
      const table = new Tabulator(availableTeaTableRef.current, {
        data: filteredTeas,
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
        <div ref={availableTeaTableRef} className="flex-grow"></div>
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
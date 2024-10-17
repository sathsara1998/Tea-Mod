import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import "tabulator-tables/dist/css/tabulator.min.css"
import { generateTestData } from '@/lib/utils'
import { Blend } from "./BlendHeaderCreationView"
import { useApiMethods } from '@/hooks/useApiMethods'
import { useToast } from './ui/use-toast'

interface AvailableTeaDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectBlend: (selectedBlend: Blend) => void
}

const SelectBlendsDialog: React.FC<AvailableTeaDialogProps> = ({ isOpen, onClose, onSelectBlend }) => {
  const [searchBlendName, setSearchBlendName] = useState('')
  const [searchQuantity, setSearchQuantity] = useState('')
  const [searchStatus, setSearchStatus] = useState<string>('All')
  const [selectedBlend, setSelectedBlend] = useState<Blend>();
  const [availableBlends, setAvailableBlends] = useState<Blend[]>([])
  const { getBlends } = useApiMethods();
  const { toast } = useToast()

  const availableBlendTableRef = useRef(null)

  const fetchBlends = useCallback(async () => {
    try {
      const data = await getBlends()
      // Transform the data to match our Blend type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedBlends: Blend[] = Object.values(data).map((blend: any) => ({
        id: blend.id,
        name: blend.name,
        blendName: blend.blendName,
        quantity: blend.quantity,
        status: blend.status,
        allocations: blend.allocations
      }));
      console.log(transformedBlends);
      
      setAvailableBlends(transformedBlends)
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
    fetchBlends()
  }, [fetchBlends])

  const statusTypes = useMemo(() => ['All', ...new Set(availableBlends.map(blend => blend.status))], [availableBlends])

  const filteredBlends = useMemo(() => 
    availableBlends.filter(blend => 
      (blend.blendName.toLowerCase().includes(searchBlendName.toLowerCase()) &&
       blend.quantity.toString().includes(searchQuantity)) && (searchStatus === 'All' || blend.status == searchStatus)
    ), [searchBlendName, searchQuantity, searchStatus]
  )

  useEffect(() => {
    if (availableBlendTableRef.current) {
      const table = new Tabulator(availableBlendTableRef.current, {
        data: filteredBlends,
        selectableRows:1,
        columns: [
          { title: "Select", formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 60 },
          { title: "ID", field: "id" },
          { title: "Name", field: "name" },
          { title: "Blend Name", field: "blendName" },
          { title: "Quantity (kg)", field: "quantity" },
          { title: "Status", field: "status" },
        ],
        layout: "fitColumns",
        height: "400px",
        selectable: true,
        selectableRollingSelection: false,
      })

      table.on("rowSelectionChanged", function(data: Blend[]){
        if (data.length) {
          setSelectedBlend(data[0])
        }
      })

      return () => {
        table.destroy()
      }
    }
  }, [filteredBlends])

  const handleAddSelectedTeas = () => {
    if (selectedBlend) {
      console.log("selected", selectedBlend);
      
      onSelectBlend(selectedBlend);
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-4 rounded shadow-lg max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Available Blends</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search name"
            value={searchBlendName}
            onChange={(e) => setSearchBlendName(e.target.value)}
            className="border border-gray-300"
          />
          <Input
            placeholder="Search quantity"
            value={searchQuantity}
            type='number'
            onChange={(e) => setSearchQuantity(e.target.value)}
            className="border border-gray-300"
          />
          <Select value={searchStatus} onValueChange={setSearchStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {statusTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div ref={availableBlendTableRef} className="flex-grow"></div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleAddSelectedTeas} className="bg-green-600 text-white">
            Select Blend
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SelectBlendsDialog;
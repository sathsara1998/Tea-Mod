import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import "tabulator-tables/dist/css/tabulator_semanticui.min.css"
import { generateTestData } from '@/lib/utils'
import { AddAllocationObject, TeaAllocation } from '../types'
import { useApiMethods } from '@/hooks/useApiMethods'
import { useToast } from '../ui/use-toast'
import { SelectedObj } from '../AvailableTeaDialog'

interface SplitObj {
  id: string;
  box_number: string;
  lot_no: string;
  garden_mark: string;
  grade: string;  
  net_weight: number;
  bags: number;
  allocated_qty: number;
  free_qty: number;
  allocated_packages: number;
  free_packages: number;
  standard: string;
  sample_allowance: string;
  purchased_price: number;
  break: string;
  invoice_no: string;
  blend_line_type: string;
  dest_weight: number;
  source_count: number;
  dest_count: number;
}

interface AvailableTeaDialogProps {
    blendId: number;
    isOpen: boolean;
    onClose: () => void
  }

const SplitTeaDialog: React.FC<AvailableTeaDialogProps> = ({ blendId, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [updatingRow, setUpdatingRow] = useState<SelectedObj>()
  const [availableTeas, setAvailableTeas] = useState<TeaAllocation[]>([])
  const [filteredTeas, setFilteredTeas] = useState<SplitObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const availableTeaTableRef = useRef(null)
  const { getAllAuctionData, splitPackage } = useApiMethods();
  const { toast } = useToast()

  const fetchAllocations = useCallback(async () => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchAllocations()
    }
  }, [isOpen])

  const teaTypes = useMemo(() => ['All', ...Array.from(new Set(availableTeas.map(tea => tea.blend_line_type)))], [availableTeas]);

  useEffect(() => {
    const filtered = availableTeas.filter(tea => 
      (tea.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
       tea.box_number.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedType === 'All' || tea.blend_line_type === selectedType)
    )
    const tableData : SplitObj[] = filtered.map(tea => {
      return { ...tea, source_count: 0, dest_count: 0, dest_weight: 0 }
    })
    setFilteredTeas(tableData);
  }, [availableTeas, searchTerm, selectedType])

  useEffect(() => {
    if (availableTeaTableRef.current) {
      const table = new Tabulator(availableTeaTableRef.current, {
        data: filteredTeas,
        placeholder:"Loading ...",
        groupBy:"box_number",
        columns: [
          { title: "Tea Standard", field: "standard", hozAlign: "left" , headerFilter:true, headerFilterPlaceholder:"Find a STD..."},
          { title: "Invoice No", field: "invoice_no", hozAlign: "left"},
          { title: "Available Packages", field: "free_packages", hozAlign: "left"},
          { title: "Available Qty", field: "free_quantity", hozAlign: "left"},
          { title: "Package Weight (kg)", field: "net_weight", hozAlign: "left"},
          { title: "Destination Weight", field: "dest_weight", topCalc:"sum", hozAlign: "center", editor: "number", frozen:true, editorParams: {
            min: 0,
          }, formatter: (cell) => {
            const value = cell.getValue();
            const element = cell.getElement();
            element.style.backgroundColor = "#f2de79";
            return value;
          }},
          { title: "Source count", field: "source_count", topCalc:"sum", hozAlign: "center", editor: "number", frozen:true, editorParams: {
            min: 0,
          }, formatter: (cell) => {
            const value = cell.getValue();
            const element = cell.getElement();
            element.style.backgroundColor = "#f2de79";
            return value;
          }},
          { title: "Destination count", field: "dest_count", topCalc:"sum", hozAlign: "center", editor: "number", frozen:true, editorParams: {
            min: 0,
          }, formatter: (cell) => {
            const value = cell.getValue();
            const element = cell.getElement();
            element.style.backgroundColor = "#f2de79";
            return value;
          }},
          {
            title: "Submit",
            formatter: () => "<button style='color: blue'>Submit</button>",
            width: 100,
            frozen:true,
            hozAlign: "center",
            cellClick: (e, cell) => {
              const rowData = cell.getRow().getData();
              confirmSplit()
            }
          }
        ],
        height: "400px",
        selectable: true,
        selectableRollingSelection: false,
      
      })
      
      table.on("cellEdited", function(cell: any){
        const row = cell.getRow()
        const data = row.getData()

        if (cell.getField() === "dest_weight") {
          handleDestWeightChange(data.id, cell)
        } else if (cell.getField() === "source_count") {
          handleSourcecountChange(data.id, cell)
        } else if (cell.getField() === "dest_count") {
          handleDestCountChange(data.id, cell)
        }
      })

      table.on("cellEditing", function(cell) {
        const rowData = cell.getRow().getData();
        const field = cell.getField();
        
        if (updatingRow && !isEqualPAckage(rowData.box_number, rowData.net_weight)) {
          toast({
            title: "Error",
            description: "Please save the previous split",
            variant: "destructive",
          })
          cell.cancelEdit();
        }
      });

      return () => {
        table.destroy()
      }
    }
  }, [filteredTeas])

  const handleDestWeightChange = (id: string, cell: any) => {
    const data = cell.getRow().getData();
    const enteredVal = cell.getValue();

    if (!updatingRow) {
      setUpdatingRow({
        weight: data.net_weight,
        boxNo: data.box_number,
      });
    } else if (!isEqualPAckage(data.box_number, data.net_weight)) {
      toast({
        title: "Error",
        description: "Please save the previous split",
        variant: "destructive",
      })
      return;
    }

    if (data.source_count) {
      const destCount = (data.net_weight * data.source_count) / enteredVal;
      
      setFilteredTeas(prev => prev.map(tea => {
        if (isEqualPAckage(tea.box_number, tea.net_weight)) {
          return {...tea, dest_count: destCount, dest_weight: enteredVal }
        }
        return tea
      }))
    } else if (data.dest_count) {
      const sourceCount = (enteredVal * data.dest_count) / data.net_weight;
      setFilteredTeas(prev => prev.map(tea => {
        if (isEqualPAckage(tea.box_number, tea.net_weight)) {
          return {...tea, source_count: sourceCount, dest_weight: enteredVal }
        }
        return tea
      }))
    } else {
      setFilteredTeas(prev => prev.map(tea => {
        if (isEqualPAckage(tea.box_number, tea.net_weight)) {
          return {...tea, dest_weight: enteredVal }
        }
        return tea
      }))
    }
  }

  const handleSourcecountChange = (id: string, cell: any) => {
    const data = cell.getRow().getData();
    const enteredVal = cell.getValue();

    if (!updatingRow) {
      setUpdatingRow({
        weight: data.net_weight,
        boxNo: data.box_number,
      });
    } else if (!isEqualPAckage(data.box_number, data.net_weight)) {
      toast({
        title: "Error",
        description: "Please save the previous split",
        variant: "destructive",
      })
      return;
    }

    if (data.dest_weight) {
      const destCount = (data.net_weight * enteredVal) / data.dest_weight;
      setFilteredTeas(prev => prev.map(tea => {
        if (isEqualPAckage(tea.box_number, tea.net_weight)) {
          return {...tea, dest_count: destCount, source_count: enteredVal }
        }
        return tea
      }))
    } else if (data.dest_count) {
      const destWeight = (enteredVal * data.net_weight) / data.dest_count;
      setFilteredTeas(prev => prev.map(tea => {
        if (isEqualPAckage(tea.box_number, tea.net_weight)) {
          return {...tea, dest_weight: destWeight, source_count: enteredVal }
        }
        return tea
      }))
    } else {
      setFilteredTeas(prev => prev.map(tea => {
        if (isEqualPAckage(tea.box_number, tea.net_weight)) {
          return {...tea, source_count: enteredVal }
        }
        return tea
      }))
    }
  }

  const handleDestCountChange = (id: string, cell: any) => {
    const data = cell.getRow().getData();
    const enteredVal = cell.getValue();

    if (!updatingRow) {
      setUpdatingRow({
        weight: data.net_weight,
        boxNo: data.box_number,
      });
    } else if (!isEqualPAckage(data.box_number, data.net_weight)) {
      toast({
        title: "Error",
        description: "Please save the previous split",
        variant: "destructive",
      })
      return;
    }

    if (data.dest_weight) {
      const sourceCount = (data.dest_weight * enteredVal) / data.net_weight;
      setFilteredTeas(prev => prev.map(tea => {
        if (isEqualPAckage(tea.box_number, tea.net_weight)) {
          return {...tea, source_count: sourceCount, dest_count: enteredVal }
        }
        return tea
      }))
    } else if (data.source_count) {
      const destWeight = (data.source_count * data.net_weight) / enteredVal;
      setFilteredTeas(prev => prev.map(tea => {
        if (isEqualPAckage(tea.box_number, tea.net_weight)) {
          return {...tea, dest_weight: destWeight, dest_count: enteredVal }
        }
        return tea
      }))
    } else {
      setFilteredTeas(prev => prev.map(tea => {
        if (isEqualPAckage(tea.box_number, tea.net_weight)) {
          return {...tea, dest_count: enteredVal }
        }
        return tea
      }))
    }
  }

  const isEqualPAckage = (id: string, weight: number) => {
    return updatingRow?.boxNo == id && updatingRow?.weight === weight;
  }

  const confirmSplit = async () => {
    if (updatingRow) {
      const selected = filteredTeas.find(item => isEqualPAckage(item.box_number, item.net_weight));
      if (!selected?.source_count || !selected?.dest_count || !selected?.dest_weight) {
        toast({
          title: "Error",
          description: "Please fill all fields",
          variant: "destructive",
        })
        return;
      }

      if (selected) {
        try {
          const params = {
            source: {
              lot_id: selected.id,
              package_unit_quantity: selected.net_weight,
              count: selected.source_count
            },
            destination: {
              package_unit_quantity: selected.dest_weight,
              count: selected.dest_count
            }
          }

          await splitPackage(params);
          toast({
            title: "Success",
            description: "Split successful",
            variant: "default",
          })
          setUpdatingRow(undefined);
          fetchAllocations()
        } catch (err: any) {
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          })
        }
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-4 rounded shadow-lg max-w-6xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Split teas</DialogTitle>
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
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : <div ref={availableTeaTableRef} className="flex-grow"></div>}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose} className="bg-green-600 text-white">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SplitTeaDialog;
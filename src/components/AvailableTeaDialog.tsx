import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search } from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import 'tabulator-tables/dist/css/tabulator_semanticui.min.css'
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

export interface SelectedObj {
  weight: number
  boxNo: string
}

interface AvailableTeaDialogProps {
  blendId: number
  isOpen: boolean
  onClose: () => void
  onAddTeas: (selectedTeas: TeaAllocation[]) => void
  selectedIds: SelectedObj[]
}

const AvailableTeaDialog: React.FC<AvailableTeaDialogProps> = ({
  isOpen,
  blendId,
  onClose,
  onAddTeas,
  selectedIds,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedTeas, setSelectedTeas] = useState<TeaAllocation[]>([])
  const [availableTeas, setAvailableTeas] = useState<TeaAllocation[]>([])
  const [filteredTeas, setFilteredTeas] = useState<TeaAllocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const availableTeaTableRef = useRef(null)
  const { getAllAuctionData, addAllocationtoBlend, editPackageAllocation } =
    useApiMethods()
  const { toast } = useToast()

  const fetchAllocations = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAllAuctionData()
      const teas: TeaAllocation[] = data

      setAvailableTeas(teas)
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  /*
  !Updated By Kavishka[Intern SE] 19/11/2024
    1.Removed the API call addAllocationtoBlend from AvailableTeaDialog
*/
  // const addAllocations = async () => {
  //   try {
  //     if (blendId) {
  //       const allocations: any = selectedTeas.map((item) => {
  //         return {
  //           blend_id: blendId,
  //           lot_id: Number(item.id),
  //           allocation_type: item.allocation_type,
  //           value: 1,
  //           per_package_quantity: item.net_weight,
  //         }
  //       })

  //       const data = { allocations: allocations }
  //       await addAllocationtoBlend(data)

  //       // close on success
  //       onAddTeas(selectedTeas)
  //       onClose()
  //     }
  //   } catch (err: any) {
  //     toast({
  //       title: 'Error',
  //       description: err.message,
  //       variant: 'destructive',
  //     })
  //   }
  // }

  useEffect(() => {
    if (isOpen) {
      fetchAllocations()
    }
  }, [isOpen])

  const teaTypes = useMemo(
    () => [
      'All',
      ...Array.from(new Set(availableTeas.map((tea) => tea.blend_line_type))),
    ],
    [availableTeas],
  )

  useEffect(() => {
    const filtered = availableTeas.filter(
      (tea) =>
        (tea.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tea.box_number.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedType === 'All' || tea.blend_line_type === selectedType),
    )
    setFilteredTeas(filtered)
  }, [availableTeas, searchTerm, selectedType])

  /*
  !Updated By Kavishka[Intern SE] 20/11/2024
  1.Filtered Invalid Teas from the available teas and then pass the filtered data to the table
  TODO: When Adding selected teas need to add "0" Value

*/

  useEffect(() => {
    if (availableTeaTableRef.current) {
      // Filter out invalid teas before passing to the table
      const validTeas = filteredTeas.filter((tea) => {
        return !selectedIds.some(
          (id) => id.weight === tea.net_weight && id.boxNo === tea.box_number,
        )
      })

      const table = new Tabulator(availableTeaTableRef.current, {
        data: validTeas, // Use filtered data
        placeholder: 'Loading ...',
        groupBy: 'standard',
        columns: [
          {
            title: 'Select',
            formatter: 'rowSelection',
            titleFormatter: 'rowSelection',
            hozAlign: 'center',
            headerSort: false,
            width: 60,
          },
          {
            title: 'Tea Standard',
            field: 'standard',
            hozAlign: 'left',
            headerFilter: true,
            headerFilterPlaceholder: 'Find a STD...',
          },
          {
            title: 'Box Number',
            field: 'box_number',
            hozAlign: 'left',
            headerFilter: true,
            headerFilterPlaceholder: 'Find a BOX Number...',
          },
          { title: 'Garden Mark', field: 'garden_mark', hozAlign: 'left' },
          { title: 'Invoice No', field: 'invoice_no', hozAlign: 'left' },
          {
            title: 'Package Weight (kg)',
            field: 'net_weight',
            hozAlign: 'left',
          },
          { title: 'Available Qty', field: 'free_quantity', hozAlign: 'left' },
          {
            title: 'Available Packages',
            field: 'free_packages',
            hozAlign: 'left',
          },
          {
            title: 'Purchased Price',
            field: 'purchased_price',
            hozAlign: 'left',
          },
        ],
        height: '400px',
        selectable: true,
        selectableRollingSelection: false,
      })

      table.on('rowSelectionChanged', function (selectedData, rows) {
        // Deselect invalid rows
        rows.forEach((row) => {
          const rowData = row.getData()
          if (
            selectedIds.some(
              (id) =>
                id.weight === rowData.net_weight &&
                id.boxNo === rowData.box_number,
            )
          ) {
            row.deselect()
            row.getElement().style.backgroundColor = '#f5f5f5'
            row.getElement().style.color = '#999'
          }
        })

        // Filter out invalid selections
        const validSelections = selectedData.filter((item) => {
          const isInvalid = selectedIds.some(
            (id) =>
              id.weight === item.net_weight && id.boxNo === item.box_number,
          )
          if (isInvalid) {
            const row = table.getRow(item.id)
            if (row) {
              row.deselect()
              row.getElement().style.backgroundColor = '#f5f5f5'
              row.getElement().style.color = '#999'
            }
          }
          return !isInvalid
        })
        setSelectedTeas(validSelections)
      })

      return () => {
        table.destroy()
      }
    }
  }, [filteredTeas, selectedIds])

  const handleAddSelectedTeas = () => {
    if (selectedTeas.length) {
      // Pass selected teas to parent component

      // const teasToAdd = selectedTeas.map((tea) => {
      //   return {
      //     ...tea,
      //     length: 0, // Set packages to 0 before adding
      //     purchased_price: 10,
      //   }
      // })
      // console.log(selectedTeas)
      onAddTeas(selectedTeas)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] max-w-6xl flex-col rounded bg-white p-4 shadow-lg">
        <DialogHeader>
          <DialogTitle>Available Teas</DialogTitle>
        </DialogHeader>
        <div className="mb-4 flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
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
            <div className="flex h-[200px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div ref={availableTeaTableRef} className="flex-grow"></div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleAddSelectedTeas}
            className="bg-green-600 text-white"
          >
            Add Selected Teas ({selectedTeas.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AvailableTeaDialog

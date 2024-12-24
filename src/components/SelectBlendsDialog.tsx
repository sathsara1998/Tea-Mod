import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
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
import 'tabulator-tables/dist/css/tabulator_semanticui.min.css'
import { generateTestData } from '@/lib/utils'
import { useApiMethods } from '@/hooks/useApiMethods'
import { useToast } from './ui/use-toast'
import { TeaBlend } from './types'
import { createRoot } from 'react-dom/client'

interface StatusType {
  status:
    | 'draft'
    | 'in_progress'
    | 'confirmed'
    | 'done'
    | string
    | null
    | undefined
}

const StatusBadge = ({ status }: { status: StatusType['status'] }) => {
  const getStatusStyles = (status: StatusType['status']): string => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-gray-200 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'done':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: StatusType['status']): string => {
    if (!status) return ''

    if (status.toLowerCase() === 'in_progress') {
      return 'In Progress'
    }

    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyles(
        status,
      )}`}
    >
      {formatStatus(status)}
    </span>
  )
}

interface AvailableTeaDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectBlend: (selectedBlend: TeaBlend) => void
}

const SelectBlendsDialog: React.FC<AvailableTeaDialogProps> = ({
  isOpen,
  onClose,
  onSelectBlend,
}) => {
  const [searchBlendName, setSearchBlendName] = useState('')
  const [searchQuantity, setSearchQuantity] = useState('')
  const [searchStatus, setSearchStatus] = useState<string>('All')
  const [selectedBlend, setSelectedBlend] = useState<TeaBlend>()
  const [availableBlends, setAvailableBlends] = useState<TeaBlend[]>([])
  const [filteredBlends, setFilteredBlends] = useState<TeaBlend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getBlends } = useApiMethods()
  const { toast } = useToast()

  const availableBlendTableRef = useRef(null)

  const fetchBlends = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getBlends()
      setAvailableBlends(data)
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

  useEffect(() => {
    if (isOpen) {
      fetchBlends()
    }
  }, [isOpen])

  const statusTypes = useMemo(
    () => [
      'All',
      ...Array.from(new Set(availableBlends.map((blend) => blend.status))),
    ],
    [availableBlends],
  )

  useEffect(() => {
    const filtered = availableBlends.filter((blend) => {
      const nameMatch =
        typeof blend.customer_name === 'string'
          ? blend.customer_name
              .toLowerCase()
              .includes(searchBlendName.toLowerCase())
          : false
      const blendNameMatch = blend.name
        .toLowerCase()
        .includes(searchBlendName.toLowerCase())
      const quantityMatch = blend.quantity
        .toString()
        .includes(searchBlendName.toLowerCase())

      return (
        (nameMatch || blendNameMatch || quantityMatch) &&
        (searchStatus === 'All' || blend.status === searchStatus)
      )
    })
    setFilteredBlends(filtered)
  }, [availableBlends, searchBlendName, searchStatus])

  useEffect(() => {
    if (availableBlendTableRef.current) {
      const table = new Tabulator(availableBlendTableRef.current, {
        data: filteredBlends,
        selectableRows: 1,
        groupBy: 'product_name',
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
            title: 'Customer',
            field: 'customer_name',
            hozAlign: 'left',
            headerFilter: true,
            headerFilterPlaceholder: 'Find a Customer...',
          },
          {
            title: 'Blend No',
            field: 'name',
            headerFilter: true,
            headerFilterPlaceholder: 'Find a Blend Number...',
          },
          {
            title: 'Export Quantity (kg)',
            field: 'export_quantity',
            hozAlign: 'right',
          },
          {
            title: 'Allocated Quantity (kg)',
            field: 'quantity',
            hozAlign: 'right',
          },
          {
            title: 'Status',
            field: 'status',
            formatter: (cell) => {
              const container = document.createElement('div')
              const root = createRoot(container)
              root.render(<StatusBadge status={cell.getValue()} />)
              return container
            },
          },
        ],
        layout: 'fitColumns',
        height: '400px',
        selectable: true,
        selectableRollingSelection: false,
      })

      table.on('rowSelectionChanged', function (data: TeaBlend[]) {
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
      console.log('selected', selectedBlend)
      onSelectBlend(selectedBlend)
      onClose()
    }
  }

  const resetFields = () => {
    setSearchBlendName('')
    setSearchQuantity('')
    setSearchStatus('All')
  }

  const closeDialog = () => {
    resetFields()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col rounded bg-white p-4 shadow-lg">
        <DialogHeader>
          <DialogTitle>Available Blends</DialogTitle>
        </DialogHeader>
        <div className="mb-4 flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search ..."
            value={searchBlendName}
            onChange={(e) => setSearchBlendName(e.target.value)}
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
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="h-[400px]">
            <div ref={availableBlendTableRef} className="flex-grow"></div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleAddSelectedTeas}
            className="bg-green-600 text-white"
          >
            Select Blend
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SelectBlendsDialog

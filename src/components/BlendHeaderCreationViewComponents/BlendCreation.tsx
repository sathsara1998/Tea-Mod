import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, ArrowRight } from 'lucide-react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { useApiMethods } from '@/hooks/useApiMethods'
import { useToast } from '../ui/use-toast'
import {
  SelectedBlend,
  ConfirmedSaleOrder,
  CustomerOrdersTableData,
} from '@/components/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import NewBlendDialog, { CustomerFullBlends } from './NewBlendDialog'
import BlendDialog from './BlendDialog'

interface AllocationsData {
  contract_number: string
  contract_line_no: string
  product_internal_ref: string
  product_uom_qty: number
  product_uom: string
  product_name: string
  product_blend_internal_ref: string
  blend_details: string
  tea_weight: number
  allocated_blend_quantity: number
  release_number: number
  blending_qty: number
  standard: string
}

type BlendCreationProps = {
  blendItems: CustomerOrdersTableData[]
  selectedBlends: SelectedBlend[]
  isConfirming: boolean
  handleConfirm: (data: {
    partner_id: number
    quantities: number[]
    demand_line_ids: any[]
  }) => void
  isEdit: boolean
  deleted: (arr: number[]) => void
  customerId: number
  blendId: number
  allocationsChanged: (orders: CustomerOrdersTableData[]) => void
  editiingInfo: BlendShowType
}

export interface BlendShowType {
  name: string
  customerName: string
  quantity: number
  productName: string
}

const BlendCreation: React.FC<BlendCreationProps> = ({
  blendItems,
  selectedBlends,
  isConfirming,
  handleConfirm,
  isEdit,
  deleted,
  customerId,
  blendId,
  allocationsChanged,
  editiingInfo,
}) => {
  const [allocationItems, setAllocationItems] = useState<AllocationsData[]>([])
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedRowCount, setSelectedRowCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isAddDialog, setIsAddDialog] = useState(false)
  const [tableItems, setTableItems] = useState<CustomerOrdersTableData[]>([])
  const { deleteSalesAllocs, createNewBlend } = useApiMethods()
  const { toast } = useToast()

  const allocationDataRef = useRef<HTMLDivElement>(null)
  const tabulatorRef = useRef<Tabulator | null>(null)

  const getQuantityColor = (allocated: number, total: number) => {
    if (allocated === total) return 'bg-green-200'
    if (allocated < total) return 'bg-yellow-200'
    return 'bg-blue-200'
  }

  useEffect(() => {
    if (allocationDataRef.current) {
      tabulatorRef.current = new Tabulator(allocationDataRef.current, {
        data: blendItems,
        columns: [
          {
            title: 'Select',
            formatter: 'rowSelection',
            titleFormatter: 'rowSelection',
            hozAlign: 'center',
            headerSort: false,
            width: 60,
          },
          { title: '#', formatter: 'rownum', width: 60, hozAlign: 'center' },
          { title: 'Contract', field: 'contract_number', hozAlign: 'left' },
          { title: 'Line', field: 'contract_line_no', hozAlign: 'left' },
          { title: 'Item', field: 'product_internal_ref', hozAlign: 'left' },
          { title: 'Qty Orderd', field: 'product_uom_qty', hozAlign: 'left' },
          { title: 'UOM', field: 'product_uom', hozAlign: 'center' },
          { title: 'Item Desc.', field: 'product_name', hozAlign: 'center' },
          {
            title: 'Blend Standard',
            field: 'product_name',
            hozAlign: 'center',
          },
          {
            title: 'Tea weight (Kg)',
            field: 'tea_weight',
            frozen: true,
            hozAlign: 'right',
          },

          // { title: "Release No", field: "release_number", hozAlign: "left" },
          {
            title: 'Blending Qty (Kg)',
            field: 'blending_qty',
            hozAlign: 'right',
            frozen: true,
            editor: 'number',
            editorParams: (cell) => {
              const teaWeight =
                cell.getRow().getData().tea_weight -
                cell.getRow().getData().allocated_blend_quantity
              return {
                min: 0,
                max: teaWeight,
                step: 1,
              }
            },
            formatter: (cell) => {
              const value = cell.getValue()
              const element = cell.getElement()
              element.style.backgroundColor = '#f2de79'
              return value
            },
          },
          {
            title: 'Blended Quantity (Kg)',
            field: 'allocated_blend_quantity',
            hozAlign: 'right',
            frozen: true,
          },
        ],
        height: '400px',
        selectable: true,
        selectableRollingSelection: false,
      })

      tabulatorRef.current.on(
        'rowSelectionChanged',
        function (data: any, rows: any) {
          setSelectedRowCount(data.length)
        },
      )

      return () => {
        if (tabulatorRef.current) {
          tabulatorRef.current.destroy()
        }
      }
    }
  }, [blendItems])

  useEffect(() => {
    // setTableItems(blendItems);
  }, [blendItems])

  const confirmRemove = async () => {
    if (tabulatorRef.current && !loading) {
      setLoading(true)
      const selectedData = tabulatorRef.current.getSelectedData()
      const selectedIds = selectedData.map((row: any) => row.id)

      try {
        await deleteSalesAllocs(selectedIds)
        toast({
          title: 'Success',
          description: 'Selected allocations have been removed',
          variant: 'default',
        })
        tabulatorRef.current.deselectRow()
        deleted(selectedIds)
        setSelectedRowCount(0)
        setIsDeleteConfirmOpen(false)
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleNewAllocations = (data: CustomerFullBlends) => {
    allocationsChanged([...blendItems, ...data.products])
  }

  const getBlendData = () => {
    if (!tabulatorRef.current) return null

    const tableData = tabulatorRef.current.getData()
    return {
      partner_id: customerId,
      quantities: tableData.map((row) => row.blending_qty),
      demand_line_ids: tableData.map((row) => row.id),
    }
  }

  const handleConfirmClick = () => {
    const data = getBlendData()
    if (data) {
      handleConfirm(data)
    }
  }
  return (
    <div>
      <Card>
        <CardHeader className="top-0 z-10 flex flex-row items-center justify-between">
          <CardTitle>{isEdit ? 'Edit Blend' : 'Create Blend'}</CardTitle>
          {isEdit && (
            <div>
              <div>
                <label className="text-md">
                  {editiingInfo.name} | {editiingInfo.productName}
                </label>
              </div>
              <div>
                <label className="text-md">
                  Customer:{' '}
                  {editiingInfo.customerName ? editiingInfo.customerName : ''}
                </label>
              </div>
              <div>
                <label className="text-md">
                  Quantity: {editiingInfo.quantity ? editiingInfo.quantity : 0}
                </label>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Dialog open={isAddDialog} onOpenChange={setIsAddDialog}>
              <DialogTrigger asChild>
                <Button
                  className="bg-green-600 text-white"
                  onClick={() => setIsAddDialog(true)}
                >
                  Add Allocations
                </Button>
              </DialogTrigger>
              <BlendDialog
                isEdit={isEdit}
                isOpen={isAddDialog}
                setIsOpen={setIsAddDialog}
                onCreateBlend={handleNewAllocations}
                customerId={customerId}
                blendId={blendId}
                currentBlendIds={blendItems.map((item) => item.id)}
              />
            </Dialog>
            <Button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="bg-red-600 text-white"
              disabled={selectedRowCount === 0}
            >
              Remove ({selectedRowCount})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={allocationDataRef} className="flex-grow"></div>

          <Button
            onClick={handleConfirmClick}
            className="mt-4"
            disabled={isConfirming || !blendItems || blendItems.length === 0}
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming
              </>
            ) : isEdit ? (
              'Confirm and Edit blends'
            ) : (
              'Confirm and Generate Blends'
            )}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to remove the selected allocations from the
            blend?
          </p>
          <DialogFooter>
            <Button
              onClick={() => setIsDeleteConfirmOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={confirmRemove} className="bg-red-600 text-white">
              {loading ? 'Confirming' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BlendCreation

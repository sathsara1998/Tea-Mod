import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator_semanticui.min.css'
import { useApiMethods } from '@/hooks/useApiMethods'
import { useToast } from '../ui/use-toast'
import {
  AddSalesAllocation,
  Customer,
  CustomerOrder,
  CustomerOrdersTableData,
} from '../types'

export interface EditProp {
  products: AddSalesAllocation[]
}

export interface CustomerFullBlends {
  partner_id: number
  products: CustomerOrdersTableData[]
}

interface ModernBlendDialogProps {
  customerId: number
  onCreateBlend: (blendData: CustomerFullBlends) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isEdit: boolean
  blendId?: number
  productName: string
  currentBlendIds?: number[]
}
export default function BlendDialog({
  customerId,
  onCreateBlend,
  isOpen,
  setIsOpen,
  isEdit,
  blendId,
  currentBlendIds,
  productName,
}: ModernBlendDialogProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [customerOrderLines, setCustomerOrderLines] = useState<CustomerOrder[]>(
    [],
  )
  const [customerOrders, setCustomerOrders] = useState<
    CustomerOrdersTableData[]
  >([])
  const [selectedOrderLines, setSelectedOrderLines] = useState<
    CustomerOrdersTableData[]
  >([])

  const allocationsTableRef = useRef<HTMLDivElement>(null)
  const tabulatorRef = useRef<Tabulator | null>(null)

  const { getCustomerBlendOrders, addAllocation } = useApiMethods()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && allocationsTableRef.current) {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy()
      }

      tabulatorRef.current = new Tabulator(allocationsTableRef.current, {
        data: isEdit
          ? customerOrders.filter(
              (item) => item.product_name === `${productName}`,
            )
          : customerOrders,
        height: '400px',
        placeholder: 'No Order Lines Available',
        selectableRows: true,
        groupBy: 'product_name',
        columns: [
          {
            title: 'D/ID',
            field: 'id',
            hozAlign: 'center',
          },
          {
            title: 'Product Name',
            field: 'product_name',

            hozAlign: 'left',
          },
          {
            title: 'Customer Name',
            field: 'customer_name',

            hozAlign: 'center',
          },
          {
            title: 'Quantity allocated',
            field: 'quantity_allocated',

            hozAlign: 'center',
          },
          {
            title: 'Quantity Needed',
            field: 'quantity_needed',
            hozAlign: 'center',
          },
          {
            title: 'Quantity Remaining',
            field: 'quantity_remaining',
            hozAlign: 'center',
          },
          { title: 'Contract No', field: 'contract_number', hozAlign: 'left' },

          {
            title: 'Sale Quantity',
            field: 'sales_qty',
            hozAlign: 'left',
          },
          {
            title: 'Blend Description',
            field: 'blend_details',
            hozAlign: 'left',
          },
        ],
      })

      tabulatorRef.current.on(
        'rowSelectionChanged',
        function (selectedData, rows) {
          if (isEdit || currentBlendIds?.length) {
            let disableIds = currentBlendIds?.length ? currentBlendIds : []
            let productId: number = 0
            if (selectedData.length > 0) {
              productId = selectedData[0].product_id
            }
            // Filter out the rows with disabled IDs
            rows.forEach((row) => {
              const rowData = row.getData()
              if (currentBlendIds && currentBlendIds.includes(rowData.id)) {
                row.deselect() // Automatically deselect rows with disabled ids
              } else if (productId != 0 && productId != rowData.product_id) {
                row.deselect()
                disableIds.push(rowData.id)
                toast({
                  title: 'Error',
                  description: 'Cannot add from different products',
                  variant: 'destructive',
                })
              }
            })

            // Set the selected teas excluding the disabled ones
            const validSelections = selectedData.filter(
              (item) => !disableIds.includes(item.id),
            )
            setSelectedOrderLines(validSelections)
          } else {
            let disableIds: any = []
            let productId: number = 0

            if (selectedData.length > 0) {
              productId = selectedData[0].product_id
            }
            console.log(productId)

            rows.forEach((row) => {
              const rowData = row.getData()
              if (productId != 0 && productId != rowData.product_id) {
                row.deselect()
                disableIds.push(rowData.id)
                toast({
                  title: 'Error',
                  description: 'Cannot add from different products',
                  variant: 'destructive',
                })
              }
            })
            const validSelections = selectedData.filter(
              (item) => !disableIds.includes(item.id),
            )
            setSelectedOrderLines(validSelections)
          }
        },
      )
    }

    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy()
        tabulatorRef.current = null
      }
    }
  }, [customerOrders, isOpen])

  const fetchCustomerOrders = async (cusId: number) => {
    try {
      const orders = await getCustomerBlendOrders(cusId)
      console.log(orders.data)

      const customerData = orders.data.map((line: any) => ({
        contract_number: line.sale_order, // Map sale_order to contract_number
        contract_line_no: line.demand_line_id, // Map demand_line_id to contract_line_no
        customer_name: line.customer_name, // Map demand_line_id to contract_line_no
        product_internal_ref: line.component_id.toString(), // Assuming component_id as product_internal_ref
        product_uom_qty: line.quantity_needed, // quantity_needed maps to product_uom_qty
        product_uom: 'Units', // Assuming 'Units' as the UOM (update if different)
        product_name: line.component_name.en_US, // Use component_name.en_US as product_name
        product_blend_internal_ref: line.finished_product_id.toString(), // Assuming finished_product_id
        blend_details: line.allocations.length
          ? line.allocations[0].blend_name
          : '', // Use the first blend_name from allocations
        tea_weight: line.allocations.length
          ? line.allocations[0].quantity_needed
          : 0, // Use the quantity from the first allocation
        allocated_blend_quantity: line.quantity_allocated, // Use quantity_allocated
        product_id: line.component_id, // Assuming component_id as product_id
        release_number: 1, // Hardcoded release number (update logic if needed)
        standard: '', // Empty standard (update if applicable)
        blending_qty:
          line.allocations.length && line.allocations[0].quantity
            ? line.allocations[0].quantity - line.quantity_allocated
            : 0, // Calculate blending_qty
        line_id: line.demand_line_id, // Use demand_line_id as line_id
        id: line.demand_line_id, // Use demand_line_id as id
        quantity_allocated: line.quantity_allocated,
        quantity_needed: line.quantity_needed,
        quantity_remaining: line.quantity_remaining,
        sales_qty: line.sales_qty,
      }))

      setCustomerOrders(customerData)
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleCreateBlend = () => {
    if (selectedOrderLines.length > 0) {
      if (isEdit) {
        editBlend()
      } else {
        createBlend()
      }
    }
  }

  const editBlend = async () => {
    const products: AddSalesAllocation[] = selectedOrderLines.map((line) => {
      return {
        blend_id: blendId ? blendId : 0,
        demand_line_id: line.id,
        quantity: line.allocated_blend_quantity,
      }
    })

    try {
      await addAllocation(products)
      toast({
        title: 'Success',
        description: 'Blend created successfully',
        variant: 'default',
      })
      createBlend()
    } catch (err: any) {
      console.error('Failed to allocation:', err)
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to create allocation',
        variant: 'destructive',
      })
    }
  }

  const createBlend = () => {
    const passObj: CustomerFullBlends = {
      partner_id: Number(selectedCustomer),
      products: selectedOrderLines,
    }

    onCreateBlend(passObj)
    setIsOpen(false)
  }

  const closePopup = (val: boolean) => {
    setSelectedCustomer(null)
    setIsOpen(val)
  }

  useEffect(() => {
    if (isOpen) {
      fetchCustomerOrders(customerId)
    }
  }, [isOpen])

  return (
    <DialogContent
      className="max-h-[90vh] max-w-[60vw] overflow-y-auto"
      onInteractOutside={(e) => {
        e.preventDefault()
      }}
    >
      <DialogHeader>
        <DialogTitle>Create New Blend</DialogTitle>
      </DialogHeader>

      <Card>
        <CardHeader>
          <CardTitle>Customer Order Lines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-[55vw]">
            <div
              ref={allocationsTableRef}
              className="h-[400px]"
              aria-label="Customer Order Lines Table"
            ></div>
          </div>
        </CardContent>
      </Card>

      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateBlend}
          disabled={selectedOrderLines.length === 0}
        >
          {isEdit ? 'Add' : 'Create Blend'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

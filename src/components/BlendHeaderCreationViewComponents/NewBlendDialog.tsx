import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import "tabulator-tables/dist/css/tabulator.min.css"
import { useApiMethods } from '@/hooks/useApiMethods'
import { useToast } from '../ui/use-toast'
import { AddSalesAllocation, Customer, CustomerOrder, CustomerOrdersTableData } from '../types'

export interface EditProp {
  products: AddSalesAllocation[];
}

export interface CustomerFullBlends {
  partner_id: number,
  products: CustomerOrdersTableData[]
}

interface ModernBlendDialogProps {
  customerId: number
  onCreateBlend: (blendData: CustomerFullBlends) => void,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  isEdit: boolean;
  blendId?: number;
  currentBlendIds?: number[]
}

export default function ModernBlendDialog({ customerId, onCreateBlend, isOpen, setIsOpen, isEdit, blendId, currentBlendIds }: ModernBlendDialogProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [customerOrderLines, setCustomerOrderLines] = useState<CustomerOrder[]>([])
  const [customerOrders, setCustomerOrders] = useState<CustomerOrdersTableData[]>([])
  const [selectedOrderLines, setSelectedOrderLines] = useState<CustomerOrdersTableData[]>([])

  const allocationsTableRef = useRef<HTMLDivElement>(null)
  const tabulatorRef = useRef<Tabulator | null>(null)

  const { getCustomerOrders, addSalesAllocationtoBlend } = useApiMethods();
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && allocationsTableRef.current && customerOrderLines.length > 0) {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy()
      }

      tabulatorRef.current = new Tabulator(allocationsTableRef.current, {
        data: customerOrders,
        height: "400px",
        layout: "fitColumns",
        placeholder: "No Order Lines Available",
        selectableRows: true,
        groupBy: "product_name",
        columns: [
          { title: "#", formatter: "rownum", width: 40, hozAlign: "center" },
          { title: "Contract No", field: "contract_number", hozAlign: "left" },
          { title: "Line No", field: "contract_line_no", hozAlign: "left" },
          { title: "FG Description", field: "product_internal_ref", hozAlign: "left" },
          { title: "FG Quantity", field: "product_uom_qty", hozAlign: "right" },
          { title: "UOM", field: "product_uom", hozAlign: "center" },
          { title: "Blend Description", field: "blend_details", hozAlign: "left" },
          { title: "Blend Quantity", field: "tea_weight", hozAlign: "right" },
          { title: "Allocated Blend Qty", field: "allocated_blend_quantity", hozAlign: "left" },
        ],
      })

      tabulatorRef.current.on("rowSelectionChanged", function (selectedData, rows) {
        if (isEdit) {
          // Filter out the rows with disabled IDs
          rows.forEach((row) => {
            const rowData = row.getData();
            if (currentBlendIds && currentBlendIds.includes(rowData.id)) {
              row.deselect(); // Automatically deselect rows with disabled ids
            }
          });
    
          // Set the selected teas excluding the disabled ones
          if (currentBlendIds) {
            const validSelections = selectedData.filter(item => !currentBlendIds.includes(item.id));
            setSelectedOrderLines(validSelections);
          }
        } else {
          setSelectedOrderLines(selectedData);
        }
      });
    }

    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy()
        tabulatorRef.current = null
      }
    }
  }, [customerOrders])

  useEffect(() => {
    let customerData: CustomerOrdersTableData[] = [];

    customerOrderLines.forEach(line => {
      line.order_lines.forEach(item => {
        customerData.push({
          contract_number: line.contract_number,
          contract_line_no: item.contract_line_no,
          product_internal_ref: item.product_internal_ref,
          product_uom_qty: item.product_uom_qty,
          product_uom: item.product_uom,
          product_name: item.tea_blend_details.length ? item.tea_blend_details[0].product_name : "",
          product_blend_internal_ref: item.tea_blend_details.length ? item.tea_blend_details[0].product_internal_ref : "",
          blend_details: item.tea_blend_details.length ? item.tea_blend_details[0].product_name : "",
          tea_weight: item.tea_blend_details.length ? item.tea_blend_details[0].tea_weight : 0,
          allocated_blend_quantity: item.allocated_blend_quantity,
          product_id: item.tea_blend_details.length ? item.tea_blend_details[0].product_id : 0,
          release_number: 1,
          standard: "",
          blending_qty: item.tea_blend_details.length ? item.tea_blend_details[0].tea_weight - item.allocated_blend_quantity : 0,
          line_id: item.line_id,
          id: item.line_id
        })
      })
    })
    setCustomerOrders(customerData);
  }, [customerOrderLines])

  const fetchCustomerOrders = async (cusId: number) => {
    try {
      const orders = await getCustomerOrders(cusId)
      setCustomerOrderLines(orders)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
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
    const products: AddSalesAllocation[] = selectedOrderLines.map(line => {
      return {
        blend_id: blendId ? blendId : 0,
        sale_order_line_id: line.id,
        quantity: line.allocated_blend_quantity
      }
    })

    try {
      await addSalesAllocationtoBlend(products)
      toast({
        title: "Success",
        description: "Blend created successfully",
        variant: "default",
      })
      createBlend()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const createBlend = () => {
    const passObj: CustomerFullBlends = {
      partner_id: Number(selectedCustomer),
      products: selectedOrderLines
    }
    onCreateBlend(passObj)
    setIsOpen(false)
  }

  const closePopup = (val: boolean) => {
    setSelectedCustomer(null);
    setIsOpen(val);
  }

  useEffect(() => {
    if (isOpen) {
      fetchCustomerOrders(customerId);
    }
  }, [isOpen])

  return (
    <DialogContent
      className="max-w-6xl max-h-[90vh] overflow-y-auto"
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
          <div ref={allocationsTableRef} className="w-full h-[400px]" aria-label="Customer Order Lines Table"></div>
        </CardContent>
      </Card>

      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button onClick={handleCreateBlend} disabled={customerOrderLines.length === 0}>{isEdit ? 'Add': 'Create Blend'}</Button>
      </DialogFooter>
    </DialogContent>
  )
}
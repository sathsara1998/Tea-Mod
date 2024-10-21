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
import { Customer, CustomerOrder, CustomerOrdersTableData } from '../types'

interface OrderLine {
  line_id: number
  contract_line_no: string
  product_id: number
  product_name: string
  product_uom_qty: number
  product_uom: string
  tea_blend_quantity: number
  allocated_blend_quantity: number
  tea_cost: number
  tea_blend_details: {
    product_id: number
    product_name: string
    quantity: number
    uom: string
  }[]
}

export interface CustomerFullBlends {
  partner_id: number,
  products: CustomerOrdersTableData[]
}

interface ModernBlendDialogProps {
  customers: Customer[]
  onCreateBlend: (blendData: CustomerFullBlends) => void
}

export default function ModernBlendDialog({ customers, onCreateBlend }: ModernBlendDialogProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [customerOrderLines, setCustomerOrderLines] = useState<CustomerOrder[]>([])
  const [customerOrders, setCustomerOrders] = useState<CustomerOrdersTableData[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOrderLines, setSelectedOrderLines] = useState<CustomerOrdersTableData[]>([])

  const allocationsTableRef = useRef<HTMLDivElement>(null)
  const tabulatorRef = useRef<Tabulator | null>(null)

  const { getCustomerOrders } = useApiMethods();
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
        groupBy:"product_name",
        columns: [
          { title: "#", formatter: "rownum", width: 60, hozAlign: "center" },
          { title: "Line No", field: "contract_number", hozAlign: "left" },
          { title: "Line No", field: "contract_line_no", hozAlign: "left" },
          { title: "Product", field: "product_internal_ref", hozAlign: "left" },
          { title: "Quantity", field: "product_uom_qty", hozAlign: "right" },
          { title: "UOM", field: "product_uom", hozAlign: "center" },
          { title: "Allocated Blend Qty", field: "product_name", hozAlign: "right" },
          { title: "Blending Qty", field: "product_blend_internal_ref", hozAlign: "right" },
          { title: "Tea Blend Details", field: "blend_details", hozAlign: "left" },
        ],
      })

      tabulatorRef.current.on("rowSelectionChanged", function(data: any, rows: any){
        setSelectedOrderLines(data);
      })
    }

    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy()
        tabulatorRef.current = null
      }
    }
  }, [customerOrders])

  useEffect(() => {
    let customerData : CustomerOrdersTableData[] = [];

    customerOrderLines.forEach(line => {
      line.order_lines.forEach(item => {
        console.log("line", item);
        
        customerData.push({
          contract_number: line.contract_number,
          contract_line_no: item.contract_line_no,
          product_internal_ref: item.product_internal_ref,
          product_uom_qty: item.product_uom_qty,
          product_uom: item.product_uom,
          product_name: item.tea_blend_details.length ? item.tea_blend_details[0].product_name : "",
          product_blend_internal_ref: item.tea_blend_details.length ? item.tea_blend_details[0].product_internal_ref: "",
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

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    fetchCustomerOrders(Number(customerId))
  }

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
      const passObj: CustomerFullBlends = {
        partner_id: Number(selectedCustomer),
        products: selectedOrderLines
      }
      onCreateBlend(passObj)
      setIsOpen(false)
    }
  }

  const closePopup = (val: boolean) => {
    setSelectedCustomer(null);
    setIsOpen(val);
  }

  return (
    <Dialog open={isOpen} onOpenChange={closePopup}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          New Blend
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-6xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Create New Blend</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Select onValueChange={handleCustomerChange} value={selectedCustomer || undefined}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers && customers.length > 0 ? (
                  customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name ? customer.name : `Customer ${customer.id}`}
                    </SelectItem>
                  ))
                ) : (
                  <div>No customers available</div> // Fallback in case customers is empty or undefined
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

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
          <Button onClick={handleCreateBlend} disabled={customerOrderLines.length === 0}>Create Blend</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
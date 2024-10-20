import React, { useState, useEffect, useRef } from 'react'
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

// Place your JSON data here
const contractDataArr = [
  {
      "id": 15,
      "name": "S00015",
      "contract_number": "E/24/007000",
      "partner_id": 2846,
      "partner_name": "SAY HELLO (PVT) LTD",
      "date_order": "2024-10-19 17:17:20",
      "amount_total": 253.0,
      "currency_id": "LKR",
      "state": "sale",
      "total_tea_cost": 0.0,
      "order_lines": [
          {
              "line_id": 28,
              "contract_line_no": "000000",
              "product_id": 108962,
              "product_name": "( QFS4F ) GREENFI ELDS ORGANIC FAIRTRADE",
              "product_uom_qty": 200.0,
              "product_uom": "kg",
              "tea_blend_quantity": 0.0,
              "allocated_blend_quantity": 0.0,
              "tea_cost": 0.0,
              "tea_blend_details": [
                  {
                      "product_id": 106255,
                      "product_name": "FW235/336 AISLABY TYPE BOP",
                      "quantity": 200.0,
                      "uom": "kg"
                  }
              ]
          },
          {
              "line_id": 29,
              "contract_line_no": "000000",
              "product_id": 111170,
              "product_name": "\"SWALIF BRAND LEMON TEA\"ENV STR&TAG 25X2",
              "product_uom_qty": 1.0,
              "product_uom": "Nos",
              "tea_blend_quantity": 0.0,
              "allocated_blend_quantity": 0.0,
              "tea_cost": 0.0,
              "tea_blend_details": []
          },
          {
              "line_id": 30,
              "contract_line_no": "000000",
              "product_id": 108332,
              "product_name": "( S5OF) CAMPION INV 550 (PACKING IN P/S)",
              "product_uom_qty": 50.0,
              "product_uom": "kg",
              "tea_blend_quantity": 0.0,
              "allocated_blend_quantity": 0.0,
              "tea_cost": 0.0,
              "tea_blend_details": [
                  {
                      "product_id": 94286,
                      "product_name": "SACK KRAFT PAPER SHEET 45\" X 56\" (70GSM)",
                      "quantity": 0.0,
                      "uom": "Nos"
                  }
              ]
          },
          {
              "line_id": 31,
              "contract_line_no": "00002750",
              "product_id": 116827,
              "product_name": "( S5B) LAXAPANA INV 310R (PACKING IN PS",
              "product_uom_qty": 1.0,
              "product_uom": "kg",
              "tea_blend_quantity": 0.0,
              "allocated_blend_quantity": 0.0,
              "tea_cost": 0.0,
              "tea_blend_details": [
                  {
                      "product_id": 104422,
                      "product_name": "STD BSGS5B",
                      "quantity": 4.5,
                      "uom": "kg"
                  }
              ]
          },
          {
              "line_id": 32,
              "contract_line_no": "00002751",
              "product_id": 108332,
              "product_name": "( S5OF) CAMPION INV 550 (PACKING IN P/S)",
              "product_uom_qty": 1.0,
              "product_uom": "kg",
              "tea_blend_quantity": 0.0,
              "allocated_blend_quantity": 0.0,
              "tea_cost": 0.0,
              "tea_blend_details": [
                  {
                      "product_id": 94286,
                      "product_name": "SACK KRAFT PAPER SHEET 45\" X 56\" (70GSM)",
                      "quantity": 0.0,
                      "uom": "Nos"
                  }
              ]
          }
      ]
  },
  {
      "id": 14,
      "name": "S00014",
      "contract_number": "E/24/006999",
      "partner_id": 2846,
      "partner_name": "SAY HELLO (PVT) LTD",
      "date_order": "2024-10-19 17:10:16",
      "amount_total": 251.0,
      "currency_id": "LKR",
      "state": "sale",
      "total_tea_cost": 0.0,
      "order_lines": [
          {
              "line_id": 25,
              "contract_line_no": "000000",
              "product_id": 108962,
              "product_name": "( QFS4F ) GREENFI ELDS ORGANIC FAIRTRADE",
              "product_uom_qty": 200.0,
              "product_uom": "kg",
              "tea_blend_quantity": 0.0,
              "allocated_blend_quantity": 0.0,
              "tea_cost": 0.0,
              "tea_blend_details": [
                  {
                      "product_id": 106255,
                      "product_name": "FW235/336 AISLABY TYPE BOP",
                      "quantity": 200.0,
                      "uom": "kg"
                  }
              ]
          },
          {
              "line_id": 26,
              "contract_line_no": "000000",
              "product_id": 111170,
              "product_name": "\"SWALIF BRAND LEMON TEA\"ENV STR&TAG 25X2",
              "product_uom_qty": 1.0,
              "product_uom": "Nos",
              "tea_blend_quantity": 0.0,
              "allocated_blend_quantity": 0.0,
              "tea_cost": 0.0,
              "tea_blend_details": []
          },
          {
              "line_id": 27,
              "contract_line_no": "000000",
              "product_id": 108332,
              "product_name": "( S5OF) CAMPION INV 550 (PACKING IN P/S)",
              "product_uom_qty": 50.0,
              "product_uom": "kg",
              "tea_blend_quantity": 0.0,
              "allocated_blend_quantity": 0.0,
              "tea_cost": 0.0,
              "tea_blend_details": [
                  {
                      "product_id": 94286,
                      "product_name": "SACK KRAFT PAPER SHEET 45\" X 56\" (70GSM)",
                      "quantity": 0.0,
                      "uom": "Nos"
                  }
              ]
          }
      ]
  }
]
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

interface ContractData {
  id: number
  name: string
  contract_number: string
  partner_id: number
  partner_name: string
  date_order: string
  amount_total: number
  currency_id: string
  state: string
  total_tea_cost: number
  order_lines: OrderLine[]
}

interface ModernBlendDialogProps {
  contractData?: ContractData[]
  onCreateBlend: (blendData: OrderLine[]) => void
}

export default function ModernBlendDialog({ contractData = [], onCreateBlend }: ModernBlendDialogProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [customerOrderLines, setCustomerOrderLines] = useState<OrderLine[]>([])
  const [isOpen, setIsOpen] = useState(false)
  contractData = contractDataArr
  const allocationsTableRef = useRef<HTMLDivElement>(null)
  const tabulatorRef = useRef<Tabulator | null>(null)

  useEffect(() => {
    if (isOpen && allocationsTableRef.current && customerOrderLines.length > 0) {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy()
      }

      tabulatorRef.current = new Tabulator(allocationsTableRef.current, {
        data: customerOrderLines,
        height: "400px",
        layout: "fitColumns",
        placeholder: "No Order Lines Available",
        selectableRows: true,

        columns: [
          { title: "#", formatter: "rownum", width: 60, hozAlign: "center" },
          { title: "Line No", field: "contract_number", hozAlign: "left" },

          { title: "Line No", field: "contract_line_no", hozAlign: "left" },
          { title: "Product", field: "product_name", hozAlign: "left" },
          { title: "Quantity", field: "product_uom_qty", hozAlign: "right" },
          { title: "UOM", field: "product_uom", hozAlign: "center" },
          { title: "Allocated Blend Qty", field: "allocated_blend_quantity", hozAlign: "right" },
          { title: "Blending Qty", field: "allocated_blend_quantity", hozAlign: "right" },

          { 
            title: "Tea Blend Details", 
            field: "tea_blend_details", 
            hozAlign: "left",
            formatter: (cell) => {
              const details = cell.getValue() as {product_name: string, quantity: number, uom: string}[]
              return details.map(d => `${d.product_name}: ${d.quantity} ${d.uom}`).join(', ')
            }
          },
        ],
      })
    }

    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy()
        tabulatorRef.current = null
      }
    }
  }, [isOpen, customerOrderLines])

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId)
    const customerContracts = contractData.filter(contract => contract.partner_id.toString() === customerId)
    const allOrderLines = customerContracts.flatMap(contract => contract.order_lines)
    setCustomerOrderLines(allOrderLines)
  }

  const handleCreateBlend = () => {
    if (customerOrderLines.length > 0) {
      onCreateBlend(customerOrderLines)
      setIsOpen(false)
    }
  }

  if (!contractData || contractData.length === 0) {
    return <div>No contract data available</div>
  }

  const uniqueCustomers = Array.from(new Set(contractData.map(contract => contract.partner_id)))

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                {uniqueCustomers.map((customerId) => {
                  const customer = contractData.find(c => c.partner_id === customerId)
                  return (
                    <SelectItem key={customerId} value={customerId.toString()}>
                      {customer ? customer.partner_name : `Customer ${customerId}`}
                    </SelectItem>
                  )
                })}
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
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowRight } from "lucide-react"
import { TabulatorFull as Tabulator } from 'tabulator-tables'

import { SelectedBlend, ConfirmedSaleOrder, CustomerOrdersTableData } from '@/components/types';

interface AllocationsData {
  contract_number: string;
  contract_line_no: string;
  product_internal_ref: string;
  product_uom_qty: number;
  product_uom: string;
  product_name: string;
  product_blend_internal_ref: string;
  blend_details: string;
  tea_weight: number;
  allocated_blend_quantity: number;
  release_number: number;
  blending_qty: number;
  standard: string;
}

type BlendCreationProps = {
  blendItems: CustomerOrdersTableData[];
  selectedBlends: SelectedBlend[];
  isConfirming: boolean;
  handleConfirm: () => void;
};

const BlendCreation: React.FC<BlendCreationProps> = ({
  blendItems,
  selectedBlends,
  isConfirming,
  handleConfirm,
}) => {
  const [allocationItems, setAllocationItems] = useState<AllocationsData[]>([])

  const allocationDataRef = useRef<HTMLDivElement>(null)

  const getQuantityColor = (allocated: number, total: number) => {
    if (allocated === total) return 'bg-green-200'
    if (allocated < total) return 'bg-yellow-200'
    return 'bg-blue-200'
  }

  useEffect(() => {
    if (allocationDataRef.current) {
      const table = new Tabulator(allocationDataRef.current, {
        data: blendItems,
        selectableRows:1,
        columns: [
          { title: "#", formatter: "rownum", width: 60, hozAlign: "center" },
          { title: "Line No", field: "contract_line_no", hozAlign: "left" },
          { title: "Line No", field: "contract_number", hozAlign: "left" },
          { title: "Release No", field: "release_number", hozAlign: "left" },
          { title: "Item", field: "product_internal_ref", hozAlign: "left" },
          { title: "Quantity", field: "product_uom_qty", hozAlign: "right" },
          { title: "UOM", field: "product_uom", hozAlign: "center" },
          { title: "Item description", field: "product_name", hozAlign: "center" },
          { title: "Standard", field: "standard", hozAlign: "center" },
          { title: "Tea weight", field: "tea_weight", hozAlign: "right" },
          { title: "Blending Qty", field: "blending_qty", hozAlign: "right", editor: "number", editorParams: (cell) => {
            const teaWeight = cell.getRow().getData().tea_weight;
            return {
              min: 0,
              max: teaWeight,
              step: 1,
            };
          }},
          { title: "Blended Qty", field: "allocated_blend_quantity", hozAlign: "left" },
        ],
        height: "400px",
        selectable: true,
        selectableRollingSelection: false,
      })

      return () => {
        table.destroy()
      }
    }
  }, [blendItems])


  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Blend</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={allocationDataRef} className="flex-grow"></div>
        {/* {blendItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CO Number</TableHead>
                <TableHead>Line No</TableHead>
                <TableHead>Release No</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Qty Ordered</TableHead>
                <TableHead>UM</TableHead>
                <TableHead>Item Description</TableHead>
                <TableHead>Blend Standard</TableHead>
                <TableHead>Tea Weight (kg)</TableHead>
                <TableHead>Blending Qty (kg)</TableHead>
                <TableHead>Blended Qty (kg)</TableHead>
                <TableHead>Select</TableHead>
                <TableHead>Allocate</TableHead>
                <TableHead>Auto Allocate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blendItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.contract_number}</TableCell>
                  <TableCell>{item.contract_line_no}</TableCell>
                  <TableCell>{item.releaseNo}</TableCell>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.qtyOrdered}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell>{item.itemDescription}</TableCell>
                  <TableCell>{item.blendStandard}</TableCell>
                  <TableCell>{item.teaWeightKg}</TableCell>
                  <TableCell>{item.blendingQtyKg}</TableCell>
                  <TableCell>{item.blendedQtyKg}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={selectedBlends.some(b => b.blendName === item.blendStandard && b.quantities.hasOwnProperty(item.id))}
                      onCheckedChange={(checked) => handleBlendSelect(item.blendStandard, item.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={selectedBlends.find(b => b.blendName === item.blendStandard)?.quantities[item.id] || 0}
                      onChange={(e) => handleBlendQuantityChange(item.blendStandard, item.id, Number(e.target.value))}
                      max={item.blendingQtyKg}
                      className={`w-20 ${getQuantityColor(
                        selectedBlends.find(b => b.blendName === item.blendStandard)?.quantities[item.id] || 0,
                        item.blendingQtyKg
                      )}`}
                      disabled={!selectedBlends.some(b => b.blendName === item.blendStandard && b.quantities.hasOwnProperty(item.id))}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAllocateFullQuantity(item.blendStandard, item.id, item.blendingQtyKg)}
                      disabled={!selectedBlends.some(b => b.blendName === item.blendStandard && b.quantities.hasOwnProperty(item.id))}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No blend items available.</p>
        )} */}

        <Button 
          onClick={handleConfirm} 
          className="mt-4" 
          disabled={isConfirming || !blendItems || blendItems.length === 0}
        >
          {isConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming
            </>
          ) : (
            'Confirm and Generate Blends'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlendCreation;
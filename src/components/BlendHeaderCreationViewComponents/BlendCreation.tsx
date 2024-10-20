import React from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowRight } from "lucide-react"

import { SelectedBlend, ConfirmedSaleOrder } from '@/components/types';

interface BlendItem {
  id: number
  contract_number: string
  contract_line_no: number
  releaseNo: number
  item: string
  qtyOrdered: number
  uom: string
  itemDescription: string
  blendStandard: string
  teaWeightKg: number
  blendingQtyKg: number
  blendedQtyKg: number
}

// Dummy data for BlendItems
const dummyBlendItems: BlendItem[] = [
  {
    id: 1,
    contract_number: "CO001",
    contract_line_no: 1,
    releaseNo: 1,
    item: "TEA001",
    qtyOrdered: 1000,
    uom: "KG",
    itemDescription: "Earl Grey Tea",
    blendStandard: "EG-STD-01",
    teaWeightKg: 950,
    blendingQtyKg: 1000,
    blendedQtyKg: 0
  },
  {
    id: 2,
    contract_number: "CO001",
    contract_line_no: 2,
    releaseNo: 1,
    item: "TEA002",
    qtyOrdered: 500,
    uom: "KG",
    itemDescription: "English Breakfast Tea",
    blendStandard: "EB-STD-01",
    teaWeightKg: 480,
    blendingQtyKg: 500,
    blendedQtyKg: 0
  },
  {
    id: 7,
    contract_number: "CO002",
    contract_line_no: 1,
    releaseNo: 1,
    item: "TEA003",
    qtyOrdered: 750,
    uom: "KG",
    itemDescription: "Green Tea",
    blendStandard: "GT-STD-01",
    teaWeightKg: 725,
    blendingQtyKg: 750,
    blendedQtyKg: 0
  },
  {
    id: 4,
    contract_number: "CO002",
    contract_line_no: 1,
    releaseNo: 1,
    item: "TEA003",
    qtyOrdered: 750,
    uom: "KG",
    itemDescription: "Green Tea",
    blendStandard: "GT-STD-01",
    teaWeightKg: 725,
    blendingQtyKg: 750,
    blendedQtyKg: 0
  },
  {
    id: 5,
    contract_number: "CO002",
    contract_line_no: 1,
    releaseNo: 1,
    item: "TEA003",
    qtyOrdered: 750,
    uom: "KG",
    itemDescription: "Green Tea",
    blendStandard: "GT-STD-01",
    teaWeightKg: 725,
    blendingQtyKg: 750,
    blendedQtyKg: 0
  }
];

type BlendCreationProps = {
  confirmedSaleOrders: ConfirmedSaleOrder[];
  blendItems: BlendItem[];
  selectedBlends: SelectedBlend[];
  isConfirming: boolean;
  handleBlendSelect: (blendName: string, itemId: number, checked: boolean) => void;
  handleBlendQuantityChange: (blendName: string, itemId: number, quantity: number) => void;
  handleAllocateFullQuantity: (blendName: string, itemId: number, fullQuantity: number) => void;
  handleConfirm: () => void;
};

const BlendCreation: React.FC<BlendCreationProps> = ({
  confirmedSaleOrders,
  blendItems,
  selectedBlends,
  isConfirming,
  handleBlendSelect,
  handleBlendQuantityChange,
  handleAllocateFullQuantity,
  handleConfirm,
}) => {
  // Use dummy data if blendItems is not provided
  const itemsToRender = blendItems && blendItems.length > 0 ? blendItems : dummyBlendItems;

  const getQuantityColor = (allocated: number, total: number) => {
    if (allocated === total) return 'bg-green-200'
    if (allocated < total) return 'bg-yellow-200'
    return 'bg-blue-200'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Blend</CardTitle>
      </CardHeader>
      <CardContent>
        {itemsToRender.length > 0 ? (
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
              {itemsToRender.map((item) => (
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
        )}

        <Button 
          onClick={handleConfirm} 
          className="mt-4" 
          disabled={isConfirming || !selectedBlends || selectedBlends.length === 0}
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
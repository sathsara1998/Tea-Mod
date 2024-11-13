import React from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowRight } from "lucide-react"
import { SelectedSalesOrders } from './SelectedSalesOrders';

import { SalesOrder, SelectedBlend, ConfirmedSaleOrder } from '@/components/types';

type BlendCreationProps = {
  confirmedSaleOrders: ConfirmedSaleOrder[];
  selectedSalesOrders: SalesOrder[];
  selectedBlends: SelectedBlend[];
  isConfirming: boolean;
  handleSalesOrderSelect: (orderId: string) => void;
  handleRemoveSalesOrder: (orderId: number) => void;
  handleBlendSelect: (blendName: string, lineId: number, checked: boolean) => void;
  handleBlendQuantityChange: (blendName: string, lineId: number, quantity: number) => void;
  handleAllocateFullQuantity: (blendName: string, lineId: number, fullQuantity: number) => void;
  handleConfirm: () => void;
};

const BlendCreation: React.FC<BlendCreationProps> = ({
  confirmedSaleOrders,
  selectedSalesOrders,
  selectedBlends,
  isConfirming,
  handleSalesOrderSelect,
  handleRemoveSalesOrder,
  handleBlendSelect,
  handleBlendQuantityChange,
  handleAllocateFullQuantity,
  handleConfirm,
}) => {
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
        <Select onValueChange={handleSalesOrderSelect}>
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Select a sales order" />
          </SelectTrigger>
          <SelectContent>
            {confirmedSaleOrders.map((order) => (
              <SelectItem key={order.id} value={order.id.toString()}>
                {order.name} - {order.customer_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedSalesOrders.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedSalesOrders.map((order) => (
              <SelectedSalesOrders
                key={order.id}
                order={order}
                handleRemoveSalesOrder={handleRemoveSalesOrder}
              />
            ))}
          </div>
        )}

        {selectedSalesOrders.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Product Quantity</TableHead>
                <TableHead>Blend</TableHead>
                <TableHead>Blend Quantity</TableHead>
                <TableHead>Allocated Blend Quantity</TableHead>
                <TableHead>Select</TableHead>
                <TableHead>Allocate</TableHead>
                <TableHead>Auto Allocate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedSalesOrders.flatMap((order) =>
                order.order_lines.map((line) => (
                  <TableRow key={`${order.id}-${line.line_id}`}>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{line.product_name}</TableCell>
                    <TableCell>{line.product_uom_qty} {line.product_uom}</TableCell>
                    <TableCell>
                      {line.tea_blend_details.map((blend) => (
                        <div key={blend.product_id}>{blend.product_name}</div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {line.tea_blend_details.map((blend) => (
                        <div key={blend.product_id}>{blend.quantity} {blend.uom}</div>
                      ))}
                    </TableCell>
                    <TableCell>{line.allocated_blend_quantity}</TableCell>
                    <TableCell>
                      {line.tea_blend_details.map((blend) => (
                        <div key={blend.product_id}>
                          <Checkbox
                            checked={selectedBlends.some(b => b.blendName === blend.product_name && b.quantities.hasOwnProperty(line.line_id))}
                            onCheckedChange={(checked) => handleBlendSelect(blend.product_name, line.line_id, checked === true)}
                          />
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {line.tea_blend_details.map((blend) => (
                        <div key={blend.product_id}>
                          <Input
                            type="number"
                            value={selectedBlends.find(b => b.blendName === blend.product_name)?.quantities[line.line_id] || 0}
                            onChange={(e) => handleBlendQuantityChange(blend.product_name, line.line_id, Number(e.target.value))}
                            max={blend.quantity}
                            className={`w-20 ${getQuantityColor(
                              selectedBlends.find(b => b.blendName === blend.product_name)?.quantities[line.line_id] || 0,
                              blend.quantity
                            )}`}
                            disabled={!selectedBlends.some(b => b.blendName === blend.product_name && b.quantities.hasOwnProperty(line.line_id))}
                          />
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {line.tea_blend_details.map((blend) => (
                        <div key={blend.product_id}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAllocateFullQuantity(blend.product_name, line.line_id, blend.quantity)}
                            disabled={!selectedBlends.some(b => b.blendName === blend.product_name && b.quantities.hasOwnProperty(line.line_id))}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <Button onClick={handleConfirm} className="mt-4" disabled={isConfirming || selectedBlends.length === 0}>
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
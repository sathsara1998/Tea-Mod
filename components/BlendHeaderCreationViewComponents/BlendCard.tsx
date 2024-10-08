'use client'

import React from 'react';
import { Blend } from '../BlendHeaderCreationView';
import { Edit, Info, Trash2 } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

interface BlendCardProps{
    data:Blend;
    onEdit: (blend: Blend) => void;
    onDelete: (blendId: number) => void;
}

const BlendCard: React.FC<BlendCardProps> = ({data, onEdit, onDelete}) => {

    return (
        <div
                  key={data.id}
                  className="p-2 mb-2 rounded bg-secondary flex flex-col"
                >
                  <div className="flex justify-between items-center">
                    <span>{data.name}</span>
                    <Badge variant={data.status === 'confirmed' ? 'default' : 'secondary'}>
                      {data.status}
                    </Badge>
                  </div>
                  <small>Blend: {data.blendName}</small>
                  <small>Quantity: {data.quantity.toFixed(3)}</small>
                  <div className="flex justify-between mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Info className="h-4 w-4 mr-2" />
                          View Allocations
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <h4 className="font-semibold mb-2">Allocations</h4>
                        <ScrollArea className="h-60">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.allocations.map((allocation, index) => (
                                <TableRow key={index}>
                                  <TableCell>{allocation.sale_order_name}</TableCell>
                                  <TableCell>{allocation.product_name}</TableCell>
                                  <TableCell>{allocation.quantity.toFixed(3)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="sm" onClick={() => onEdit(data)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(data.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
    )
}

export default BlendCard
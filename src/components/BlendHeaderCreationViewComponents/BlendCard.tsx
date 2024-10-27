'use client'

import React, { MouseEvent } from 'react';
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
import { TeaBlend } from '../types';
import { useRouter } from 'next/navigation';

interface BlendCardProps{
    data: TeaBlend;
    onEdit: (blend: TeaBlend) => void;
    onDelete: (blendId: number) => void;
}

const BlendCard: React.FC<BlendCardProps> = ({data, onEdit, onDelete}) => {
  const router = useRouter();

  const gotoAllocations = (e: MouseEvent, name: string) => {
    e.stopPropagation();
    router.push(`/allocate?id=${name}`);
  }

    return (
<div
  key={data.id}
  className="p-4 mb-2 mt-2 bg-secondary flex flex-col cursor-pointer
             border-4 border-transparent
             transition-all duration-200 ease-in-out
             hover:bg-secondary-hover hover:shadow-md
             hover:border-primary/50"
  onClick={() => onEdit(data)}
>            
    
    <div className="flex justify-between items-center">
                    <span>{data.name} | {data.product_name} </span>
                    <Badge variant={data.status === 'confirmed' ? 'default' : 'secondary'}>
                      {data.status}
                    </Badge>
                  </div>
                  <small>Customer: {data.customer_name}</small>
                  <small>Quantity: {data.quantity.toFixed(3)}</small>
                  <div className="flex justify-between mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Info className="h-4 w-4 mr-2" />
                          View Order Lines
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
                    {/* <Button variant="outline" size="sm" onClick={() => onEdit(data)} className='flex-1'>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button> */}
                    <Button variant="outline" size="sm" onClick={(e) => gotoAllocations(e, data.name)} className='flex-1'>
                      {/* <Trash2 className="h-4 w-4 mr-2" /> */}
                      <Edit className="h-4 w-4 mr-2" />
                      View Allocations

                    </Button>
                  </div>
                </div>
    )
}

export default BlendCard
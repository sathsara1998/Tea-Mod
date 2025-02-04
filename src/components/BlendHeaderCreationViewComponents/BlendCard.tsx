'use client'

import React, { MouseEvent } from 'react'
import { Edit, Info, Trash2 } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'
import { TeaBlend } from '../types'
import { useRouter } from 'next/navigation'

interface BlendCardProps {
  data: TeaBlend
  onEdit: (blend: TeaBlend) => void
  onDelete: (blendId: number) => void
}

const BlendCard: React.FC<BlendCardProps> = ({ data, onEdit, onDelete }) => {
  const router = useRouter()

  const gotoAllocations = (e: MouseEvent, name: string) => {
    e.stopPropagation()
    window.open(`/allocate?id=${name}`, '_blank')
  }

  return (
    <div
      key={data.id}
      className="hover:bg-secondary-hover mb-2 mt-2 flex cursor-pointer flex-col border-4
             border-transparent bg-secondary
             p-4 transition-all duration-200
             ease-in-out hover:border-primary/50
             hover:shadow-md"
      onClick={() => onEdit(data)}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-bold">
            <div>{data.name}</div>
            <div className="font-semibold">{data.product_name}</div>
          </div>
          <Badge
            variant={data.status === 'confirmed' ? 'default' : 'secondary'}
          >
            {data.status}
          </Badge>
        </div>

        <div className="flex flex-col space-y-1 text-sm text-gray-500">
          <span>Customer: {data.customer_name}</span>
          <span>Export Quantity: {data.export_quantity.toFixed(3)}</span>
          <span>Blended Quantity: {data.allocated_quantity.toFixed(3)}</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Info className="mr-2 h-4 w-4" />
                <span className="truncate">View Order Lines</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <h4 className="mb-2 font-semibold">Allocations</h4>
              <ScrollArea className="h-60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Co No</TableHead>
                      <TableHead>Co Line</TableHead>
                      <TableHead>FG Description</TableHead>
                      <TableHead>Quantity (kg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.allocations.map((allocation, index) => (
                      <TableRow key={index}>
                        <TableCell>{allocation.sale_order}</TableCell>
                        <TableCell>{allocation.component_id}</TableCell>
                        <TableCell>
                          {allocation.finished_product_name}
                        </TableCell>
                        <TableCell>{allocation.quantity.toFixed(3)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => gotoAllocations(e, data.name)}
            className="w-full"
          >
            <Edit className="mr-2 h-4 w-4" />
            <span className="truncate">View Allocations</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BlendCard

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Minus, X } from 'lucide-react'
import { Tea, BlendAllocation } from './types'

interface AllocationTableProps {
  newBlend: any
  availableTeas: Tea[]
  handleQuantityChange: (
    teaId: string,
    quantity: number,
    packages: number,
  ) => void
  removeTeaFromBlend: (teaId: string) => void
  isReadOnly: boolean
}

export default function AllocationTable({
  newBlend,
  availableTeas,
  handleQuantityChange,
  removeTeaFromBlend,
  isReadOnly,
}: AllocationTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tea</TableHead>
          <TableHead>Quantity (kg)</TableHead>
          <TableHead>Packages</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {newBlend.allocations.map((allocation: any) => {
          const tea = availableTeas.find((t) => t.id === allocation.teaId)!
          return (
            <TableRow key={allocation.teaId}>
              <TableCell>{tea.name}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={allocation.quantity}
                  onChange={(e) => {
                    const quantity = parseInt(e.target.value) || 0
                    const packages = Math.ceil(quantity / tea.packageWeight)
                    handleQuantityChange(allocation.teaId, quantity, packages)
                  }}
                  min={0}
                  max={tea.freeQuantity}
                  readOnly={isReadOnly}
                />
              </TableCell>
              <TableCell>{allocation.packages}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newQuantity =
                        allocation.quantity + tea.packageWeight
                      const newPackages = allocation.packages + 1
                      handleQuantityChange(
                        allocation.teaId,
                        newQuantity,
                        newPackages,
                      )
                    }}
                    disabled={
                      isReadOnly ||
                      allocation.quantity + tea.packageWeight > tea.freeQuantity
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newQuantity =
                        allocation.quantity - tea.packageWeight
                      const newPackages = allocation.packages - 1
                      handleQuantityChange(
                        allocation.teaId,
                        newQuantity,
                        newPackages,
                      )
                    }}
                    disabled={isReadOnly || allocation.packages <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeTeaFromBlend(allocation.teaId)}
                    disabled={isReadOnly}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

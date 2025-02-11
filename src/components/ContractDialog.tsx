import React from 'react'
import { ScrollArea } from './ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { BlendInfo } from './types'

// Define type for blendInfo and its allocations

interface ContractDialogProps {
  blendInfo: BlendInfo
}

const ContractDialog: React.FC<ContractDialogProps> = ({ blendInfo }) => {
  console.log('blendInfo', blendInfo)

  return (
    <div>
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
          {blendInfo.allocations?.map((allocationRow, rowIndex) =>
            allocationRow.map((item, colIndex) => (
              <TableRow key={`${rowIndex}-${colIndex}`}>
                <TableCell>{item.sale_order}</TableCell>
                <TableCell>{item.component_id}</TableCell>
                <TableCell>{item.finished_product_name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
              </TableRow>
            )),
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default ContractDialog

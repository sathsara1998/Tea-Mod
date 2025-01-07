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

interface BlendInfo {
  allocations: []
}

interface ContractDialogProps {
  blendInfo: BlendInfo[]
}

const ContractDialog: React.FC<ContractDialogProps> = ({ blendInfo }) => {
  console.log(blendInfo)
  return (
    <div>
      <ScrollArea className="h-[300px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tea</TableHead>
              <TableHead>Lot Number</TableHead>
              <TableHead>Available (kg)</TableHead>
              <TableHead>Quantity (kg)</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* {blendInfo.allocations.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.tea}</TableCell>
                <TableCell>{item.lotNumber}</TableCell>
                <TableCell>{item.availableKg}</TableCell>
                <TableCell>{item.quantityKg}</TableCell>
                <TableCell> */}
            {/* Action buttons or options can be added here */}
            {/* <button>Action</button>
                </TableCell>
              </TableRow>
            ))} */}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}

export default ContractDialog

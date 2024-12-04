import { Dialog } from '@radix-ui/react-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface TeaViewDialogProps {
  isTeaDialogOpen: boolean
  setIsTeaDialogOpen: (open: boolean) => void
  cellData: any
}

const tableData = [
  { blends: 'English Breakfast', bags: 20, kgs: 0.04 },
  { blends: 'Earl Grey', bags: 25, kgs: 0.05 },
  { blends: 'Green Tea', bags: 30, kgs: 0.06 },
]

function TeaViewDialog({
  isTeaDialogOpen,
  setIsTeaDialogOpen,
  cellData,
}: TeaViewDialogProps) {
  return (
    <Dialog open={isTeaDialogOpen} onOpenChange={setIsTeaDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tea Details : {cellData}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Blends</TableHead>
              <TableHead>Bags</TableHead>
              <TableHead>Kgs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.blends}</TableCell>
                <TableCell>{row.bags}</TableCell>
                <TableCell>{row.kgs}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}

export default TeaViewDialog

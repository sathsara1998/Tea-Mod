import React, { useEffect, useState } from 'react'
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
import { useToast } from '@/components/ui/use-toast'
import { useApiMethods } from '@/hooks/useApiMethods'

interface TeaViewDialogProps {
  isTeaDialogOpen: boolean
  setIsTeaDialogOpen: (open: boolean) => void
  cellData: any
}

function TeaViewDialog({
  isTeaDialogOpen,
  setIsTeaDialogOpen,
  cellData,
}: TeaViewDialogProps) {
  const [tableData, setTableData] = useState<any[]>([])
  const { toast } = useToast()
  const { getSourceById } = useApiMethods()

  // Fetch data when dialog is opened
  useEffect(() => {
    const fetchTeaDetails = async () => {
      try {
        if (cellData?.id) {
          const response = await getSourceById(cellData.id, cellData.type)
          console.log(response.blends)
          setTableData(response.blends || []) // Assuming `blends` contains the data
        }
      } catch (error: any) {
        toast({
          title: 'Error fetching tea details',
          description:
            error.message ||
            'An unexpected error occurred while fetching data.',
          variant: 'destructive',
        })
      }
    }

    if (isTeaDialogOpen) {
      fetchTeaDetails()
    }
  }, [isTeaDialogOpen, cellData, toast])

  return (
    <Dialog open={isTeaDialogOpen} onOpenChange={setIsTeaDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Tea Details : {cellData.id} {cellData.type}
          </DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>BLEND NO</TableHead>
              <TableHead>BLEND STATUS</TableHead>
              <TableHead>NO OF BAGS</TableHead>
              <TableHead>TEA QTY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.length > 0 ? (
              tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.id || 0}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.allocated_bags}</TableCell>
                  <TableCell>{row.allocated_quantity}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}

export default TeaViewDialog

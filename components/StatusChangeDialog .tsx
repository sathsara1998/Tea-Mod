import React from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StatusChangeDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: 'draft' | 'confirmed' | 'cancel'
  onStatusChange: (newStatus: 'draft' | 'confirmed' | 'cancel') => void
  isReadOnly: boolean
}

export default function StatusChangeDialog({
  isOpen,
  onOpenChange,
  currentStatus,
  onStatusChange,
  isReadOnly
}: StatusChangeDialogProps) {
  const [newStatus, setNewStatus] = React.useState<'draft' | 'confirmed' | 'cancel'>(currentStatus)

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <Select
        value={currentStatus}
        onValueChange={(value: 'draft' | 'confirmed' | 'cancel') => {
          setNewStatus(value)
          onOpenChange(true)
        }}
        disabled={isReadOnly}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="cancel">Cancel</SelectItem>
        </SelectContent>
      </Select>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Blend Status</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to change the status to {newStatus}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onStatusChange(newStatus)}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
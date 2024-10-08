import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Blend } from '../BlendHeaderCreationView';

interface EditBlendDialogProps {
  editingBlend: Blend | null;
  setEditingBlend: (blend: Blend | null) => void;
  handleUpdateBlend: () => void;
}

const EditBlendDialog: React.FC<EditBlendDialogProps> = ({
  editingBlend,
  setEditingBlend,
  handleUpdateBlend,
}) => {
  if (!editingBlend) return null; // Return null if there's no blend to edit

  return (
    <Dialog open={!!editingBlend} onOpenChange={() => setEditingBlend(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Blend: {editingBlend.blendName}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Blend Name Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Name
            </Label>
            <Input
              id="edit-name"
              value={editingBlend.blendName}
              onChange={(e) =>
                setEditingBlend({
                  ...editingBlend,
                  blendName: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>

          {/* Status Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-status" className="text-right">
              Status
            </Label>
            <Select
              value={editingBlend.status}
              onValueChange={(value) =>
                setEditingBlend({
                  ...editingBlend,
                  status: value as 'draft' | 'confirmed',
                })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allocations Mapping */}
          {editingBlend.allocations.map((allocation, index) => (
            <div key={index} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`edit-allocation-${index}`} className="text-right">
                {allocation.product_name}
              </Label>
              <Input
                id={`edit-allocation-${index}`}
                type="number"
                value={allocation.quantity}
                onChange={(e) => {
                  const newAllocations = [...editingBlend.allocations];
                  newAllocations[index] = {
                    ...allocation,
                    quantity: Number(e.target.value),
                  };
                  setEditingBlend({
                    ...editingBlend,
                    allocations: newAllocations,
                  });
                }}
                className="col-span-3"
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleUpdateBlend}>Update Blend</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBlendDialog;

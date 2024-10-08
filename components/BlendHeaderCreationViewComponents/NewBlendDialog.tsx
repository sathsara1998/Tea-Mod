import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface NewBlendDialogProps {
  newBlendName: string;
  setNewBlendName: (name: string) => void;
  handleCreateNewBlend: () => void;
}

const NewBlendDialog: React.FC<NewBlendDialogProps> = ({ newBlendName, setNewBlendName, handleCreateNewBlend }) => {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Blend
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Blend</DialogTitle>
          <DialogDescription>Enter a name for the new blend.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newBlendName}
              onChange={(e) => setNewBlendName(e.target.value)}
              className="col-span-3"
              placeholder="Enter blend name"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleCreateNewBlend}>Create Blend</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewBlendDialog;

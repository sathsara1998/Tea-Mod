import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { BlendInfo, NewCustomerOrdersTableData, StockLot } from './types'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { useApiMethods } from '@/hooks/useApiMethods'
import { useToast } from './ui/use-toast'
import ContractDialog from './ContractDialog'
interface BlendInformationSectionProps {
  blendInfo: BlendInfo
  onBlendInfoChange: (info: Partial<BlendInfo>) => void
  onGenerateBlendSheet: () => void
  onResetBlendSheet: () => void
  onSaveTableData: () => void
  lotDetails: StockLot | undefined
}

const LabelField: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => {
  const isStatus = label.toLowerCase() === 'status'

  return (
    <div className="rounded bg-slate-50/50 p-2.5 transition-all hover:bg-slate-50">
      <div className="mb-1.5 text-xs font-medium uppercase text-slate-600">
        {label}
      </div>
      {isStatus ? (
        <div>
          <Badge
            variant={
              value.toString().toLowerCase() === 'draft'
                ? 'secondary'
                : value.toString().toLowerCase() === 'in_progress'
                  ? 'secondary'
                  : value.toString().toLowerCase() === 'confirmed'
                    ? 'default'
                    : value.toString().toLowerCase() === 'completed'
                      ? 'outline'
                      : 'destructive'
            }
            className={`
          ${value.toString().toLowerCase() === 'draft' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
          ${value.toString().toLowerCase() === 'in_progress' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
          ${value.toString().toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
          ${value.toString().toLowerCase() === 'completed' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : ''}
          ${value.toString().toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
        `}
          >
            {value.toString().charAt(0).toUpperCase() +
              value.toString().slice(1).toLowerCase()}
          </Badge>
        </div>
      ) : (
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {value || '—'}
        </div>
      )}
    </div>
  )
}

export const FormField: React.FC<{
  label: string
  value: string | number
  onChange?: (value: string) => void
  type?: string
  readOnly?: boolean
}> = ({ label, value, onChange, type = 'text', readOnly = false }) => (
  <div className="space-y-2">
    <Label htmlFor={label}>{label}</Label>
    <Input
      id={label}
      type={type}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      readOnly={readOnly}
      className={readOnly ? 'bg-gray-100 dark:bg-background' : ''}
    />
  </div>
)

const BlendInformationSection: React.FC<BlendInformationSectionProps> = ({
  blendInfo,
  onBlendInfoChange,
  onGenerateBlendSheet,
  onResetBlendSheet,
  onSaveTableData,
  lotDetails,
}) => {
  const [UpdateBlendConfirmOpen, setIsUpdateBlendConfirmOpen] = useState(false)

  const { updatePacking } = useApiMethods()
  const { toast } = useToast()
  const cn = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ')
  }
  const handleUpdateBlendDetails = async () => {
    try {
      const packingData = {
        blend_id: blendInfo.id,
        packing_type: blendInfo.packing_type,
        prop_sample: blendInfo.prop_sample_grams,
        remark: blendInfo.remark,
      }

      await updatePacking(packingData)
      setIsUpdateBlendConfirmOpen(false)

      toast({
        title: 'Success',
        description: 'Packing data updated successfully',
        variant: 'default',
      })
    } catch (error) {
      console.error('Error updating blend details:', error)
      toast({
        title: 'destruct',
        description: 'Packing data updated unsuccesfull',
        variant: 'default',
      })
    }
  }

  console.log('avgcost', blendInfo.avg_tea_cost)
  console.log(blendInfo.packing_type, blendInfo.prop_sample_grams)
  return (
    <div className="mb-4 grid grid-cols-9 gap-4 rounded-lg bg-muted/50 p-4">
      {/* Blend Details Card */}
      <Card className="col-span-3 border border-border bg-background shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Blend Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setIsUpdateBlendConfirmOpen(true)}
            className={cn(
              'group relative flex w-full items-center justify-between',
              'border-red-200 dark:border-red-800',
              'bg-red-50 dark:bg-red-900/20',
              'text-red-700 dark:text-red-400',
              'hover:bg-red-100 dark:hover:bg-red-900/30',
              'transition-all hover:shadow-sm',
            )}
            disabled={blendInfo.status.toLowerCase() !== 'draft'}
          >
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="hidden md:block">Update Blend Details</span>
              <span className="md:hidden">Update</span>
            </span>
            <svg
              className="h-4 w-4 transform transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <LabelField label="Date" value={blendInfo.blend_date} />
            <LabelField
              label="Blend Standard"
              value={blendInfo.blendStandard}
            />

            <div className="rounded border border-border  p-2">
              <div className="mb-1 text-xs uppercase text-muted-foreground">
                Prop Sample(gms)
              </div>
              <Input
                value={blendInfo.prop_sample_grams}
                onChange={(e) =>
                  onBlendInfoChange({
                    prop_sample_grams: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={blendInfo.status.toLowerCase() !== 'draft'}
                className="bg-background text-foreground"
              />
            </div>

            <div className="rounded border border-border  p-2">
              <div className="mb-1 text-xs uppercase text-muted-foreground">
                Packaging Type
              </div>
              <Select
                value={blendInfo.packing_type}
                onValueChange={(value) =>
                  onBlendInfoChange({ packing_type: value })
                }
                disabled={blendInfo.status.toLowerCase() !== 'draft'}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select packaging type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bulk">Bulk</SelectItem>
                  <SelectItem value="packet">Packet</SelectItem>
                  <SelectItem value="tea_bag">Tea Bag</SelectItem>
                  <SelectItem value="strightline">Straight Line</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <LabelField label="Status" value={blendInfo.status} />
            <div className="rounded border border-border  p-2">
              <div className="mb-1 text-xs uppercase text-muted-foreground">
                Note
              </div>
              <Input
                value={blendInfo.remark}
                onChange={(e) =>
                  onBlendInfoChange({
                    remark: e.target.value || '',
                  })
                }
                disabled={blendInfo.status.toLowerCase() !== 'draft'}
                className="bg-background text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis Card */}
      <Card className="col-span-3 border border-border bg-background shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <LabelField
              label="Total Allocated"
              value={blendInfo.totalAllocated}
            />
            <LabelField label="Average Price" value={blendInfo.averagePrice} />
            <LabelField
              label="Avg Cost to Allocate"
              value={blendInfo.avg_to_allocate_tea_cost}
            />
            <LabelField
              label="Balance to Allocate"
              value={blendInfo.balanceToAllocate}
            />
            <LabelField label="Tea Cost" value={blendInfo.avg_tea_cost} />
            {blendInfo.export_quantity !== undefined && (
              <LabelField
                label="Export Quantity"
                value={blendInfo.export_quantity?.toString()}
              />
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={UpdateBlendConfirmOpen}
        onOpenChange={setIsUpdateBlendConfirmOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to update the blend?</p>
          <DialogFooter>
            <Button
              onClick={() => setIsUpdateBlendConfirmOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateBlendDetails} variant="default">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Actions Card */}
      <Card className="col-span-3 border border-border bg-background shadow-sm">
        <ContractDialog blendInfo={blendInfo} />
      </Card>
    </div>
  )
}

export default BlendInformationSection

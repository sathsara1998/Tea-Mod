import React from 'react'
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
import { BlendInfo, StockLot } from './types'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'

interface BlendInformationSectionProps {
  blendInfo: BlendInfo
  onBlendInfoChange: (info: Partial<BlendInfo>) => void
  onGenerateBlendSheet: () => void
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
                : value.toString().toLowerCase() === 'confirmed'
                  ? 'default'
                  : value.toString().toLowerCase() === 'completed'
                    ? 'outline'
                    : 'destructive'
            }
            className={`
          ${value.toString().toLowerCase() === 'draft' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
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
  onSaveTableData,
  lotDetails,
}) => {
  return (
    <div className="mb-4 grid grid-cols-12 gap-4 rounded-lg bg-slate-100 p-4">
      <div className="col-span-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="mb-3 border-b pb-2 text-sm font-semibold">
          Blend Details
        </div>
        <div className="grid grid-cols-2 gap-3">
          <LabelField label="Date" value={blendInfo.blend_date} />
          <LabelField label="Blend Standard" value={blendInfo.blendStandard} />

          <div className="rounded bg-slate-50 p-2">
            <div className="mb-1 text-xs uppercase text-slate-600">
              Prop Sample (gms)
            </div>
            <Input
              value={blendInfo.propSample}
              onChange={(e) =>
                onBlendInfoChange({
                  propSample: parseFloat(e.target.value) || 0,
                })
              }
              disabled={blendInfo.status.toLowerCase() === 'done'}
            />
          </div>
          <div className="rounded bg-slate-50 p-2">
            <div className="mb-1 text-xs uppercase text-slate-600">
              Required Date
            </div>
            <Input
              type="date"
              value={blendInfo.requiredDate}
              onChange={(e) =>
                onBlendInfoChange({ requiredDate: e.target.value })
              }
              min={new Date().toISOString().split('T')[0]}
              disabled={blendInfo.status.toLowerCase() === 'done'}
            />
          </div>

          <div className="rounded bg-slate-50 p-2">
            <div className="mb-1 text-xs uppercase text-slate-600">
              Packaging Type
            </div>
            <Select
              value={blendInfo.packagingType}
              onValueChange={(value) =>
                onBlendInfoChange({ packagingType: value })
              }
              disabled={blendInfo.status.toLowerCase() === 'done'}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select packaging type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulk">Bulk</SelectItem>
                <SelectItem value="bags">Bags</SelectItem>
                <SelectItem value="carton">Carton</SelectItem>
                <SelectItem value="container">Container</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <LabelField label="Status" value={blendInfo.status} />
        </div>
      </div>

      <div className="col-span-5 rounded-lg bg-white p-4 shadow-sm">
        <div className="mb-3 border-b pb-2 text-sm font-semibold">
          Cost Analysis
        </div>
        <div className="grid grid-cols-2 gap-3">
          <LabelField
            label="Total Allocated"
            value={blendInfo.totalAllocated}
          />
          <LabelField label="Average Price" value={blendInfo.averagePrice} />
          <LabelField
            label="Avg Cost to Allocate"
            value={blendInfo.averageCostToAllocate}
          />
          <LabelField
            label="Balance to Allocate"
            value={blendInfo.balanceToAllocate}
          />
          <LabelField label="Tea Cost" value={blendInfo.teaCost} />
          {blendInfo.export_quantity !== undefined && (
            <LabelField
              label="Export Quantity"
              value={blendInfo.export_quantity?.toString()}
            />
          )}
        </div>
      </div>

      <div className="col-span-3 rounded-lg bg-white p-4 shadow-sm">
        <div className="mb-3 border-b pb-2 text-sm font-semibold">Actions</div>
        <div className="space-y-2">
          {/* <Button
            variant="outline"
            onClick={onSaveTableData}
            className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            Save data
          </Button> */}
          <Button
            variant="outline"
            onClick={onGenerateBlendSheet}
            className="w-full justify-start bg-green-50 text-xs text-green-700 hover:bg-green-100 sm:text-sm"
          >
            <span className="hidden sm:inline">Generate Blend Sheet</span>
            <span className="sm:hidden">Gen. Sheet</span>
          </Button>
          <Button
            variant="outline"
            onClick={onGenerateBlendSheet}
            className="w-full justify-start bg-orange-50 text-xs text-orange-600 hover:bg-orange-100 sm:text-sm"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BlendInformationSection

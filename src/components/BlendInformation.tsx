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
  onResetBlendSheet,
  onSaveTableData,
  lotDetails,
}) => {
  const cn = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ')
  }

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
          <div className="grid grid-cols-2 gap-3">
            <LabelField label="Date" value={blendInfo.blend_date} />
            <LabelField
              label="Blend Standard"
              value={blendInfo.blendStandard}
            />

            <div className="rounded border border-border bg-muted/30 p-2">
              <div className="mb-1 text-xs uppercase text-muted-foreground">
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
                className="bg-background text-foreground"
              />
            </div>

            <div className="rounded border border-border bg-muted/30 p-2">
              <div className="mb-1 text-xs uppercase text-muted-foreground">
                Required Date
              </div>
              <Input
                type="date"
                value={blendInfo.requiredDate}
                onChange={(e) =>
                  onBlendInfoChange({ requiredDate: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
                disabled
                className="bg-background text-foreground"
              />
            </div>

            <div className="rounded border border-border bg-muted/30 p-2">
              <div className="mb-1 text-xs uppercase text-muted-foreground">
                Packaging Type
              </div>
              <Select
                value={blendInfo.packagingType}
                onValueChange={(value) =>
                  onBlendInfoChange({ packagingType: value })
                }
                disabled={blendInfo.status.toLowerCase() === 'done'}
              >
                <SelectTrigger className="bg-background text-foreground">
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
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card className="col-span-3 border border-border bg-background shadow-sm">
        {/* <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Contract Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded border border-border bg-muted/30 p-2">
              <div className="mb-1 text-xs uppercase text-muted-foreground">
                Contract Number
              </div>
              <Input
                // value={blendInfo.contractNumber}
                // onChange={(e) =>
                //   onBlendInfoChange({ contractNumber: e.target.value })
                // }
                className="bg-background text-foreground"
                placeholder="Enter contract #"
              />
            </div>

            <div className="rounded border border-border bg-muted/30 p-2">
              <div className="mb-1 text-xs uppercase text-muted-foreground">
                Contract Date
              </div>
              <Input
                type="date"
                // value={blendInfo.contractDate}
                // onChange={(e) =>
                //   onBlendInfoChange({ contractDate: e.target.value })
                // }
                className="bg-background text-foreground"
              />
            </div>

            <div className="rounded border border-border bg-muted/30 p-2">
              <div className="mb-1 text-xs uppercase text-muted-foreground">
                Contract Type
              </div>
              <Select
              // value={blendInfo.contractType}
              // onValueChange={(value) =>
              //   onBlendInfoChange({ contractType: value })
              // }
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                  <SelectItem value="fixed">Fixed Term</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded border border-border bg-muted/30 p-2">
              <div className="mb-1 text-xs uppercase text-muted-foreground">
                Contract Value
              </div>
              <Input
                type="number"
                // value={blendInfo.contractValue}
                // onChange={(e) =>
                //   onBlendInfoChange({
                //     contractValue: parseFloat(e.target.value) || 0,
                //   })
                // }
                className="bg-background text-foreground"
                placeholder="Enter value"
              />
            </div>
          </div>
        </CardContent> */}
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {blendInfo.status === 'draft' && (
              <Button
                variant="outline"
                onClick={onGenerateBlendSheet}
                className={cn(
                  'group relative flex w-full items-center justify-between',
                  'border-green-200 dark:border-green-800',
                  'bg-green-50 dark:bg-green-900/20',
                  'text-green-700 dark:text-green-400',
                  'hover:bg-green-100 dark:hover:bg-green-900/30',
                  'transition-all hover:shadow-sm',
                )}
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
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="hidden md:block">Generate Blend Sheet</span>
                  <span className="md:hidden">Generate</span>
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
            )}
            {blendInfo.status === 'confirmed' && (
              <Button
                variant="outline"
                onClick={onResetBlendSheet}
                className={cn(
                  'group relative flex w-full items-center justify-between',
                  'border-orange-200 dark:border-orange-800',
                  'bg-orange-50 dark:bg-orange-900/20',
                  'text-orange-700 dark:text-orange-400',
                  'hover:bg-orange-100 dark:hover:bg-orange-900/30',
                  'transition-all hover:shadow-sm',
                )}
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset
                </span>
                <svg
                  className="h-4 w-4 transform transition-transform group-hover:-rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BlendInformationSection

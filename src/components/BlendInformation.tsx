import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { BlendInfo, StockLot } from './types'

interface BlendInformationSectionProps {
    blendInfo: BlendInfo;
    onBlendInfoChange: (info: Partial<BlendInfo>) => void;
    onGenerateBlendSheet: () => void;
    onSaveTableData: () => void;
    lotDetails: StockLot | undefined;
}

const LabelField: React.FC<{ label: string; value: string | number }> = ({ label, value }) => {
  const isStatus = label.toLowerCase() === 'status';
  
  return (
    <div className="bg-slate-50 p-2 rounded">
      <div className="text-xs text-slate-600 uppercase mb-1">{label}</div>
      {isStatus ? (
        <div>
          <Badge 
            variant={value.toString().toLowerCase() === 'active' ? 'default' : 
                    value.toString().toLowerCase() === 'pending' ? 'secondary' :
                    value.toString().toLowerCase() === 'completed' ? 'outline' : 'destructive'}>
            {value.toString().charAt(0).toUpperCase() + value.toString().slice(1).toLowerCase()}
          </Badge>
        </div>
      ) : (
        <div className="text-sm font-medium">{value || '-'}</div>
      )}
    </div>
  );
};

export const FormField: React.FC<{ label: string; value: string | number; onChange?: (value: string) => void; type?: string; readOnly?: boolean }> = ({label, value, onChange, type = "text", readOnly = false}) => (
  <div className="space-y-2">
    <Label htmlFor={label}>{label}</Label>
    <Input
      id={label}
      type={type}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      readOnly={readOnly}
      className={readOnly ? "bg-gray-100 dark:bg-background" : ""}
    />
  </div>
)

const BlendInformationSection: React.FC<BlendInformationSectionProps> = ({
  blendInfo,
  onBlendInfoChange,
  onGenerateBlendSheet,
  onSaveTableData,
  lotDetails
}) => {
  return (
    <div className="grid grid-cols-12 gap-4 bg-slate-100 p-4 rounded-lg mb-4">
      <div className="col-span-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="text-sm font-semibold mb-3 pb-2 border-b">Blend Details</div>
        <div className="grid grid-cols-2 gap-3">
          <LabelField label="Date" value={blendInfo.date} />
          <LabelField label="Blend Standard" value={blendInfo.blendStandard} />
          <LabelField label="Prop Sample (gms)" value={blendInfo.propSample} />
          <LabelField label="Required Date" value={blendInfo.requiredDate} />
          <LabelField label="Packaging Type" value={blendInfo.packagingType} />
          <LabelField label="Status" value={blendInfo.status} />
        </div>
      </div>

      <div className="col-span-5 bg-white p-4 rounded-lg shadow-sm">
        <div className="text-sm font-semibold mb-3 pb-2 border-b">Cost Analysis</div>
        <div className="grid grid-cols-2 gap-3">
          <LabelField label="Total Allocated" value={blendInfo.totalAllocated} />
          <LabelField label="Average Price" value={blendInfo.averagePrice} />
          <LabelField label="Avg Cost to Allocate" value={blendInfo.averageCostToAllocate} />
          <LabelField label="Balance to Allocate" value={blendInfo.balanceToAllocate} />
          <LabelField label="Tea Cost" value={blendInfo.teaCost} />
          {blendInfo.export_quantity !== undefined &&
            <LabelField label="Export Quantity" value={blendInfo.export_quantity?.toString()} />
          }
        </div>
      </div>

      <div className="col-span-3 bg-white p-4 rounded-lg shadow-sm">
        <div className="text-sm font-semibold mb-3 pb-2 border-b">Actions</div>
        <div className="space-y-2">
          <Button variant="outline" onClick={onSaveTableData}
            className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700">
            Save data
          </Button>
          <Button variant="outline" onClick={onGenerateBlendSheet}
            className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700">
            Generate Blend Sheet
          </Button>
          
        </div>
      </div>
    </div>
  );
};

export default BlendInformationSection;
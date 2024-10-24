import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { BlendInfo, StockLot } from './types'

interface BlendInformationSectionProps {
    blendInfo: BlendInfo;
    onBlendInfoChange: (info: Partial<BlendInfo>) => void;
    onGenerateBlendSheet: () => void;  // New prop for handling Generate Blend Sheet action
    onSaveTableData: () => void;
    lotDetails: StockLot | undefined;
  }

  const BlendInformationSection: React.FC<BlendInformationSectionProps> = ({ 
    blendInfo, 
    onBlendInfoChange, 
    onGenerateBlendSheet,
    onSaveTableData,
    lotDetails
  }) => {
      return (
    <Card className="w-full">
      <CardHeader className="bg-gray-600 text-white">
        <CardTitle>Blend Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="details"> */}
            <div className="grid grid-cols-3 gap-2">
              <LabelField label="Blend No." value={blendInfo.blendNo} />
              {/* <LabelField label="Blend Ref No." value={blendInfo.blendRefNo} /> */}
              <LabelField label="Date" value={blendInfo.date} />
              <LabelField label="Blend Standard" value={blendInfo.blendStandard} />
              <LabelField label="Prop Sample (gms)" value={blendInfo.propSample} />
              <LabelField label="Required Date" value={blendInfo.requiredDate} />
              <LabelField label="Packaging Type" value={blendInfo.packagingType} />
              <LabelField label="Status" value={blendInfo.status} />
              <LabelField label="Customer" value={blendInfo.customer.toString()} />
              <LabelField label="Customer Name" value={blendInfo.customerName} />
            </div>
          {/* </TabsContent>
        </Tabs> */}
        <Separator className="my-6" />
        <div className="grid grid-cols-3 gap-2">
          <LabelField label="Total Allocated" value={blendInfo.totalAllocated} />
          <LabelField label="Average Price" value={blendInfo.averagePrice} />
          <LabelField label="Avg Cost to Allocate" value={blendInfo.averageCostToAllocate} />
          <LabelField label="Balance to Allocate" value={blendInfo.balanceToAllocate} />
          <LabelField label="Tea Cost" value={blendInfo.teaCost} />
          {blendInfo.export_quantity != undefined && <LabelField label="Export Quantity" value={blendInfo.export_quantity?.toString()} />}
        </div>
        
        <Separator className="my-6" />

        {lotDetails && (
          <div>
            <div className="grid grid-cols-3 gap-2">
              <LabelField label="Box Number" value={lotDetails.box_number} />
              <LabelField label="Blend Ref No" value={lotDetails.blend_standard_id} />
              <LabelField label="Standard" value={lotDetails.standard} />
              <LabelField label="Standard" value={lotDetails.standard} />
              <LabelField label="Garden Mark" value={lotDetails.garden_mark} />
              <LabelField label="Breaks" value={lotDetails.break} />
              <LabelField label="Grade" value={lotDetails.grade} />
              <LabelField label="Lot No" value={""} />
              <LabelField label="Sample Allowance" value={lotDetails.sample_allowance} />
              <LabelField label="Invoice No" value={lotDetails.invoice_no} />
              <LabelField label="Purchased Price" value={lotDetails.purchased_price} />
              <LabelField label="Free Qty" value={lotDetails.free_quantity} />
            </div>
            <Separator className="my-6" />
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button className="flex-1" variant="outline" onClick={onSaveTableData}>Save data</Button>
          <Button className="flex-1" variant="outline" onClick={onGenerateBlendSheet}>Generate Blend Sheet</Button>
          <Button className="flex-1" variant="outline">Edit Blend Sheet</Button>
          {/* <Button variant="outline">Add/Remove CD</Button> */}
        </div>
      </CardContent>
    </Card>
  )
}

export const FormField: React.FC<{ label: string; value: string | number; onChange?: (value: string) => void; type?: string; readOnly?: boolean }> = ({ label, value, onChange, type = "text", readOnly = false }) => (
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

const FormSelect: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <Label htmlFor={label}>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={label}>
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {/* Add SelectItem components here */}
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  </div>
)

export const LabelField: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
  <div>
    <div><Label htmlFor={label}>{label}</Label></div>
    <div><Label className="text-md" htmlFor={label}>{value}</Label></div>
  </div>
)

export default BlendInformationSection
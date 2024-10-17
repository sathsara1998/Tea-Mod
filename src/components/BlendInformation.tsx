import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface BlendInfo {
  blendNo: string;
  blendRefNo: string;
  date: string;
  blendStandard: string;
  propSample: number;
  requiredDate: string;
  packagingType: string;
  status: string;
  customer: string;
  customerName: string;
  totalAllocated: number;
  averagePrice: number;
  averageCostToAllocate: number;
  balanceToAllocate: number;
  teaCost: number;
}

interface BlendInformationSectionProps {
    blendInfo: BlendInfo;
    onBlendInfoChange: (info: Partial<BlendInfo>) => void;
    onGenerateBlendSheet: () => void;  // New prop for handling Generate Blend Sheet action
  }

  const BlendInformationSection: React.FC<BlendInformationSectionProps> = ({ 
    blendInfo, 
    onBlendInfoChange, 
    onGenerateBlendSheet 
  }) => {
      return (
    <Card className="w-full">
      <CardHeader className="bg-gray-600 text-white">
        <CardTitle>Blend Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Blend No." value={blendInfo.blendNo} onChange={(value) => onBlendInfoChange({ blendNo: value })} />
              <FormField label="Blend Ref No." value={blendInfo.blendRefNo} onChange={(value) => onBlendInfoChange({ blendRefNo: value })} />
              <FormField label="Date" type="date" value={blendInfo.date} onChange={(value) => onBlendInfoChange({ date: value })} />
              <FormSelect label="Blend Standard" value={blendInfo.blendStandard} onChange={(value) => onBlendInfoChange({ blendStandard: value })} />
              <FormField label="Prop Sample (gms)" type="number" value={blendInfo.propSample} onChange={(value) => onBlendInfoChange({ propSample: Number(value) })} />
              <FormField label="Required Date" type="date" value={blendInfo.requiredDate} onChange={(value) => onBlendInfoChange({ requiredDate: value })} />
              <FormSelect label="Packaging Type" value={blendInfo.packagingType} onChange={(value) => onBlendInfoChange({ packagingType: value })} />
              <FormSelect label="Status" value={blendInfo.status} onChange={(value) => onBlendInfoChange({ status: value })} />
              <FormSelect label="Customer" value={blendInfo.customer} onChange={(value) => onBlendInfoChange({ customer: value })} />
              <FormField label="Customer Name" value={blendInfo.customerName} readOnly />
            </div>
          </TabsContent>
          <TabsContent value="summary">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Total Allocated" value={blendInfo.totalAllocated} readOnly />
              <FormField label="Average Price" value={blendInfo.averagePrice} readOnly />
              <FormField label="Avg Cost to Allocate" value={blendInfo.averageCostToAllocate} readOnly />
              <FormField label="Balance to Allocate" value={blendInfo.balanceToAllocate} readOnly />
              <FormField label="Tea Cost" value={blendInfo.teaCost} readOnly />
            </div>
          </TabsContent>
        </Tabs>
        <Separator className="my-6" />
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onGenerateBlendSheet}>Generate Blend Sheet</Button>
          <Button variant="outline">Edit Blend Sheet</Button>
          <Button variant="outline">Add/Remove CD</Button>
        </div>
      </CardContent>
    </Card>
  )
}

const FormField: React.FC<{ label: string; value: string | number; onChange?: (value: string) => void; type?: string; readOnly?: boolean }> = ({ label, value, onChange, type = "text", readOnly = false }) => (
  <div className="space-y-2">
    <Label htmlFor={label}>{label}</Label>
    <Input
      id={label}
      type={type}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      readOnly={readOnly}
      className={readOnly ? "bg-gray-100" : ""}
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

export default BlendInformationSection
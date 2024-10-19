import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { BlendInfo } from './types'

interface BlendInformationSectionProps {
    blendInfo: BlendInfo;
    onBlendInfoChange: (info: Partial<BlendInfo>) => void;
    onGenerateBlendSheet: () => void;  // New prop for handling Generate Blend Sheet action
    onSaveTableData: () => void;
  }

  const BlendInformationSection: React.FC<BlendInformationSectionProps> = ({ 
    blendInfo, 
    onBlendInfoChange, 
    onGenerateBlendSheet,
    onSaveTableData
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
          </TabsList>
          <TabsContent value="details">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Blend No." value={blendInfo.blendNo} onChange={(value) => onBlendInfoChange({ blendNo: value })} />
              <FormField label="Blend Ref No." value={blendInfo.blendRefNo} onChange={(value) => onBlendInfoChange({ blendRefNo: value })} />
              <FormField label="Date" type="date" value={blendInfo.date} onChange={(value) => onBlendInfoChange({ date: value })} />
              <FormField label="Blend Standard" value={blendInfo.blendStandard} onChange={(value) => onBlendInfoChange({ blendStandard: value })} />
              <FormField label="Prop Sample (gms)" type="number" value={blendInfo.propSample} onChange={(value) => onBlendInfoChange({ propSample: Number(value) })} />
              <FormField label="Required Date" type="date" value={blendInfo.requiredDate} onChange={(value) => onBlendInfoChange({ requiredDate: value })} />
              <FormSelect label="Packaging Type" value={blendInfo.packagingType} onChange={(value) => onBlendInfoChange({ packagingType: value })} />
              <FormField label="Status" value={blendInfo.status} onChange={(value) => onBlendInfoChange({ status: value })} />
              <FormSelect label="Customer" value={blendInfo.customer.toString()} onChange={(value) => onBlendInfoChange({ customer: Number(value) })} />
              <FormField label="Customer Name" value={blendInfo.customerName} readOnly />
            </div>
          </TabsContent>
        </Tabs>
        <Separator className="my-6" />
        <div className="flex justify-end space-x-2">
          <Button className="flex-1" variant="outline" onClick={onSaveTableData}>Save data</Button>
          <Button className="flex-2" variant="outline" onClick={onGenerateBlendSheet}>Generate Blend Sheet</Button>
          <Button className="flex-3" variant="outline">Edit Blend Sheet</Button>
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

export default BlendInformationSection
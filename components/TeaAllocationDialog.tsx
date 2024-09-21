import React from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tea, BlendAllocation } from "@/types"

interface TeaAllocationDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  newBlend: BlendAllocation
  setNewBlend: React.Dispatch<React.SetStateAction<BlendAllocation>>
  availableTeas: Tea[]
  isReadOnly: boolean
  addTeaToBlend: (tea: Tea, quantity: number, packages: number) => void
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  allocationMode: 'kg' | 'package'
  setAllocationMode: React.Dispatch<React.SetStateAction<'kg' | 'package'>>
}

export default function TeaAllocationDialog({
  isOpen,
  setIsOpen,
  newBlend,
  setNewBlend,
  availableTeas,
  isReadOnly,
  addTeaToBlend,
  searchTerm,
  setSearchTerm,
  allocationMode,
  setAllocationMode
}: TeaAllocationDialogProps) {
  const filteredTeas = availableTeas.filter(tea => 
    tea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tea.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tea.teaStandard.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tea.gardenMark.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isReadOnly}>Add Tea</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Available Teas</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search teas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex justify-between mb-2">
            <Badge variant="secondary">
              Current: {newBlend.totalQuantity} kg
            </Badge>
            <Badge variant="secondary">
              To Allocate: {newBlend.toAllocate} kg
            </Badge>
          </div>
          <Tabs defaultValue="kg" onValueChange={(value) => setAllocationMode(value as 'kg' | 'package')}>
            <TabsList>
              <TabsTrigger value="kg">Allocate by KG</TabsTrigger>
              <TabsTrigger value="package">Allocate by Package</TabsTrigger>
            </TabsList>
            <TabsContent value="kg">
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tea</TableHead>
                      <TableHead>Lot Number</TableHead>
                      <TableHead>Available (kg)</TableHead>
                      <TableHead>Quantity (kg)</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeas.map((tea) => {
                      const allocatedQuantity = newBlend.allocations.find(a => a.teaId === tea.id)?.quantity || 0
                      return (
                        <TableRow key={tea.id}>
                          <TableCell>{tea.name}</TableCell>
                          <TableCell>{tea.lotNumber}</TableCell>
                          <TableCell>{tea.freeQuantity}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="Quantity (kg)"
                              min={0}
                              max={tea.freeQuantity}
                              data-tea-id={tea.id}
                            />
                            {allocatedQuantity > 0 && (
                              <span className="text-red-500 text-sm ml-2">
                                Allocated: {allocatedQuantity} kg
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const input = document.querySelector(`input[data-tea-id="${tea.id}"]`) as HTMLInputElement
                                const quantity = parseInt(input.value || '0')
                                const packages = Math.ceil(quantity / tea.packageWeight)
                                addTeaToBlend(tea, quantity, packages)
                                setIsOpen(false)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="package">
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tea</TableHead>
                      <TableHead>Lot Number</TableHead>
                      <TableHead>Available Packages</TableHead>
                      <TableHead>Package Weight (kg)</TableHead>
                      <TableHead>Packages</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeas.map((tea) => {
                      const allocatedPackages = newBlend.allocations.find(a => a.teaId === tea.id)?.packages || 0
                      return (
                        <TableRow key={tea.id}>
                          <TableCell>{tea.name}</TableCell>
                          <TableCell>{tea.lotNumber}</TableCell>
                          <TableCell>{tea.packages}</TableCell>
                          <TableCell>{tea.packageWeight}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="Packages"
                              min={0}
                              max={tea.packages}
                              data-tea-id={tea.id}
                            />
                            {allocatedPackages > 0 && (
                              <span className="text-red-500 text-sm ml-2">
                                Allocated: {allocatedPackages} packages
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const input = document.querySelector(`input[data-tea-id="${tea.id}"]`) as HTMLInputElement
                                const packages = parseInt(input.value || '0')
                                const quantity = packages * tea.packageWeight
                                addTeaToBlend(tea, quantity, packages)
                                setIsOpen(false)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
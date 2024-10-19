// import React, { useState , useCallback , useEffect} from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Download } from "lucide-react"
// import { Tea, BlendAllocation } from "./types"
// import { useToast } from './ui/use-toast'
// import TeaSelectionDialog from './TeaSelectionDialog'
// import AllocationTable from './AllocationTable'
// import StatusChangeDialog from './StatusChangeDialog '
// import { generatePDF } from '@/lib/utils'  // Add this import
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"



// interface BlendFormProps {
//   newBlend: BlendAllocation
//   setNewBlend: React.Dispatch<React.SetStateAction<BlendAllocation>>
//   editingBlendId: string | null
//   setEditingBlendId: React.Dispatch<React.SetStateAction<string | null>>
//   availableTeas: Tea[]
//   setAvailableTeas: React.Dispatch<React.SetStateAction<Tea[]>>
//   blendAllocations: BlendAllocation[]
//   setBlendAllocations: React.Dispatch<React.SetStateAction<BlendAllocation[]>>
//   blendNameSequence: number
//   setBlendNameSequence: React.Dispatch<React.SetStateAction<number>>
//   blendNumberSequence: number
//   setBlendNumberSequence: React.Dispatch<React.SetStateAction<number>>
//   fetchTeaCost: (blendId: string) => Promise<number>
// }

// export default function BlendForm({
//   newBlend,
//   setNewBlend,
//   editingBlendId,
//   setEditingBlendId,
//   availableTeas,
//   setAvailableTeas,
//   // blendAllocations,
//   setBlendAllocations,
//   blendNameSequence,
//   setBlendNameSequence,
//   blendNumberSequence,
//   setBlendNumberSequence,
//   fetchTeaCost,
// }: BlendFormProps) {
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] = useState(false)
//   const { toast } = useToast()


//   const isReadOnly = newBlend.status === 'confirmed' || newBlend.status === 'cancel'
//   const [lastGeneratedBlend, setLastGeneratedBlend] = useState<BlendAllocation | null>(null)
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [teaCost, setTeaCost] = useState<number>(0)
  

//   const generateBlend = () => {
//     const currentYear = new Date().getFullYear().toString().slice(-2)
//     const newBlendName = `BSTD${String(blendNameSequence).padStart(6, '0')}`
//     const newBlendNumber = `${currentYear}/${blendNumberSequence}`
    
//     const newBlendAllocation: BlendAllocation = {
//       id: Date.now().toString(),
//       name: newBlendName,
//       blendNo: newBlendNumber,
//       allocations: [],
//       totalQuantity: 0,
//       toAllocate: 0,
//       balance: 0,
//       status: 'draft',
//       createdAt: new Date(),
//       exportQuantity: 0,
//       allocatedQuantity: 0,
//       allocatedQuantityDate: new Date(),
//       customerOrderNo: '',
//       orderLineNumber: '',
//       sampleAllocationDate: new Date(),
//       requiredDate: new Date(),
//       packagingType: 'bulk',
//       averagePrice: 0,
//       teaCost: 0
//     }

//     setBlendAllocations(prevAllocations => [...prevAllocations, newBlendAllocation])
//     setNewBlend(newBlendAllocation)
//     setEditingBlendId(newBlendAllocation.id)
//     setBlendNameSequence(prev => prev + 1)
//     setBlendNumberSequence(prev => prev + 1)
//     setLastGeneratedBlend(newBlendAllocation)



//     // toast({
//     //   title: "New Blend Generated",
//     //   description: `A new blend ${newBlendName} has been created in draft status.`,
//     // })
//   }

//   const calculateAveragePrice = useCallback(() => {
//     if (newBlend.allocations.length === 0) return 0;
//     const totalCost = newBlend.allocations.reduce((sum, allocation) => {
//       const tea = availableTeas.find(t => t.id === allocation.teaId);
//       return sum + (tea ? tea.buyingPrice * allocation.quantity : 0);
//     }, 0);
//     return totalCost / newBlend.totalQuantity;
//   }, [newBlend.allocations, newBlend.totalQuantity, availableTeas]);

//   useEffect(() => {
//     const averagePrice = calculateAveragePrice();
//     setNewBlend(prev => ({ ...prev, averagePrice }));
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [newBlend.allocations, calculateAveragePrice]);

//   useEffect(() => {
//     const fetchCost = async () => {
//       if (newBlend.id) {
//         try {
//           const cost = await fetchTeaCost(newBlend.id);
//           setTeaCost(cost);
//           setNewBlend(prev => ({ ...prev, teaCost: cost }));
//         } catch (error) {
//           console.error("Failed to fetch tea cost:", error);
//           // Generate a random number between 100 and 900
//           const randomCost = Math.floor(Math.random() * (900 - 100 + 1)) + 100;
//           setTeaCost(randomCost);
//           setNewBlend(prev => ({ ...prev, teaCost: randomCost }));
//         }
//       }
//     };
//     fetchCost();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [newBlend.id, fetchTeaCost]);


//   useEffect(() => {
//     if (lastGeneratedBlend) {
//       toast({
//         title: "New Blend Generated",
//         description: `A new blend ${lastGeneratedBlend.name} has been created in draft status.`,
//       })
//       setLastGeneratedBlend(null)
//     }
//   }, [lastGeneratedBlend, toast])

//   const handleQuantityChange = (teaId: string, quantity: number, packages: number) => {
//     if (isReadOnly) return

//     setNewBlend(prevBlend => {
//       const updatedAllocations = prevBlend.allocations.map(a => 
//         a.teaId === teaId ? { ...a, quantity, packages } : a
//       )
//       const totalQuantity = updatedAllocations.reduce((sum, a) => sum + a.quantity, 0)
//       return { ...prevBlend, allocations: updatedAllocations, totalQuantity }
//     })
//   }

//   const addTeaToBlend = (tea: Tea, quantity: number, packages: number) => {
//     if (isReadOnly) return

//     if (quantity <= 0 || quantity > tea.freeQuantity) {
//       toast({
//         title: "Invalid quantity",
//         description: `Please enter a quantity between 1 and ${tea.freeQuantity}.`,
//         variant: "destructive",
//       })
//       return
//     }

//     setNewBlend(prevBlend => {
//       const existingAllocation = prevBlend.allocations.find(a => a.teaId === tea.id)
//       if (existingAllocation) {
//         return {
//           ...prevBlend,
//           allocations: prevBlend.allocations.map(a => 
//             a.teaId === tea.id 
//               ? { ...a, quantity: a.quantity + quantity, packages: a.packages + packages } 
//               : a
//           ),
//           totalQuantity: prevBlend.totalQuantity + quantity
//         }
//       } else {
//         const updatedAllocations = [...prevBlend.allocations, { teaId: tea.id, quantity, packages }]
//         const totalQuantity = updatedAllocations.reduce((sum, a) => sum + a.quantity, 0)
//         if (totalQuantity > prevBlend.toAllocate) {
//           toast({
//             title: "Exceeds allocation",
//             description: `The total quantity exceeds the amount to allocate. Please adjust the quantity.`,
//             variant: "destructive",
//           })
//           return prevBlend
//         }
//         return {
//           ...prevBlend,
//           allocations: updatedAllocations,
//           totalQuantity,
//         }
//       }
//     })

//     setIsDialogOpen(false)
//   }

//   const removeTeaFromBlend = (teaId: string) => {
//     if (isReadOnly) return

//     setNewBlend(prevBlend => {
//       const updatedAllocations = prevBlend.allocations.filter(a => a.teaId !== teaId)
//       const totalQuantity = updatedAllocations.reduce((sum, a) => sum + a.quantity, 0)
//       return { ...prevBlend, allocations: updatedAllocations, totalQuantity }
//     })
//   }

//   const addBlendAllocation = () => {
//     if (isReadOnly) return

//     if (!newBlend.name || !newBlend.blendNo) {
//       toast({
//         title: "Missing information",
//         description: "Please enter both a blend name and blend number.",
//         variant: "destructive",
//       })
//       return
//     }

//     if (newBlend.allocations.length === 0) {
//       toast({
//         title: "No teas allocated",
//         description: "Please allocate at least one tea to the blend.",
//         variant: "destructive",
//       })
//       return
//     }

//     if (newBlend.totalQuantity !== newBlend.toAllocate) {
//       toast({
//         title: "Allocation mismatch",
//         description: "The total allocated quantity does not match the amount to allocate.",
//         variant: "destructive",
//       })
//       return
//     }

//     setBlendAllocations(prevAllocations => {
//       if (editingBlendId) {
//         return prevAllocations.map(blend => 
//           blend.id === editingBlendId ? { ...newBlend, id: editingBlendId } : blend
//         )
//       } else {
//         return [...prevAllocations, { ...newBlend, id: Date.now().toString() }]
//       }
//     })

//     // Update available quantities
//     setAvailableTeas(prevTeas => 
//       prevTeas.map(tea => {
//         const allocation = newBlend.allocations.find(a => a.teaId === tea.id)
//         return allocation
//           ? { ...tea, freeQuantity: tea.freeQuantity - allocation.quantity, packages: tea.packages - allocation.packages }
//           : tea
//       })
//     )

//     setNewBlend({
//         id: "",
//         name: "",
//         blendNo: "",
//         allocations: [],
//         totalQuantity: 0,
//         toAllocate: 0,
//         balance: 0,
//         status: 'draft',
//         createdAt: new Date(),
//         exportQuantity: 0,
//         allocatedQuantity: 0,
//         allocatedQuantityDate: undefined,
//         customerOrderNo: "",
//         orderLineNumber: "",
//         sampleAllocationDate: undefined,
//         requiredDate: undefined,
//         packagingType: 'bulk',
//         averagePrice: 0,
//         teaCost: 0
//     })
//     setEditingBlendId(null)

//     toast({
//       title: `Blend ${editingBlendId ? "updated" : "added"}`,
//       description: `${newBlend.name} has been successfully ${editingBlendId ? "updated" : "added"}.`,
//     })
//   }

//   const changeBlendStatus = (newStatus: 'draft' | 'confirmed' | 'cancel') => {
//     if (isReadOnly) return

//     setNewBlend(prevBlend => ({ ...prevBlend, status: newStatus }))
//     if (editingBlendId) {
//       setBlendAllocations(prevAllocations =>
//         prevAllocations.map(blend =>
//           blend.id === editingBlendId ? { ...blend, status: newStatus } : blend
//         )
//       )
//     }
//     toast({
//       title: "Status changed",
//       description: `The blend status has been changed to ${newStatus}.`,
//     })
//     setIsStatusChangeDialogOpen(false)
//   }


//   const handleGeneratePDF = useCallback(async () => {
//     if (!editingBlendId) return;

//     const success = await generatePDF(newBlend, availableTeas);
//     if (success) {
//       toast({
//         title: "PDF Report Generated",
//         description: `The report for ${newBlend.name} has been generated and downloaded.`,
//       });
//     } else {
//       toast({
//         title: "Error",
//         description: "Failed to generate PDF. Please try again.",
//         variant: "destructive",
//       });
//     }
//   }, [newBlend, availableTeas, editingBlendId, toast]);

//   return (
//     <div className="flex-1 p-4 space-y-6 overflow-y-auto">
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle>{editingBlendId ? "Edit" : "Create New"} Blend Allocation</CardTitle>
//           <div className="space-x-2">
//             <Button onClick={generateBlend}>Generate Blend</Button>
//             <Button onClick={handleGeneratePDF} disabled={!editingBlendId}>
//               <Download className="mr-2 h-4 w-4" />
//               Download PDF
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <Label htmlFor="blendName">Blend Name</Label>
//                 <Input
//                   id="blendName"
//                   value={newBlend.name}
//                   onChange={(e) => setNewBlend(prev => ({ ...prev, name: e.target.value }))}
//                   placeholder="Enter blend name"
//                   readOnly
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="blendNo">Blend Number</Label>
//                 <Input
//                   id="blendNo"
//                   value={newBlend.blendNo}
//                   onChange={(e) => setNewBlend(prev => ({ ...prev, blendNo: e.target.value }))}
//                   placeholder="Enter blend number"
//                   readOnly
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="toAllocate">Quantity to Allocate (kg)</Label>
//                 <Input
//                   id="toAllocate"
//                   type="number"
//                   value={newBlend.toAllocate}
//                   onChange={(e) => setNewBlend(prev => ({ ...prev, toAllocate: parseInt(e.target.value) || 0 }))}
//                   placeholder="Enter quantity to allocate"
//                   readOnly={isReadOnly}
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <Label htmlFor="exportQuantity">Export Quantity (kg)</Label>
//                 <Input
//                   id="exportQuantity"
//                   value={newBlend.exportQuantity !== undefined ? newBlend.exportQuantity.toString() : ''}
//                   readOnly
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="allocatedQuantity">Allocated Quantity (kg)</Label>
//                 <Input
//                   id="allocatedQuantity"
//                   type="number"
//                   value={newBlend.allocatedQuantity !== undefined ? newBlend.allocatedQuantity.toString() : ''}
//                   onChange={(e) => setNewBlend(prev => ({ ...prev, allocatedQuantity: parseInt(e.target.value) || 0 }))}
//                   readOnly={isReadOnly}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="allocatedQuantityDate">Allocated Quantity Date</Label>
//                 <Input
//                   id="allocatedQuantityDate"
//                   type="date"
//                   value={newBlend.allocatedQuantityDate ? newBlend.allocatedQuantityDate.toISOString().split('T')[0] : ''}
//                   onChange={(e) => setNewBlend(prev => ({ ...prev, allocatedQuantityDate: new Date(e.target.value) }))}
//                   readOnly={isReadOnly}
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <Label htmlFor="customerOrderNo">Customer Order No</Label>
//                 <Input
//                   id="customerOrderNo"
//                   value={newBlend.customerOrderNo}
//                   onChange={(e) => setNewBlend(prev => ({ ...prev, customerOrderNo: e.target.value }))}
//                   readOnly={isReadOnly}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="orderLineNumber">Order Line Number</Label>
//                 <Input
//                   id="orderLineNumber"
//                   value={newBlend.orderLineNumber}
//                   onChange={(e) => setNewBlend(prev => ({ ...prev, orderLineNumber: e.target.value }))}
//                   readOnly={isReadOnly}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="sampleAllocationDate">Sample Allocation Date</Label>
//                 <Input
//                   id="sampleAllocationDate"
//                   type="date"
//                   value={newBlend.sampleAllocationDate ? newBlend.sampleAllocationDate.toISOString().split('T')[0] : ''}
//                   onChange={(e) => setNewBlend(prev => ({ ...prev, sampleAllocationDate: new Date(e.target.value) }))}
//                   readOnly={isReadOnly}
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <Label htmlFor="requiredDate">Required Date</Label>
//                 <Input
//                   id="requiredDate"
//                   type="date"
//                   value={newBlend.requiredDate ? newBlend.requiredDate.toISOString().split('T')[0] : ''}
//                   onChange={(e) => setNewBlend(prev => ({ ...prev, requiredDate: new Date(e.target.value) }))}
//                   readOnly={isReadOnly}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="packagingType">Packaging Type</Label>
//                 <Select
//                   value={newBlend.packagingType}
//                   onValueChange={(value) => setNewBlend(prev => ({ ...prev, packagingType: value as 'bulk' | 'packet' | 'tea bag' }))}
//                   disabled={isReadOnly}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select packaging type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="bulk">Bulk</SelectItem>
//                     <SelectItem value="packet">Packet</SelectItem>
//                     <SelectItem value="tea bag">Tea Bag</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <Label htmlFor="averagePrice">Average Price</Label>
//                 <Input
//                   id="averagePrice"
//                   value={newBlend.averagePrice !== undefined ? newBlend.averagePrice.toFixed(2) : ''}
//                   readOnly
//                 />
//               </div>
//             </div>
//             <div>
//               <Label htmlFor="teaCost">Tea Cost (from API or Random)</Label>
//               <Input
//                 id="teaCost"
//                 value={newBlend.teaCost !== undefined ? newBlend.teaCost.toFixed(2) : ''}
//                 readOnly
//               />
//             </div>
//             <div className="flex items-center space-x-2">
//               <Button onClick={() => setIsDialogOpen(true)} disabled={isReadOnly}>Add Tea</Button>
//               <StatusChangeDialog
//                 isOpen={isStatusChangeDialogOpen}
//                 onOpenChange={setIsStatusChangeDialogOpen}
//                 currentStatus={newBlend.status}
//                 onStatusChange={changeBlendStatus}
//                 isReadOnly={isReadOnly}
//               />
//             </div>
//             <AllocationTable
//               newBlend={newBlend}
//               availableTeas={availableTeas}
//               handleQuantityChange={handleQuantityChange}
//               removeTeaFromBlend={removeTeaFromBlend}
//               isReadOnly={isReadOnly}
//             />
//             <div className="flex justify-between items-center">
//               <Button onClick={addBlendAllocation} disabled={isReadOnly || newBlend.totalQuantity !== newBlend.toAllocate}>
//                 {editingBlendId ? "Update" : "Add"} Blend Allocation
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//       <TeaSelectionDialog
//         isOpen={isDialogOpen}
//         onOpenChange={setIsDialogOpen}
//         availableTeas={availableTeas}
//         newBlend={newBlend}
//         addTeaToBlend={addTeaToBlend}
//       />
//     </div>
//   )
// }
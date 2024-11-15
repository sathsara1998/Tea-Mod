
// import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import "tabulator-tables/dist/css/tabulator.min.css"
// import { FormField } from './BlendInformation'
// import { StockLot } from './types';
// import { useApiMethods } from '@/hooks/useApiMethods'
// import { useToast } from './ui/use-toast'

// interface AllocationDetailsDialogProps {
//     isOpen: boolean;
//     onClose: () => void;
//     lotId: number
// }

// const AllocationDetailsDialog: React.FC<AllocationDetailsDialogProps> = ({ isOpen, onClose, lotId }) => {
//     const { getLotInfoById } = useApiMethods();
//     const { toast } = useToast()
//     const [blendInfo, setBlendInfo] = useState<StockLot>({
//         id: 0,
//         box_number: "",
//         blend_standard_id: 0,
//         standard: "",
//         package_count: 0,
//         net_weight: 0.0,
//         free_packages: 0,
//         free_quantity: 0.0,
//         garden_mark: "",
//         grade: "",
//         sample_allowance: "",
//         purchased_price: 0.0,
//         break: "",
//         invoice_no: "",
//         blend_line_type: ""
//     });

//     const fetchLotInfo = useCallback(async () => {
//         try {
//             const data = await getLotInfoById(lotId);
//             setBlendInfo(data);
//         } catch (err: any) {
//             toast({
//                 title: "Error",
//                 description: err.message,
//                 variant: "destructive",
//             });
//         }
//     }, []);

//     useEffect(() => {
//         if (isOpen) {
//             fetchLotInfo();
//         }
//     }, [isOpen])

//     return (
//         <Dialog open={isOpen} onOpenChange={onClose}>
//             <DialogContent className="bg-white p-4 rounded shadow-lg max-w-4xl max-h-[80vh] flex flex-col">
//                 <DialogHeader>
//                     <DialogTitle>Allocation information</DialogTitle>
//                 </DialogHeader>
//                 <div className="grid grid-cols-3 gap-2">
//                     <FormField label="Box Number" value={blendInfo.box_number} readOnly />
//                     <FormField label="Blend Ref No" value={blendInfo.blend_standard_id} readOnly />
//                     <FormField label="Standard" value={blendInfo.standard} readOnly />
//                     <FormField label="Standard" value={blendInfo.standard} readOnly />
//                     <FormField label="Garden Mark" value={blendInfo.garden_mark} readOnly />
//                     <FormField label="Breaks" value={blendInfo.break} readOnly />
//                     <FormField label="Grade" value={blendInfo.grade} readOnly />
//                     <FormField label="Lot No" value={""} readOnly />
//                     <FormField label="Sample Allowance" value={blendInfo.sample_allowance} readOnly />
//                     <FormField label="Invoice No" value={blendInfo.invoice_no} readOnly />
//                     <FormField label="Purchased Price" value={blendInfo.purchased_price} readOnly />
//                     <FormField label="Free Qty" value={blendInfo.free_quantity} readOnly />
//                 </div>
//                 <div className="flex-grow"></div>
//             </DialogContent>
//         </Dialog>
//     );
// }

// export default AllocationDetailsDialog;
export interface Tea {
    id: string
    name: string
    boxNumber: string
    teaStandard: string
    gardenMark: string
    grade: string
    breakGrade: string
    lotNumber: string
    invoiceNumber: string
    freeQuantity: number
    packageWeight: number
    packages: number
    buyingPrice:number
  }
  
  // export interface BlendAllocation {
  //   id: string
  //   name: string
  //   blendNo: string
  //   allocations: { 
  //     teaId: string
  //     quantity: number
  //     packages: number
  //   }[]
  //   totalQuantity: number
  //   toAllocate: number
  //   balance: number
  //   status: 'draft' | 'confirmed' | 'cancel'
  //   createdAt: Date
  //   exportQuantity?: number
  //   allocatedQuantity?: number
  //   allocatedQuantityDate?: Date
  //   customerOrderNo?: string
  //   orderLineNumber?: string
  //   sampleAllocationDate?: Date
  //   requiredDate?: Date
  //   packagingType?: 'bulk' | 'packet' | 'tea bag'
  //   averagePrice?: number
  //   teaCost?: number
  // }

export type TeaBlendDetail = {
  product_id: number;
  product_name: string;
  quantity: number;
  uom: string;
}

export type OrderLine = {
  line_id: number;
  product_id: number;
  product_name: string;
  product_uom_qty: number;
  product_uom: string;
  tea_blend_quantity: number;
  allocated_blend_quantity: number;
  tea_blend_details: TeaBlendDetail[];
}

export type SalesOrder = {
  id: number;
  name: string;
  partner_id: number;
  partner_name: string;
  date_order: string;
  amount_total: number;
  currency_id: string;
  state: string;
  order_lines: OrderLine[];
}

export type BlendAllocation = {
  id: number;
  sale_order_id: number;
  sale_order_name: string;
  sale_order_line_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
}

export type Blend = {
  id: number;
  name: string;
  blendName: string;
  quantity: number;
  status: 'draft' | 'confirmed';
  allocations: BlendAllocation[];
}

export type SelectedBlend = {
  blendName: string;
  quantities: Record<number, number>; // lineId: quantity
}

export type ConfirmedSaleOrder = {
  id: number;
  name: string;
  customer_name: string;
}
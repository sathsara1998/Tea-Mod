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

export interface BlendInfo {
  blendNo: string;
  blendRefNo: string;
  date: string;
  blendStandard: string;
  propSample: number;
  requiredDate: string;
  packagingType: string;
  status: string;
  customer: number;
  customerName: string;
  totalAllocated: number;
  averagePrice: number;
  averageCostToAllocate: number;
  balanceToAllocate: number;
  to_allocate_quantity?:number
  teaCost: number;
  allocations: Array<ManufacturingAllocationTableData>;
  export_quantity: number;
}

export interface TeaAllocation {
  id: string;
  box_number: string;
  lot_no: string;
  garden_mark: string;
  grade: string;  
  net_weight: number;
  bags: number;
  allocated_qty: number;
  free_qty: number;
  allocated_packages: number;
  free_packages: number;
  standard: string;
  sample_allowance: string;
  purchased_price: number;
  break: string;
  invoice_no: string;
  blend_line_type: string;
  allocation_type?: "p" | "w"

}

export interface ManufacturingAllocation {
  id: number;
  lot_id: number;
  box_number: string;
  quantity_kgs: number;
  quantity_packages: number;
  net_weight: number;
  unit_cost: number;
}

export interface ManufacturingAllocationTableData {
  id: number;
  lot_id: number;
  box_number: string;
  quantity_kgs: number;
  quantity_packages: number;
  unit_cost: number;
  net_weight: number;
  package_diff: number;
  weight_diff: number;
  total_cost: number;
  option?: string;
  garden_mark?:string;
  lot_no?:string,
  standard?:string;
  broker?:string;
  grade?:string;
  purchased_qty?:number
  init_quantity?:number
  allocation_type?: "p" | "w"


}

interface Allocation {
  id: number;
  sale_order_id: number;
  sale_order_name: string;
  contract_number: string;
  product_internal_ref: string;
  allocated_blend_quantity: number;
  tea_cost: number;
  sale_order_line_id: number;
  product_uom:string;
  product_uom_qty:number;
  product_id: number;
  product_name: string;
  quantity: number;
  contract_no: string;
  tea_weight: number|0;
}

export interface TeaBlend {
  id: number;
  name: string;
  product_id: number;
  product_name: string;
  customer_id: number;
  customer_name: string;
  quantity: number;
  status: string;
  export_quantity: number;
  allocated_quantity: number;
  blended_quantity: number;
  to_allocate_quantity: number;
  average_cost: number;
  allocations: Allocation[];
  manufacturing_allocations: ManufacturingAllocation[];
  propSample?:number,
  packagingType?:string
}


export interface AddAllocationObject {
  blend_id: number;
  lot_id: number;
  quantity_packages: number;
  quantity_kgs: number;
}

export interface AddAllocationArray {
allocations:[AddAllocationObject]
}



export interface AddSalesAllocation {
  blend_id: number;
  sale_order_line_id: number;
  quantity: number;
}

export interface StockLot {
  id: number;
  box_number: string;
  blend_standard_id: number;
  standard: string;
  package_count: number;
  net_weight: number;
  free_packages: number;
  free_quantity: number;
  garden_mark: string;
  grade: string;
  sample_allowance: string;
  purchased_price: number;
  break: string;
  invoice_no: string;
  blend_line_type: string;
}

export interface Customer {
  id: number;
  name: string;
}

export interface CustomerOrder {
  id: number;
  name: string;
  contract_number: string;
  partner_id: number;
  partner_name: string;
  date_order: string;
  amount_total: number;
  currency_id: string;
  state: string;
  total_tea_cost: number;
  order_lines: ContractLine[];
}

export interface ContractLine {
  line_id: number;
  contract_line_no: string;
  product_id: number;
  product_internal_ref: string;
  product_name: string;
  product_uom_qty: number;
  product_uom: string;
  tea_blend_quantity: number;
  allocated_blend_quantity: number;
  tea_cost: number;
  tea_blend_details: OrderBlendDetail[];
}

export interface OrderBlendDetail {
  product_id: number;
  product_name: string;
  product_internal_ref: string;
  tea_weight: number;
  uom: string;
}

export interface CustomerOrdersTableData {
  id: number;
  contract_number: string;
  contract_line_no: string;
  product_internal_ref: string;
  product_uom_qty: number;
  product_uom: string;
  product_name: string;
  product_blend_internal_ref: string;
  blend_details: string;
  tea_weight: number;
  allocated_blend_quantity: number;
  product_id: number,
  release_number: number;
  blending_qty: number;
  standard: string;
  line_id: number;
}

export interface BlendCreateReq {
  partner_id: number;
  products: [
    {
      product_id: number;
      quantity: number;
      allocations: [
        {
          sale_order_line_id: number;
          quantity: number;
        }
      ]
    }
  ]
}
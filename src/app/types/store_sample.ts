export interface StoreSample {
    id: string
    sampleId:string
    reference: string
    requestedDate: string
    trader: string
    customer: string
    quantity: number
    contractNo?: string
    blendNo?: string
    straightLineQuantity?: number
    propQuantity?: number
    standard: string
    requested_sample_name:string
    status: "Pending" | "Done"
    isSelected?: boolean
  }
  
  export interface StoreSampleRequest {
    sampleId:string
    reference: string
    requestedDate: string
    trader: string
    customer: string
    quantity: number
    standard: string
    status: "Pending"
  }
  
  
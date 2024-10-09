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
  }
  
  export interface BlendAllocation {
    id: string
    name: string
    blendNo: string
    allocations: { 
      teaId: string
      quantity: number
      packages: number
    }[]
    totalQuantity: number
    toAllocate: number
    balance: number
    status: 'draft' | 'confirmed' | 'cancel'
    createdAt: Date
    exportQuantity?: number
    allocatedQuantity?: number
    allocatedQuantityDate?: Date
    customerOrderNo?: string
    orderLineNumber?: string
    sampleAllocationDate?: Date
    requiredDate?: Date
    packagingType?: 'bulk' | 'packet' | 'tea bag'
    averagePrice?: number
    teaCost?: number
  }
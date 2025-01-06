import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Tea, TeaAllocation } from '@/components/types'
import { AxiosRequestConfig } from 'axios'
import axios from 'axios'

interface BlendAllocation {
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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateTeas = (): Tea[] => {
  const teas: Tea[] = []
  const teaTypes = [
    'Assam',
    'Darjeeling',
    'Ceylon',
    'Earl Grey',
    'English Breakfast',
    'Green',
    'Oolong',
    'Pu-erh',
    'White',
    'Chai',
  ]
  const grades = ['TGFOP', 'FBOP', 'OP', 'BOP', 'CTC']

  for (let i = 0; i < 50; i++) {
    const teaType = teaTypes[Math.floor(Math.random() * teaTypes.length)]
    const grade = grades[Math.floor(Math.random() * grades.length)]
    const packageWeight = Math.floor(Math.random() * 10) + 20 // 20-30 kg packages
    const packages = Math.floor(Math.random() * 10) + 1 // 1-10 packages
    teas.push({
      id: `tea-${i + 1}`,
      name: `${teaType} Tea ${i + 1}`,
      boxNumber: `B${String(i + 1).padStart(3, '0')}`,
      teaStandard: `TS-${Math.floor(Math.random() * 1000)}`,
      gardenMark: `GM-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 100)}`,
      grade: grade,
      breakGrade: `BR-${Math.floor(Math.random() * 10)}`,
      lotNumber: `${teaType[0]}${String(i + 1).padStart(3, '0')}`,
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
      freeQuantity: packageWeight * packages,
      packageWeight: packageWeight,
      packages: packages,
      buyingPrice: 0,
    })
  }

  return teas
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const calculateBalance = (
  totalQuantity: number,
  toAllocate: number,
): number => {
  return toAllocate - totalQuantity
}

export const generateBlendName = (sequence: number): string => {
  return `BSTD${String(sequence).padStart(6, '0')}`
}

export const generateBlendNumber = (year: number, sequence: number): string => {
  return `${year.toString().slice(-2)}/${sequence}`
}

export const generatePDF = async (
  blend: BlendAllocation,
  availableTeas: Tea[],
) => {
  if (typeof window === 'undefined') return // Ensure we're on the client side

  try {
    const { default: jsPDF } = await import('jspdf') // Dynamic import of jsPDF
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text(`Blend Report: ${blend.name}`, 14, 22)

    // Add blend details
    doc.setFontSize(12)
    doc.text(`Blend Number: ${blend.blendNo}`, 14, 32)
    doc.text(`Total Quantity: ${blend.totalQuantity} kg`, 14, 40)
    doc.text(`To Allocate: ${blend.toAllocate} kg`, 14, 48)
    doc.text(`Status: ${blend.status}`, 14, 56)

    // Add tea allocations table
    const tableData = blend.allocations.map((allocation) => {
      const tea = availableTeas.find((t) => t.id === allocation.teaId)!
      return [
        tea.name,
        tea.lotNumber,
        allocation.quantity.toString(),
        allocation.packages.toString(),
        tea.grade,
        tea.gardenMark,
        tea.teaStandard,
      ]
    })

    autoTable(doc, {
      startY: 65,
      head: [
        [
          'Tea Name',
          'Lot Number',
          'Quantity (kg)',
          'Packages',
          'Grade',
          'Garden Mark',
          'Tea Standard',
        ],
      ],
      body: tableData,
    })

    // Save the PDF
    doc.save(`${blend.name}_report.pdf`)

    return true // Indicate success
  } catch (error) {
    console.error('Error generating PDF:', error)
    return false // Indicate failure
  }
}

export const generateTestData = (): TeaAllocation[] => {
  const teaTypes = [
    'Black',
    'Green',
    'Oolong',
    'White',
    'Pu-erh',
    'Yellow',
    'Purple',
  ]
  const origins = [
    'China',
    'India',
    'Sri Lanka',
    'Japan',
    'Taiwan',
    'Kenya',
    'Nepal',
  ]
  const grades = [
    'SFTGFOP1',
    'FTGFOP1',
    'TGFOP1',
    'FOP',
    'OP',
    'BOP',
    'FBOP',
    'Sencha',
    'Gyokuro',
    'Matcha',
  ]
  const types = ['BB', 'BG', 'STRL']

  const generateRandomDate = (start: Date, end: Date) => {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    )
      .toISOString()
      .split('T')[0]
  }

  const generateRealisticPackageWeight = (): number => {
    return Math.floor(20 + Math.random() * 31)
  }

  const generateRealisticQuantity = (packageWeight: number): number => {
    const numberOfPackages = Math.floor(5 + Math.random() * 46)
    return numberOfPackages * packageWeight
  }

  const teas: TeaAllocation[] = []

  for (let i = 0; i < 500; i++) {
    const teaType = teaTypes[Math.floor(Math.random() * teaTypes.length)]
    const origin = origins[Math.floor(Math.random() * origins.length)]
    const grade = grades[Math.floor(Math.random() * grades.length)]
    const packageWeight = generateRealisticPackageWeight()
    const type = types[Math.floor(Math.random() * types.length)]

    teas.push({
      id: (i + 1).toString(),
      standard: `${origin} ${teaType} Tea`,
      lot_no: `${teaType.substring(0, 2).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
      free_qty: generateRealisticQuantity(packageWeight),
      net_weight: packageWeight,
      box_number: origin,
      grade: grade,
      blend_line_type: type,
      garden_mark: 'mark',
      bags: 5,
      allocated_qty: 5,
      allocated_packages: 4,
      free_packages: 4,
      sample_allowance: '',
      purchased_price: 50,
      break: '',
      invoice_no: '',
      length: 0,
      init_quantity: 0,
    })
  }

  return teas
}

type ApiclientConfig = {
  url: string
  data?: object
  method: string
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text'
}

// For external api calls
export const apiClient = (configs: ApiclientConfig) => {
  const token = process.env.NEXT_PUBLIC_API_KEY
  const mainConfigs: AxiosRequestConfig = {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }
  return axios({ ...configs, ...mainConfigs })
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Tea , BlendAllocation } from '@/components/types'
import { AxiosRequestConfig } from "axios"
import axios from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const generateTeas = (): Tea[] => {
  const teas: Tea[] = []
  const teaTypes = ["Assam", "Darjeeling", "Ceylon", "Earl Grey", "English Breakfast", "Green", "Oolong", "Pu-erh", "White", "Chai"]
  const grades = ["TGFOP", "FBOP", "OP", "BOP", "CTC"]
  
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
      buyingPrice: 0
    })
  }
  
  return teas
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const calculateBalance = (totalQuantity: number, toAllocate: number): number => {
  return toAllocate - totalQuantity
}

export const generateBlendName = (sequence: number): string => {
  return `BSTD${String(sequence).padStart(6, '0')}`
}

export const generateBlendNumber = (year: number, sequence: number): string => {
  return `${year.toString().slice(-2)}/${sequence}`
}

export const generatePDF = async (blend: BlendAllocation, availableTeas: Tea[]) => {
  if (typeof window === 'undefined') return; // Ensure we're on the client side

  try {
    const { default: jsPDF } = await import('jspdf');  // Dynamic import of jsPDF
    const autoTable = (await import('jspdf-autotable')).default; 

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Blend Report: ${blend.name}`, 14, 22);
    
    // Add blend details
    doc.setFontSize(12);
    doc.text(`Blend Number: ${blend.blendNo}`, 14, 32);
    doc.text(`Total Quantity: ${blend.totalQuantity} kg`, 14, 40);
    doc.text(`To Allocate: ${blend.toAllocate} kg`, 14, 48);
    doc.text(`Status: ${blend.status}`, 14, 56);
    
    // Add tea allocations table
    const tableData = blend.allocations.map(allocation => {
      const tea = availableTeas.find(t => t.id === allocation.teaId)!;
      return [
        tea.name,
        tea.lotNumber,
        allocation.quantity.toString(),
        allocation.packages.toString(),
        tea.grade,
        tea.gardenMark,
        tea.teaStandard,
      ];
    });
    
    autoTable(doc, {
      startY: 65,
      head: [['Tea Name', 'Lot Number', 'Quantity (kg)', 'Packages', 'Grade', 'Garden Mark', 'Tea Standard']],
      body: tableData,
    });
    
    // Save the PDF
    doc.save(`${blend.name}_report.pdf`);

    return true; // Indicate success
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false; // Indicate failure
  }
};

type ApiclientConfig = {
  url: string;
  data?: Object;
  method: string
}

// For external api calls
export const apiClient = (configs: ApiclientConfig) => {
  const token: String = 'f030caaab4b0b324312994565d5f272d5adb05ea';
  const mainConfigs: AxiosRequestConfig = {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
  }
  return axios({ ...configs, ...mainConfigs});
}
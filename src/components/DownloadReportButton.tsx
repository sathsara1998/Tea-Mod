import React from 'react'
import { Button } from '@/components/ui/button'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { UserOptions } from 'jspdf-autotable'

// Add type augmentation for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF
  }
}
interface TableRowData {
  '#': number
  'Box Number': string
  Broker: string
  'Garden Mark': string
  Standard: string
  'Inv No': string
  'Net Weight': number
  Grade: string
  'Purchased Price': number
  'Quantity (Kg)': number
  'Allocated Packages': number
}

interface DownloadReportButtonProps {
  tabulatorRef: any
  blendInfo?: {
    blendNo: string
    blendRefNo: string
    customerName: string
    status: string
    blendDate: string
    totalContractQty: number
    blendStandard: string
    blendAverage: number
    rtNo: string
  }
}

const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({
  tabulatorRef,
  blendInfo,
}) => {
  const generateReport = () => {
    if (tabulatorRef.current) {
      const tableData: TableRowData[] = tabulatorRef.current
        .getData()
        .map((row: any) => ({
          '#': row.id,
          'Box Number': row.box_number,
          Broker: row.broker,
          'Garden Mark': row.garden_mark,
          Standard: row.standard,
          'Inv No': row.lot_no,
          'Net Weight': row.net_weight,
          Grade: row.grade,
          'Purchased Price': row.unit_cost,
          'Quantity (Kg)': row.quantity_kgs,
          'Allocated Packages': row.quantity_packages,
        }))

      interface Column {
        title: string
        dataKey: string
      }

      const columns: Column[] = [
        { title: '#', dataKey: '#' },
        { title: 'Box Number', dataKey: 'Box Number' },
        { title: 'Broker', dataKey: 'Broker' },
        { title: 'Garden Mark', dataKey: 'Garden Mark' },
        { title: 'Standard', dataKey: 'Standard' },
        { title: 'Inv No', dataKey: 'Inv No' },
        { title: 'Net Weight', dataKey: 'Net Weight' },
        { title: 'Grade', dataKey: 'Grade' },
        { title: 'Purchased Price', dataKey: 'Purchased Price' },
        { title: 'Quantity (Kg)', dataKey: 'Quantity (Kg)' },
        { title: 'Allocated Packages', dataKey: 'Allocated Packages' },
      ]

      const doc = new jsPDF({
        orientation: 'landscape',
        format: 'a4',
        unit: 'pt',
      })

      // Get the current date and time for the report generation
      const now = new Date()
      const dateGenerated = now.toLocaleDateString()
      const timeGenerated = now.toLocaleTimeString()

      // Header Styling
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 40

      doc.setFontSize(18)
      doc.setFont('Verdana', 'bold')
      doc.text('TEA TANG(PVT) LTD', pageWidth / 2, 50, { align: 'center' })

      // Add Date and Time on the Top Right Corner
      doc.setFontSize(10)
      doc.setFont('Verdana', 'bold')
      doc.text(
        `Date: ${dateGenerated} ${timeGenerated}`,
        pageWidth - margin,
        30,
        { align: 'right' },
      )

      // Add a rectangle below the header
      // doc.setDrawColor(0)
      // doc.setFillColor(255, 255, 255)
      // doc.rect(margin, 100, pageWidth - 2 * margin, 30, 'FD')

      // Add small rectangle on the right side under the date
      doc.setDrawColor(0)
      doc.setFillColor(255, 255, 255)
      doc.rect(pageWidth - margin - 120, 35, 110, 25, 'FD')
      // Add Report Title Centered Below the Top Section
      const type = 'Incompleted'
      const modal = 'Finance'
      const [month, day, year] = dateGenerated.split('/')

      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]
      const formattedDate = `${day}-${monthNames[parseInt(month) - 1]}-${year}`
      doc.setFontSize(18)
      doc.setFont('Verdana', 'bold')
      doc.text(
        `${type} Blend Sheet as at ${formattedDate}- ${modal}`,
        pageWidth / 2,
        80,
        { align: 'center' },
      )

      // Optionally, add a separator line below the header
      doc.setLineWidth(0.5)
      doc.line(margin, 90, pageWidth - margin, 90)

      // Add blend info below the header
      if (blendInfo) {
        doc.setFontSize(10)
        doc.setFont('Verdana', 'bold')

        const blendInfoStartY = 120
        const blendInfoGap = 20

        // Calculate column positions for two-column layout
        const leftColumnX = Math.floor(pageWidth * 0.1) // Start left column at 20% of page width
        const rightColumnX = Math.floor(pageWidth * 0.7) // Position right column at 60% of page width
        const columnGap = 80 // Increased gap between columns for better spacing

        // Left Side Blend Info
        doc.text(
          `Blend No: ${blendInfo.blendNo}`,
          leftColumnX,
          blendInfoStartY,
          { align: 'left' },
        )
        doc.text(
          `Blend Ref. No: ${blendInfo.blendRefNo}`,
          leftColumnX,
          blendInfoStartY + blendInfoGap,
          { align: 'left' },
        )
        doc.text(
          `Customer: ${blendInfo.customerName}`,
          leftColumnX,
          blendInfoStartY + 2 * blendInfoGap,
          { align: 'left' },
        )
        doc.text(
          `Status: ${blendInfo.status}`,
          leftColumnX,
          blendInfoStartY + 3 * blendInfoGap,
          { align: 'left' },
        )

        // Right Side Blend Info
        doc.text(
          `Blend Date: ${blendInfo.blendDate}`,
          rightColumnX,
          blendInfoStartY,
          { align: 'left' },
        )
        doc.text(
          `Total Contract Qty: ${blendInfo.totalContractQty}`,
          rightColumnX,
          blendInfoStartY + blendInfoGap,
          { align: 'left' },
        )
        doc.text(
          `Blend Standard: ${blendInfo.blendStandard}`,
          rightColumnX,
          blendInfoStartY + 2 * blendInfoGap,
          { align: 'left' },
        )
        doc.text(
          `Blend Average: ${blendInfo.blendAverage}`,
          rightColumnX,
          blendInfoStartY + 3 * blendInfoGap,
          { align: 'left' },
        )
        doc.text(
          `RT No: ${blendInfo.rtNo}`,
          rightColumnX,
          blendInfoStartY + 4 * blendInfoGap,
          { align: 'left' },
        )
      }

      doc.setProperties({
        title: 'Tea Allocation Report',
      })

      // Add table
      doc.autoTable({
        head: [columns.map((col) => col.title)],
        body: tableData.map((row) =>
          columns.map((col) => row[col.dataKey as keyof TableRowData]),
        ),
        styles: {
          fontSize: 8,
          cellPadding: 2,
          textColor: [60, 60, 60], // Dark grey text for all table data (more professional)
        },
        headStyles: {
          // Professional dark blue for the header
          textColor: 255, // White text for the header
        },
        margin: { top: blendInfo ? 225 : 225 },
        didDrawPage: function (data) {
          // Optional: Re-add header on each page if table spans multiple pages
        },
      })

      // Calculate and add totals at the bottom
      const totalKgs = tableData.reduce(
        (sum, row) => sum + row['Quantity (Kg)'],
        0,
      )
      const totalPackages = tableData.reduce(
        (sum, row) => sum + row['Allocated Packages'],
        0,
      )

      const finalY = (doc as any).lastAutoTable.finalY || 500
      doc.setFontSize(10)
      doc.text(
        `Total Quantity (Kg): ${totalKgs.toFixed(2)}`,
        margin,
        finalY + 30,
      )
      doc.text(`Total Packages: ${totalPackages}`, margin, finalY + 50)

      // Add page numbers at the bottom
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.text(
          `Page No : Page ${i} of ${pageCount}`,
          pageWidth - margin,
          doc.internal.pageSize.getHeight() - 20,
          { align: 'right' },
        )
      }

      doc.save('tea-allocations.pdf')
    }
  }
  return (
    <Button onClick={generateReport} className="bg-blue-600 text-white">
      Download Report
    </Button>
  )
}

export default DownloadReportButton

/*
  !Component Created By Kavishka[Intern SE]

  1.Created Report According to the given layouts and designs
  
*/

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
    averagePrice: any

    export_quantity: any
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
        { title: 'Inv\nNo', dataKey: 'Inv No' },
        { title: 'Net\nWeight', dataKey: 'Net Weight' },
        { title: 'Grade', dataKey: 'Grade' },
        { title: 'Purchased\nPrice', dataKey: 'Purchased Price' },
        { title: 'Quantity\n(Kg)', dataKey: 'Quantity (Kg)' },
        { title: 'Allocated\nPackages', dataKey: 'Allocated Packages' },
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

      // First page header
      const addFirstPageHeader = () => {
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

        // Add small rectangle on the right side under the date
        doc.setDrawColor(0)
        doc.setFillColor(255, 255, 255)
        doc.rect(pageWidth - margin - 120, 35, 110, 25, 'FD')

        // Add Report Title
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
        doc.text(
          `${type} Blend Sheet as at ${formattedDate}- ${modal}`,
          pageWidth / 2,
          80,
          { align: 'center' },
        )

        doc.setLineWidth(0.5)
        doc.line(margin, 90, pageWidth - margin, 90)

        // Add blend info
        if (blendInfo) {
          doc.setFontSize(10)
          const blendInfoStartY = 120
          const blendInfoGap = 20
          const leftColumnX = Math.floor(pageWidth * 0.1)
          const rightColumnX = Math.floor(pageWidth * 0.6)

          // Left Side Blend Info
          doc.text(
            `Blend No: ${blendInfo.blendNo}`,
            leftColumnX,
            blendInfoStartY,
          )
          doc.text(
            `Blend Ref. No: ${blendInfo.blendRefNo}`,
            leftColumnX,
            blendInfoStartY + blendInfoGap,
          )
          doc.text(
            `Customer: ${blendInfo.customerName}`,
            leftColumnX,
            blendInfoStartY + 2 * blendInfoGap,
          )
          doc.text(
            `Status: ${blendInfo.status}`,
            leftColumnX,
            blendInfoStartY + 3 * blendInfoGap,
          )

          // Right Side Blend Info
          doc.text(
            `Blend Date: ${blendInfo.blendDate}`,
            rightColumnX,
            blendInfoStartY,
          )
          doc.text(
            `Total Contract Qty: ${blendInfo.export_quantity}`,
            rightColumnX,
            blendInfoStartY + blendInfoGap,
          )
          doc.text(
            `Blend Standard: ${blendInfo.blendStandard}`,
            rightColumnX,
            blendInfoStartY + 2 * blendInfoGap,
          )
          doc.text(
            `Blend Average: ${blendInfo.averagePrice}`,
            rightColumnX,
            blendInfoStartY + 3 * blendInfoGap,
          )
          doc.text(
            `RT No: ${blendInfo.rtNo}`,
            rightColumnX,
            blendInfoStartY + 4 * blendInfoGap,
          )
        }
      }

      doc.setProperties({
        title: 'Tea Allocation Report',
      })

      // Add table with modified styling
      doc.autoTable({
        head: [columns.map((col) => col.title)],
        body: tableData.map((row) =>
          columns.map((col) => row[col.dataKey as keyof TableRowData]),
        ),
        styles: {
          fontSize: 8,
          cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: false,
          textColor: 0,
          fontSize: 8,
          fontStyle: 'normal',
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
        },
        bodyStyles: {
          lineWidth: 0,
          halign: 'center',
          cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
        },
        margin: { top: blendInfo ? 225 : 225, left: margin, right: margin },
        didDrawPage: function (data) {
          // Only add header to first page
          if (data.pageNumber === 1) {
            addFirstPageHeader()
          }

          // Adjust startY for pages after first page
          if (data.pageNumber >= 1) {
            data.settings.margin.top = margin
          }
        },
        startY: doc.getNumberOfPages() === 1 ? 225 : margin,
        tableWidth: 'auto',
        theme: 'plain',
        columnStyles: {
          0: { cellWidth: 30 }, // #
          1: { cellWidth: 100 }, // Box Number
          2: { cellWidth: 120 }, // Broker
          3: { cellWidth: 100 }, // Garden Mark
          4: { cellWidth: 80 }, // Standard
          5: { cellWidth: 50 }, // Inv No
          6: { cellWidth: 50 }, // Net Weight
          7: { cellWidth: 50 }, // Grade
          8: { cellWidth: 60 }, // Purchased Price
          9: { cellWidth: 60 }, // Quantity (Kg)
          10: { cellWidth: 60 }, // Allocated Packages
        },
      })
      console.log(blendInfo)
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

      doc.save(`tea-allocations_${dateGenerated}_${timeGenerated}.pdf`)
    }
  }

  return (
    <Button onClick={generateReport} className="bg-blue-600 text-white">
      Download Report
    </Button>
  )
}

export default DownloadReportButton

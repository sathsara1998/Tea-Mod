import React from 'react'
import { Button } from '@/components/ui/button'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import autoTable, { HAlignType } from 'jspdf-autotable'
import { UserOptions } from 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF
  }
}

interface TableRowData {
  'Box Number': string
  Broker: string
  'Garden Mark': string
  Standard: string
  'Inv No': string
  'Net Weight': number
  'Lot No': string
  Grade: string

  'Quantity (Kg)': number
  'Allocated Packages': number
  'Value (Rs)': number
}

interface DownloadReportButtonProps {
  tabulatorRef: any
  blendInfo?: {
    averagePrice: number
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
// Function to return head styles
const getHeadStyles = () => ({
  textColor: [0, 0, 0] as [number, number, number],
  fontSize: 8,
  fontStyle: 'bold' as const,
  halign: 'center' as const, // Center-aligned headers
  valign: 'middle' as const, // Vertically centered
  cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
  lineWidth: 1,
  lineColor: [0, 0, 0] as [number, number, number], // Subtle border for headers
})

const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({
  tabulatorRef,
  blendInfo,
}) => {
  const generateReport = () => {
    if (tabulatorRef.current) {
      // Function to truncate or format broker names
      const formatBrokerName = (brokerName: string) => {
        // Split broker names and take first word or initials
        const nameParts = brokerName.split(/\s+/)
        return nameParts.length > 1
          ? nameParts.map((part) => part[0]).join('')
          : brokerName.length > 10
            ? brokerName.slice(0, 10) + '.'
            : brokerName
      }
      const formatboxNumber = (boxNumber: string) => {
        return boxNumber.length > 10 ? boxNumber.slice(-10) : boxNumber
      }

      const tableData: TableRowData[] = tabulatorRef.current
        .getData()
        .map((row: any) => {
          const quantity = row.quantity_kgs || 0
          const unitCost = row.unit_cost || 0
          const value = quantity * unitCost

          return {
            'Box Number': formatboxNumber(row.box_number || ''),
            'Sale/Blend Date': '16/04/2024',
            'Sale No': '2024/IM/0003',
            Rcd: 'Y',
            'Last Ammend Date': '31/10/2024',
            Broker: formatBrokerName(row.broker || ''),
            'Garden Mark': row.garden_mark || '',
            Standard: row.standard || '',
            'Inv No': row.invoice_no || '',
            'Lot No': row.lot_no || '',
            'Net Weight': row.net_weight || 0,
            Grade: row.grade || '',
            'Purchased Price': unitCost,
            'Quantity (Kg)': quantity,
            'Allocated Packages': row.quantity_packages || 0,
            'Value (Rs)': parseFloat(value.toFixed(2)),
          }
        })

      const doc = new jsPDF({
        orientation: 'landscape',
        format: 'a4',
        unit: 'pt',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 10 // Reduced margin for wider table

      const columns = [
        { title: 'Broker', dataKey: 'Broker', width: 40 },
        { title: 'Lot No', dataKey: 'Lot No', width: 40 },
        { title: 'Box/Blend\nNumber', dataKey: 'Box Number', width: 55 },
        { title: 'Purchased\nDate', dataKey: 'Sale/Blend Date', width: 60 },
        { title: 'Sale No', dataKey: 'Sale No', width: 40 },
        { title: 'Inv No', dataKey: 'Inv No', width: 40 },
        { title: 'Garden Mark', dataKey: 'Garden Mark', width: 65 },
        { title: 'Grade', dataKey: 'Grade', width: 40 },
        { title: 'No Of\nPkgs', dataKey: 'Allocated Packages', width: 45 },
        { title: 'Weight\n(Kg)', dataKey: 'Net Weight', width: 45 },
        { title: 'Net Qty\n(Kg)', dataKey: 'Quantity (Kg)', width: 45 },
        { title: 'Price\n(Rs)', dataKey: 'Purchased Price', width: 45 },
        { title: 'Value(Rs)', dataKey: 'Value (Rs)', width: 65 },
        { title: 'Rcd', dataKey: 'Rcd', width: 30 },
        { title: 'Prop\nSamp', dataKey: 'Purchased Price', width: 45 },
        { title: 'Updated\nDate', dataKey: 'Last Ammend Date', width: 55 },
      ]
      const columns2 = [
        { header: 'Co No', dataKey: 'co_no' },
        { header: 'Co Line', dataKey: 'co_line' },
        { header: 'R', dataKey: 'r' },
        { header: 'FG Description', dataKey: 'fg_description' },
        { header: 'FG Qty', dataKey: 'fg_qty' },
        { header: 'Qty', dataKey: 'qty' },
        { header: 'Category', dataKey: 'category' },
        { header: 'Line No', dataKey: 'line_no' },
      ]
      const data = [
        {
          co_no: '1001',
          co_line: 'L01',
          r: 'R1',
          fg_description: 'Item A',
          fg_qty: 10,
          qty: 20,
          category: 'Cat1',
          line_no: 1,
        },
        {
          co_no: '1002',
          co_line: 'L02',
          r: 'R2',
          fg_description: 'Item B',
          fg_qty: 15,
          qty: 30,
          category: 'Cat2',
          line_no: 2,
        },
        {
          co_no: '1003',
          co_line: 'L03',
          r: 'R3',
          fg_description: 'Item C',
          fg_qty: 12,
          qty: 25,
          category: 'Cat3',
          line_no: 3,
        },
      ]

      const totalRow = {
        co_no: 'Total',
        co_line: '',
        r: '',
        fg_description: '',
        fg_qty: data.reduce((sum, item) => sum + item.fg_qty, 0),
        qty: data.reduce((sum, item) => sum + item.qty, 0),
        category: '',
        line_no: 0,
      }
      data.push(totalRow)
      const now = new Date()
      const dateGenerated = now.toLocaleDateString()
      const timeGenerated = now.toLocaleTimeString()

      // Calculate totals
      const totalKgs = tableData.reduce(
        (sum, row) => sum + (row['Quantity (Kg)'] || 0),
        0,
      )
      const totalWeight = tableData.reduce(
        (sum, row) => sum + (row['Net Weight'] || 0),
        0,
      )
      const totalPackages = tableData.reduce(
        (sum, row) => sum + (row['Allocated Packages'] || 0),
        0,
      )
      const totalValue = tableData.reduce(
        (sum, row) => sum + (row['Value (Rs)'] || 0),
        0,
      )

      // Prepare totals row for the table
      const totalsRow: TableRowData = {
        Broker: '',
        'Lot No': '',
        'Box Number': '',
        'Inv No': '',
        'Garden Mark': '',
        Standard: '',
        Grade: '',
        'Allocated Packages': totalPackages,
        'Net Weight': parseFloat(totalWeight.toFixed(2)),
        'Quantity (Kg)': parseFloat(totalKgs.toFixed(2)),
        'Value (Rs)': parseFloat(totalValue.toFixed(2)),
      }

      // Add totals row to table data
      tableData.push(totalsRow)
      const addFirstPageHeader = (doc: jsPDF) => {
        doc.setFontSize(16)
        doc.setFont('Calibri', 'bold')
        doc.text('TEA TANG(PVT) LTD', pageWidth / 2, 50, { align: 'center' })

        doc.setFontSize(10)
        doc.setFont('Calibri', 'bold')
        doc.text(
          `Date: ${dateGenerated} ${timeGenerated}`,
          pageWidth - margin,
          30,
          { align: 'right' },
        )

        doc.setDrawColor(0)
        doc.setFillColor(255, 255, 255)
        doc.rect(pageWidth - margin - 120, 35, 110, 25, 'FD')

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

        doc.setFontSize(12)

        if (blendInfo) {
          doc.setFontSize(10)
          const blendInfoStartY = 105 // Starting Y position for the info section
          const blendInfoGap = 15 // Gap between rows
          const leftColumnX = Math.floor(pageWidth * 0.2) // Left column starts at 10% of the page width
          const rightColumnX = Math.floor(pageWidth * 0.6) // Right column starts at 55% of the page width
          const labelWidth = 10 // Fixed width for labels
          const colonWidth = 10 // Fixed width for the colon spacing
          const valueStartX = leftColumnX + labelWidth + colonWidth // Start position for values

          // Left column labels and values
          const leftColumnData = [
            { label: 'Blend No', value: blendInfo.blendNo },
            { label: 'Blend Ref. No', value: blendInfo.blendRefNo },
            { label: 'Customer Name', value: blendInfo.customerName },
            { label: 'Blend Date', value: blendInfo.blendDate },
            {
              label: 'Total Contract Qty',
              value: blendInfo.export_quantity.toLocaleString(),
            },
          ]

          // Right column labels and values
          const rightColumnData = [
            {
              label: 'Blend Average',
              value: blendInfo.averagePrice.toLocaleString(),
            },
            { label: 'RT No', value: blendInfo.rtNo },
            { label: 'Status', value: blendInfo.status },
            {
              label: 'Blend Standard Description',
              value: blendInfo.blendStandard,
            },
          ]

          // Helper function to draw a label, colon, and value with consistent alignment
          interface LabelValueDrawParams {
            label: string
            value: string | number
            x: number
            y: number
          }

          const drawAlignedLabelAndValue = ({
            label,
            value,
            x,
            y,
          }: LabelValueDrawParams): void => {
            const labelText = `${label}`
            doc.setFont('Calibri', 'bold')
            doc.text(labelText, x, y, { align: 'right' }) // Draw the label

            // Draw the colon at a fixed position
            const colonX = x + labelWidth
            doc.text(':', colonX, y)

            // Draw the value after the colon
            doc.setFont('Calibri', 'bold')
            doc.text(value.toString(), colonX + colonWidth, y)
          }

          // Draw left column
          leftColumnData.forEach((item, index) => {
            const y = blendInfoStartY + index * blendInfoGap // Calculate Y position for each row
            drawAlignedLabelAndValue({
              label: item.label,
              value: item.value,
              x: leftColumnX,
              y,
            })
          })

          // Draw right column
          rightColumnData.forEach((item, index) => {
            const y = blendInfoStartY + index * blendInfoGap // Calculate Y position for each row
            drawAlignedLabelAndValue({
              label: item.label,
              value: item.value,
              x: rightColumnX,
              y,
            })
          })
        }
      }

      doc.setProperties({
        title: 'Tea Allocation Report',
      })

      // Use a custom startY to control first page layout
      const firstPageStartY = 225
      // Add first page header manually
      addFirstPageHeader(doc)

      // Calculate total column widths
      const totalColumnWidth = columns.reduce(
        (sum, col) => sum + (col.width || 0),
        0,
      )
      const availableWidth = pageWidth - 2 * margin
      const scaleFactor = availableWidth / totalColumnWidth

      // Adjust column widths proportionally
      const scaledColumns = columns.map((col) => ({
        ...col,
        width: col.width * scaleFactor,
      }))

      // Generate table with full-width layout
      BlendTable(doc, tableData, scaledColumns, pageWidth, margin, pageHeight)
      doc.addPage()
      ContractTable(doc, columns2, data)

      doc.setTextColor(255, 0, 0) // Set text color to red
      doc.text(
        'There is a mismatch with the allocated packages and allocated Qty in KGs.',
        40,
        pageHeight - 350,
      )
      doc.text(
        'Therefore, please recheck this blend sheet before placing your signatures on the same.',
        40,
        pageHeight - 335,
      )
      doc.setTextColor(0, 0, 0)
      finalSignatures(doc, pageHeight - 300)

      const totalPages = doc.getNumberOfPages() // Get total number of pages
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i) // Set the current page to add the page number
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text(
          `Page No : Page ${i} of ${totalPages}`,
          pageWidth - margin,
          80,
          {
            align: 'right',
          },
        )
      }
      doc.save(`tea-allocations_${dateGenerated}_${timeGenerated}.pdf`)
    }
  }

  //--------------------------------------------------------------------------------------------------------------------------------
  // Function to generate the table with the blend allocations
  const BlendTable = (
    doc: jsPDF,
    tableData: TableRowData[],
    columns: any[],
    pageWidth: number,
    margin: number,
    pageHeight: number,
  ) => {
    const scaledColumns = columns.map((col) => ({
      ...col,
      width:
        (col.width * (pageWidth - 2 * margin)) /
        columns.reduce((sum, col) => sum + (col.width || 0), 0),
    }))

    doc.autoTable({
      head: [scaledColumns.map((col) => col.title)],
      body: tableData.map((row) =>
        scaledColumns.map((col) => row[col.dataKey as keyof TableRowData]),
      ),
      theme: 'plain', // Clean layout
      startY: 180,
      tableWidth: pageWidth - 3 * margin,
      margin: { left: margin, right: margin },

      styles: {
        fontSize: 6,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }, // Increased padding
        lineWidth: 0, // No body row lines
      },
      headStyles: getHeadStyles(),
      bodyStyles: {
        fillColor: false, // White background for a clean look
        textColor: [0, 0, 0],
        fontSize: 8,
      },
      columnStyles: Object.fromEntries(
        scaledColumns.map((col, index) => [
          index,
          {
            cellWidth: col.width || 'auto', // Dynamically fit content
            halign: col.title.includes('\n') ? 'center' : 'left', // Center-align for multi-line headers
          },
        ]),
      ),

      willDrawCell: function (data) {
        // Check if it's the totals row
        if (
          data.row.section === 'body' &&
          data.row.index === tableData.length - 1
        ) {
          data.cell.styles.fontStyle = 'bold' // Bold totals
          data.cell.styles.fontSize = 10 // Slightly larger font for totals
          // Apply only top and bottom borders for totals row cells
          data.cell.styles.lineWidth = {
            top: 0.5,
            bottom: 0.5,
            left: 0,
            right: 0,
          }
          data.cell.styles.lineColor = [0, 0, 0] // Black line for emphasis
        }

        // Right-align numeric values
        if (data.column.index >= 9 && data.column.index <= 13) {
          data.cell.styles.halign = 'right'
        }
      },
    })
  }

  const ContractTable = (doc: jsPDF, columns: any[], data: any[]) => {
    // Main table
    autoTable(doc, {
      head: [columns.map((col) => col.header)],
      theme: 'plain',
      body: data.map((row) =>
        columns.map((col) => row[col.dataKey as keyof typeof row] || ''),
      ),
      startY: 40, // Space after heading
      tableWidth: 'auto',
      styles: {
        fontSize: 6,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }, // Increased padding
        lineWidth: 0, // No body row lines
      },
      headStyles: getHeadStyles(),
      bodyStyles: {
        fillColor: false, // White background for a clean look
        textColor: [0, 0, 0],
        fontSize: 8,
      },
      margin: { left: 40 }, // Keep some free space after table head
    })

    // Get the Y-coordinate where the previous table ended
    const finalY = (doc as any).autoTable.previous.finalY || 30 // Default to 30 if no table exists

    // Add header for "Summary of Grades"
    doc.setFont('helvetica', 'bold', 'underline')
    doc.setFontSize(10)
    doc.text('Summary of Grades', 105, finalY + 10, { align: 'center' })

    // Define columns for "Summary of Grades"
    const gradeColumns = [
      { header: 'Grade Desc', dataKey: 'grade_desc' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Percentage', dataKey: 'percentage' },
    ]

    // Define data for "Summary of Grades"
    const gradeData = [
      { grade_desc: 'SILVER TIPS', quantity: '3.57', percentage: '12.00' },
      { grade_desc: 'LEAF TEA', quantity: '26.15', percentage: '88.00' },
      { grade_desc: 'Total', quantity: '29.72', percentage: '100.00' },
    ]

    // Add "Summary of Grades" table
    autoTable(doc, {
      head: [gradeColumns.map((col) => col.header)],
      body: gradeData.map((row) =>
        gradeColumns.map((col) => row[col.dataKey as keyof typeof row] || ''),
      ),
      startY: finalY + 20, // Position table below the header
      tableWidth: 'auto', // Table width adjusts to content
      theme: 'plain',
      styles: {
        fontSize: 6,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }, // Increased padding
        lineWidth: 0, // No body row lines
      },
      headStyles: getHeadStyles(),
      bodyStyles: {
        fillColor: false, // White background for a clean look
        textColor: [0, 0, 0],
        fontSize: 8,
      },
      margin: { left: 40 }, // Center align the smaller table by adjusting margin
    })

    // Add disclaimer text and signature lines
    const newY = (doc as any).autoTable.previous.finalY + 20
  }
  const finalSignatures = (doc: jsPDF, newY: number) => {
    // Set default font and size
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    // Add the disclaimer text with better formatting

    // Density placeholders
    const densityY = newY + 20 // Starting position for density section
    doc.setFontSize(9)
    doc.text('Density (100 Grm, Free Fall):', 10, densityY)
    doc.text('______ CC', 60, densityY)
    doc.text('______ CC', 110, densityY)
    doc.text('______ CC', 160, densityY)

    // Approval section headers
    const approvalY = densityY + 20
    doc.setFontSize(8)
    doc.text('Hand blend approved by', 10, approvalY)
    doc.text('Prop sample approved by', 70, approvalY)
    doc.text('Final blend approved by', 140, approvalY)

    // Approval signature lines
    const signatureY = approvalY + 10
    doc.text('________________________', 10, signatureY)
    doc.text('_________________________', 70, signatureY)
    doc.text('_________________________', 140, signatureY)

    // Signature labels
    const signatureLabelY = signatureY + 5
    doc.text('Signature', 20, signatureLabelY)
    doc.text('Signature', 90, signatureLabelY)
    doc.text('Signature', 160, signatureLabelY)

    // Prepared by, checked by, and date-time section
    const footerY = signatureLabelY + 20
    doc.setFontSize(9)
    doc.text('Prepared By:', 10, footerY)
    doc.text('_______________________', 35, footerY)

    doc.text('Checked By:', 70, footerY)
    doc.text('_______________________', 95, footerY)

    doc.text('Date:', 140, footerY)
    doc.text('___________', 155, footerY)

    doc.text('Time:', 170, footerY)
    doc.text('___________', 185, footerY)
  }

  return (
    <Button onClick={generateReport} className="bg-blue-600 text-white">
      Download Report
    </Button>
  )
}

export default DownloadReportButton

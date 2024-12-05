import React from 'react'
import { Button } from '@/components/ui/button'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import autoTable, { HAlignType } from 'jspdf-autotable'
import { UserOptions } from 'jspdf-autotable'
import { Console } from 'console'

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
    broker: string
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

const font = 'Helvetica'
const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({
  tabulatorRef,
  blendInfo,
}) => {
  const generateReport = () => {
    if (tabulatorRef.current) {
      // const formatBrokerName = (brokerName: string) => {
      //   const nameParts = brokerName.split(/\s+/)
      //   return nameParts.length > 1
      //     ? nameParts.map((part) => part[0]).join('')
      //     : brokerName.length > 10
      //       ? brokerName.slice(0, 10) + '.'
      //       : brokerName
      // }

      const formatBoxNumber = (boxNumber: string) => {
        return boxNumber.length > 10 ? boxNumber.slice(-10) : boxNumber
      }
      const formatDate = (date: string) => {
        const months = [
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
        if (!date) return ''
        const [dateStr] = date.split(' ') // Split at space to remove time
        const [year, month, day] = dateStr.split('-')
        return `${day}-${months[parseInt(month) - 1]}-${year}`
      }
      const formatRcd = (rcd: boolean) => {
        return rcd === true ? 'Y' : 'N'
      }
      const tableData: TableRowData[] = tabulatorRef.current
        .getData()
        .map((row: any) => {
          const quantity = row.quantity_kgs || 0
          const unitCost = row.unit_cost || 0
          const value = quantity * unitCost

          return {
            'Box Number': formatBoxNumber(row.box_number || ''),
            'Sale/Blend Date': '16/04/2024',
            'Sale No': '2024/IM/0003',
            Rcd: formatRcd(row.rcd),
            Broker: row.broker || '',
            'Garden Mark': row.garden_mark || '',
            Standard: row.standard || '',
            'Inv No': row.invoice_no || '',
            'Lot No': row.lot_no || '',
            Grade: row.grade || '',
            'Purchased Price': unitCost,
            'Quantity (Kg)': quantity,
            'Allocated Packages': row.quantity_packages || 0,
            'Value (Rs)': parseFloat(value.toFixed(2)),
            'Last Ammend Date': formatDate(row.last_ammedned_date),
            'Prop Sample': row.prop_sample_in_grams,
            'Purchased Date': formatDate(row.purchased_date),
            'Net Weight': row.net_weight,
          }
        })

      const doc = new jsPDF({
        orientation: 'landscape',
        format: 'a4',
        unit: 'pt',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 10

      const columns = [
        { title: 'Broker', dataKey: 'Broker', width: 40 },
        { title: 'Lot No', dataKey: 'Lot No', width: 40 },
        { title: 'Box/Blend\nNumber', dataKey: 'Box Number', width: 55 },
        { title: 'Purchased\nDate', dataKey: 'Purchased Date', width: 60 },
        { title: 'Sale No', dataKey: 'Sale No', width: 40 },
        { title: 'Inv No', dataKey: 'Inv No', width: 40 },
        {
          title: 'Garden Mark',
          dataKey: 'Garden Mark',
          width: 80,
          styles: { cellWidth: 'wrap', fontSize: 10 },
        },
        { title: 'Grade', dataKey: 'Grade', width: 40 },
        { title: 'No/\nPkgs', dataKey: 'Allocated Packages', width: 30 },
        { title: 'Weight\n(Kg)', dataKey: 'Net Weight', width: 45 },
        { title: 'Net Qty\n(Kg)', dataKey: 'Quantity (Kg)', width: 45 },
        { title: 'Price\n(Rs)', dataKey: 'Purchased Price', width: 45 },
        { title: 'Value(Rs)', dataKey: 'Value (Rs)', width: 65 },
        { title: 'Rcd', dataKey: 'Rcd', width: 30 },
        { title: 'Prop\nSamp', dataKey: 'Prop Sample', width: 45 },
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

      tableData.push(totalsRow)

      const addFirstPageHeader = (doc: jsPDF) => {
        doc.setFont(font, 'bold')
        doc.setFontSize(16)
        doc.text('TEA TANG(PVT) LTD', pageWidth / 2, 50, { align: 'center' })

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
        doc.text(
          `${type} Blend Sheet as at ${formattedDate}- ${modal}`,
          pageWidth / 2,
          80,
          { align: 'center' },
        )

        if (blendInfo) {
          doc.setFontSize(10)
          const blendInfoStartY = 100
          const blendInfoGap = 20
          const leftColumnX = Math.floor(pageWidth * 0.2)
          const rightColumnX = Math.floor(pageWidth * 0.7)
          const labelWidth = 10
          const colonWidth = 10
          const valueStartX = leftColumnX + labelWidth + colonWidth

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

          const rightColumnData = [
            {
              label: 'Blend Average',
              value: parseFloat(
                blendInfo.averagePrice.toLocaleString(),
              ).toFixed(2),
            },
            { label: 'RT No', value: blendInfo.rtNo },
            { label: 'Status', value: blendInfo.status },
            {
              label: 'Blend Standard Description',
              value: blendInfo.blendStandard,
            },
          ]

          interface LabelValueDrawParams {
            label: string
            value: string
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
            doc.setFont(font, 'bold')
            doc.text(labelText, x, y, { align: 'right' })
            const colonX = x + labelWidth
            doc.text(':', colonX, y)
            doc.setFont(font, 'bold')
            doc.text(value.toString(), colonX + colonWidth, y)
          }

          leftColumnData.forEach((item, index) => {
            const y = blendInfoStartY + index * blendInfoGap
            drawAlignedLabelAndValue({
              label: item.label,
              value: item.value,
              x: leftColumnX,
              y,
            })
          })

          rightColumnData.forEach((item, index) => {
            const y = blendInfoStartY + index * blendInfoGap
            drawAlignedLabelAndValue({
              label: item.label,
              value: item.value,
              x: rightColumnX,
              y,
            })
          })
        }
      }

      doc.setProperties({ title: 'Tea Allocation Report' })
      addFirstPageHeader(doc)

      const totalColumnWidth = columns.reduce(
        (sum, col) => sum + (col.width || 0),
        0,
      )
      const availableWidth = pageWidth - 2 * margin
      const scaleFactor = availableWidth / totalColumnWidth

      const scaledColumns = columns.map((col) => ({
        ...col,
        width: col.width * scaleFactor,
      }))

      const { grandTotal, blendBalance, packingAvg, straightLineAvg } =
        BlendTable(doc, tableData, scaledColumns, pageWidth, margin, pageHeight)

      let finalY = (doc as any).autoTable.previous.finalY || 30
      const requiredSpace = 120
      if (finalY + requiredSpace > pageHeight - margin) {
        doc.addPage()
        finalY = margin + 20
      }

      doc.setFontSize(8)
      doc.setLineWidth(0.5)

      doc.line(
        pageWidth - margin - 240,
        finalY + 20,
        pageWidth - margin - 100,
        finalY + 20,
      )
      doc.setFont(font, 'bold')
      doc.text(
        `Grand Total of the Blend`,
        pageWidth - margin - 380,
        finalY + 35,
        { align: 'left' },
      )
      doc.text(`${grandTotal}`, pageWidth - margin - 150, finalY + 35, {
        align: 'right',
      })
      doc.line(
        pageWidth - margin - 380,
        finalY + 40,
        pageWidth - margin - 65,
        finalY + 40,
      )

      doc.text(`Contract Qty`, pageWidth - margin - 380, finalY + 50, {
        align: 'left',
      })
      doc.text(`212123`, pageWidth - margin - 150, finalY + 50, {
        align: 'right',
      })
      doc.line(
        pageWidth - margin - 240,
        finalY + 55,
        pageWidth - margin - 65,
        finalY + 55,
      )

      doc.text(`Blend Balance: `, pageWidth - margin - 380, finalY + 65, {
        align: 'left',
      })
      doc.text(`${blendBalance}`, pageWidth - margin - 150, finalY + 65, {
        align: 'right',
      })
      doc.line(
        pageWidth - margin - 240,
        finalY + 70,
        pageWidth - margin - 65,
        finalY + 70,
      )

      doc.text(`Packing Avg: `, pageWidth - margin - 380, finalY + 80, {
        align: 'left',
      })
      doc.text(`${packingAvg}`, pageWidth - margin - 150, finalY + 85, {
        align: 'right',
      })
      doc.line(
        pageWidth - margin - 240,
        finalY + 85,
        pageWidth - margin - 65,
        finalY + 85,
      )

      doc.text(`Straight Line Avg: `, pageWidth - margin - 380, finalY + 95, {
        align: 'left',
      })
      doc.text(`${straightLineAvg}`, pageWidth - margin - 150, finalY + 95, {
        align: 'right',
      })
      doc.line(
        pageWidth - margin - 380,
        finalY + 100,
        pageWidth - margin - 65,
        finalY + 100,
      )

      let contractStartY = finalY + 140
      ContractTable(doc, columns2, data, contractStartY)
      const summaryTableFinalY = (doc as any).autoTable.previous.finalY + 20

      const spaceNeededForSignatures = 200
      const currentY = summaryTableFinalY
      const remainingSpace = pageHeight - currentY

      if (remainingSpace < spaceNeededForSignatures) {
        doc.addPage()
        finalSignatures(doc, 50, 40)
      } else {
        finalSignatures(doc, currentY, 40)
      }

      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont(font)
        doc.text(
          `Date: ${dateGenerated} ${timeGenerated}      Page No : Page ${i} of ${totalPages}`,
          pageWidth - margin,
          30,
          { align: 'right' },
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

    // Calculate the grand total of the blend
    const grandTotal =
      tableData.length > 0 ? tableData[tableData.length - 1]['Value (Rs)'] : 0

    // Calculate the blend balance
    const blendBalance =
      tableData.length > 0 ? tableData[tableData.length - 1]['Value (Rs)'] : 0

    // Calculate the packing average
    const packingAvg = grandTotal / tableData.length

    // Calculate the straight line average
    const straightLineAvg = grandTotal / tableData.length

    doc.autoTable({
      head: [scaledColumns.map((col) => col.title)],
      body: tableData.map((row) =>
        scaledColumns.map((col) => row[col.dataKey as keyof TableRowData]),
      ),
      theme: 'plain', // Clean layout

      startY: 200,
      tableWidth: pageWidth - 3 * margin,
      margin: { left: margin, right: margin },

      styles: {
        fontSize: 6,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }, // Increased padding
        lineWidth: 0, // No body row lines
        font: font,
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

    // Return the calculated values
    return {
      grandTotal,
      blendBalance,
      packingAvg,
      straightLineAvg,
    }
  }
  const ContractTable = (
    doc: jsPDF,
    columns: any[],
    data: any[],
    startY: number,
  ) => {
    // Main table
    autoTable(doc, {
      head: [columns.map((col) => col.header)],
      theme: 'plain',
      body: data.map((row) =>
        columns.map((col) => row[col.dataKey as keyof typeof row] || ''),
      ),

      startY: startY, // Use the provided startY parameter
      tableWidth: 'auto',
      styles: {
        fontSize: 6,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }, // Increased padding
        lineWidth: 0, // No body row lines
        font: font,
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
    doc.setFont(font, 'underline')
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
      { grade_desc: 'Total', quantity: '29.72', percentage: '100.00' },
      { grade_desc: 'Total', quantity: '29.72', percentage: '100.00' },
      { grade_desc: 'Total', quantity: '29.72', percentage: '100.00' },
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
        font: font,
      },
      headStyles: getHeadStyles(),
      bodyStyles: {
        fillColor: false, // White background for a clean look
        textColor: [0, 0, 0],
        fontSize: 8,
      },
      margin: { left: 40 }, // Center align the smaller table by adjusting margin
    })

    // Get final Y position after summary grades table

    // Add disclaimer text and signature lines after summary table
  }

  const finalSignatures = (doc: jsPDF, startY: number, marginValue: number) => {
    // Set font and size for the document
    doc.setFont(font, 'bold')
    doc.setFontSize(8)

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = marginValue + 20
    // Add red disclaimer text
    doc.setFontSize(9)
    doc.setFont(font, 'bold')
    doc.setTextColor(255, 0, 0)
    doc.text(
      'There is a mismatch with the allocated packages and allocated Qty in KGs,Therefore, please recheck this blend sheet before placing your\nsignatures on the same.',
      40,
      startY,
    )

    doc.setTextColor(0, 0, 0)
    // "Density" placeholders starting after disclaimer
    const densityY = startY + 40

    doc.text(
      'Density100 Grm, Free Fall ______  CC \n Hand blend approved by',
      225 + margin,
      densityY,
    )
    doc.text(
      'Density100 Grm, Free Fall ______  CC \n Hand blend approved by',
      395 + margin,
      densityY,
    )
    doc.text(
      'Density100 Grm, Free Fall ______  CC \n Hand blend approved by',
      pageWidth - 285 + margin,
      densityY,
    )

    // Rest of signature sections adjusted based on new densityY
    const approvalY = densityY + 35
    doc.text('______________________________', 225 + margin, approvalY)
    doc.text('______________________________', 395 + margin, approvalY)
    doc.text(
      '______________________________',
      pageWidth - 285 + margin,
      approvalY,
    )

    doc.text('Signature', 260 + margin, approvalY + 15)
    doc.text('Signature', 430 + margin, approvalY + 15)
    doc.text('Signature', pageWidth - 240 + margin, approvalY + 15)

    doc.text('Date:___________Time___________', 225 + margin, approvalY + 35)
    doc.text('Date:___________Time___________', 395 + margin, approvalY + 35)
    doc.text(
      'Date:___________Time___________',
      pageWidth - 285 + margin,
      approvalY + 35,
    )

    const footerY = approvalY + 60

    doc.setFontSize(9)

    doc.text('Prepared By:', margin, footerY - 10)
    doc.text('_________________    ', margin, footerY - 30)

    doc.text('Checked By:', margin + 120, footerY - 10, { align: 'left' })
    doc.text('________________', margin + 120, footerY - 30)
  }
  return (
    <Button onClick={generateReport} className="bg-blue-600 text-white">
      Download Report
    </Button>
  )
}

export default DownloadReportButton

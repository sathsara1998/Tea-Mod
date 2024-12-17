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
  'Value (Rs)': string
  'Line Type'?: string
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
  fontSize: 9,
  fontStyle: 'italic' as const,
  halign: 'center' as const, // Center-aligned headers
  valign: 'middle' as const, // Vertically centered
  cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
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
      const formatValueWithCommas = (value: number) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
      const tableData: TableRowData[] = tabulatorRef.current
        .getData()
        .map((row: any) => {
          const quantity = row.quantity_kgs || 0
          const unitCost = row.unit_cost || 0
          const value = quantity * unitCost
          // console.log('Row Data:', {
          //   boxNumber: row.box_number,
          //   saleCode: row.sale_code,
          //   rcd: row.rcd,
          //   brokerName: row.broker_name,
          //   gardenMark: row.garden_mark,
          //   standard: row.standard,
          //   invoiceNo: row.invoice_no,
          //   lotNo: row.lot_no,
          //   grade: row.grade,
          //   unitCost: row.unit_cost,
          //   quantityKgs: row.quantity_kgs,
          //   quantityPackages: row.quantity_packages,
          //   value: value,
          //   lastAmendDate: row.last_ammedned_date,
          //   propSample: row.prop_sample_in_grams,
          //   purchasedDate: row.purchased_date,
          //   netWeight: row.net_weight,
          // })
          return {
            'Box Number': formatBoxNumber(row.box_number || ''),
            'Sale No': row.sale_code,
            Rcd: formatRcd(row.rcd),
            Broker: row.broker_name || '',
            'Garden Mark': row.garden_mark || '',
            Standard: row.standard || '',
            'Inv No': row.invoice_no || '',
            'Lot No': row.lot_no || '',
            Grade: row.grade || '',
            'Purchased Price': formatValueWithCommas(unitCost.toFixed(2)),
            'Quantity (Kg)': quantity,
            'Allocated Packages': row.quantity_packages || 0,
            'Value (Rs)': formatValueWithCommas(parseFloat(value.toFixed(2))),
            'Last Ammend Date': formatDate(row.last_ammedned_date),
            'Prop Sample': row.prop_sample_in_grams,
            'Purchased Date': formatDate(row.purchased_date),
            'Net Weight': row.net_weight,
            'Line Type': row.type,
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
        (sum, row) => sum + parseFloat(row['Value (Rs)'].replace(/,/g, '')),
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
        'Value (Rs)': formatValueWithCommas(parseFloat(totalValue.toFixed(2))),
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

            { label: 'Customer Name', value: blendInfo.customerName },
            { label: 'Blend Date', value: blendInfo.blendDate },
            {
              label: 'Total Contract Qty',
              value: parseFloat(
                blendInfo.export_quantity.toLocaleString(),
              ).toFixed(2),
            },
          ]

          const rightColumnData = [
            {
              label: 'Blend Average',
              value: blendInfo.averagePrice.toFixed(3),
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
      // First, filter and create separate data sets
      const blendBalanceData = tableData.filter(
        (row) => row['Line Type'] === 'blend_balance',
      )
      const straightLineData = tableData.filter(
        (row) => row['Line Type'] !== 'blend_balance',
      )

      // Generate main table with straight line data first
      const { grandTotal, blendBalance, packingAvg, straightLineAvg } =
        BlendTable(
          doc,
          straightLineData,
          scaledColumns,
          pageWidth,
          margin,
          pageHeight,
        )

      // Get the Y position after the straight line table
      let currentY = (doc as any).autoTable.previous.finalY + 20

      // If we have blend balance data, add it to a new page or current page based on space
      if (blendBalanceData.length > 0) {
        const remainingSpace = pageHeight - currentY - 50 // 200 is buffer space
        const estimatedRowHeight = 30 // Approximate height per row
        const estimatedTableHeight =
          blendBalanceData.length * estimatedRowHeight + 50 // 50 for header

        // Add new page if not enough space
        if (estimatedTableHeight > remainingSpace) {
          doc.addPage()
          currentY = 50 // Reset Y position on new page
        }

        const tableColumns = [
          { title: 'Box Number', dataKey: 'Box Number', width: 60 },
          { title: 'Purchased Date', dataKey: 'Purchased Date', width: 60 },
          { title: 'Garden Mark', dataKey: 'Garden Mark', width: 80 },
          { title: 'Net Qty (Kg)', dataKey: 'Quantity (Kg)', width: 60 },
          { title: 'Rcd', dataKey: 'Rcd', width: 30 },
          { title: 'Prop Sample', dataKey: 'Prop Sample', width: 50 },
          { title: 'Last Ammend Date', dataKey: 'Last Ammend Date', width: 60 },
        ]

        // Add blend balance table header
        doc.setFont(font, 'bold')
        doc.setFontSize(10)
        doc.text('Blend Balance Details', margin, currentY + 10)

        doc.autoTable({
          head: [tableColumns.map((col) => col.title)],
          body: blendBalanceData.map((row) =>
            tableColumns.map(
              (col) => row[col.dataKey as keyof TableRowData] ?? '',
            ),
          ),
          startY: currentY + 20,
          theme: 'plain',
          margin: { left: margin },
          styles: {
            fontSize: 8,
            font: font,
            cellPadding: 2,
            fontStyle: 'bold',
          },
          headStyles: {
            ...getHeadStyles(),
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 60 },
            2: { cellWidth: 80 },
            3: { cellWidth: 60, halign: 'right' },
            4: { cellWidth: 30, halign: 'center' },
            5: { cellWidth: 50, halign: 'right' },
            6: { cellWidth: 60 },
          },
        })
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

    // Calculate the total value
    const grandTotal = tableData.reduce(
      (sum = 0, row) =>
        sum + (parseFloat(row['Value (Rs)'].replace(/,/g, '')) || 0),
      0,
    )
    // console.log(grandTotal)
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
        scaledColumns.map(
          (col) => row[col.dataKey as keyof TableRowData] ?? '',
        ),
      ),
      theme: 'plain', // Clean layout
      startY: 170,
      tableWidth: pageWidth - 3 * margin,
      margin: { left: margin, right: margin },

      styles: {
        fontSize: 6,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }, // Increased padding
        lineWidth: 0, // No body row lines
        font: font,
      },
      headStyles: { ...getHeadStyles() },
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
    <Button
      onClick={generateReport}
      aria-label="Download Report as PDF"
      className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-gray-100 disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3 sm:h-4 sm:w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
      </svg>
      <span className="text-xs sm:text-sm">Download Report</span>
    </Button>
  )
}

export default DownloadReportButton

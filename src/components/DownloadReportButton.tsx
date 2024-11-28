import React from 'react'
import { Button } from '@/components/ui/button'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { HAlignType } from 'jspdf-autotable'
import { UserOptions } from 'jspdf-autotable'

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
          'Inv No': row.invoice_no,
          'Lot No': row.lot_no,
          'Net Weight': row.net_weight,
          Grade: row.grade,
          'Purchased Price': row.unit_cost,
          'Quantity (Kg)': row.quantity_kgs,
          'Allocated Packages': row.quantity_packages,
        }))

      const columns = [
        { title: '#', dataKey: '#', align: 'left' },
        { title: 'Broker', dataKey: 'Broker', align: 'left' },
        { title: 'Lot No', dataKey: 'Lot No', align: 'left' },
        { title: 'Box/Blend\n Number', dataKey: 'Box Number', align: 'left' },
        { title: 'Sale/Blend\n Date', dataKey: 'Inv No', align: 'left' },
        { title: 'Sale No', dataKey: 'Inv No', align: 'left' },
        { title: 'Inv No', dataKey: 'Inv No', align: 'left' },
        { title: 'Garden Mark', dataKey: 'Garden Mark', align: 'left' },
        { title: 'Grade', dataKey: 'Grade', align: 'left' },
        {
          title: 'No Of\nPackages',
          dataKey: 'Allocated Packages',
          align: 'right',
        },
        { title: 'Weight(Kg)', dataKey: 'Net Weight', align: 'right' },
        { title: 'Net Qty(Kg)', dataKey: 'Quantity (Kg)', align: 'right' },
        { title: 'Price(Rs)', dataKey: 'Purchased Price', align: 'right' },
        { title: 'Value(Rs)', dataKey: 'Purchased Price', align: 'right' },
        { title: 'Rcd', dataKey: 'Purchased Price', align: 'center' },
        { title: 'Prop\nSample', dataKey: 'Purchased Price', align: 'center' },
        {
          title: 'Last\nAmmend\nDate',
          dataKey: 'Purchased Price',
          align: 'center',
        },
      ]

      const doc = new jsPDF({
        orientation: 'landscape',
        format: 'a4',
        unit: 'pt',
      })

      const now = new Date()
      const dateGenerated = now.toLocaleDateString()
      const timeGenerated = now.toLocaleTimeString()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 40

      // Adjusted column widths to fit landscape
      const columnWidths = {
        '#': 20,
        Broker: 65,
        'Lot No': 45,
        'Box/Blend Number': 55,
        'Sale/Blend Date': 55,
        'Sale No': 40,
        'Inv No': 40,
        'Garden Mark': 65,
        Grade: 40,
        'No Of Packages': 45,
        'Weight(Kg)': 45,
        'Net Qty(Kg)': 45,
        'Price(Rs)': 45,
        'Value(Rs)': 55,
        Rcd: 30,
        'Prop Sample': 35,
        'Last Ammend Date': 55,
      }

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
        doc.text(
          `${type} Blend Sheet as at ${formattedDate}- ${modal}`,
          pageWidth / 2,
          80,
          { align: 'center' },
        )

        if (blendInfo) {
          doc.setFontSize(10)
          const blendInfoStartY = 120
          const blendInfoGap = 20
          const leftColumnX = Math.floor(pageWidth * 0.1)
          const rightColumnX = Math.floor(pageWidth * 0.6)

          const blendInfoDetails = [
            [
              `Blend No: ${blendInfo.blendNo}`,
              `Blend Date: ${blendInfo.blendDate}`,
            ],
            [
              `Blend Ref. No: ${blendInfo.blendRefNo}`,
              `Total Contract Qty: ${blendInfo.export_quantity}`,
            ],
            [
              `Customer: ${blendInfo.customerName}`,
              `Blend Standard: ${blendInfo.blendStandard}`,
            ],
            [
              `Status: ${blendInfo.status}`,
              `Blend Average: ${blendInfo.averagePrice}`,
            ],
            [null, `RT No: ${blendInfo.rtNo}`],
          ]

          blendInfoDetails.forEach((row, index) => {
            doc.text(
              row[0] || '',
              leftColumnX,
              blendInfoStartY + index * blendInfoGap,
            )
            if (row[1]) {
              doc.text(
                row[1],
                rightColumnX,
                blendInfoStartY + index * blendInfoGap,
              )
            }
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

      // Generate table
      doc.autoTable({
        head: [columns.map((col) => col.title)],
        body: tableData.map((row) =>
          columns.map((col) => row[col.dataKey as keyof TableRowData]),
        ),
        startY: firstPageStartY,
        styles: {
          fontSize: 8,
          cellPadding: { top: 2.5, right: 1.5, bottom: 1.5, left: 1.5 },
          lineWidth: 0,
        },
        headStyles: {
          fillColor: false,
          textColor: [0, 0, 0],
          fontSize: 8,
          cellPadding: { top: 1, right: 1, bottom: 1, left: 1 },
          fontStyle: 'bold',
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          halign: 'center',
        },
        margin: { top: 40, left: margin, right: margin },
        didDrawPage: function (data) {
          doc.setFontSize(8)
          doc.text(
            `Page ${data.pageNumber}`,
            pageWidth - margin,
            doc.internal.pageSize.getHeight() - 20,
            { align: 'right' },
          )
        },
        willDrawCell: function (data) {
          if (
            data.row.section === 'body' &&
            data.row.index === tableData.length - 1
          ) {
            data.cell.styles.fontStyle = 'bold'
          }
          if (
            data.column.index >= 9 &&
            data.column.index <= 11 &&
            data.row.section === 'body'
          ) {
            data.cell.styles.halign = 'center'
          }
          if (
            data.column.index >= 11 &&
            data.column.index <= 13 &&
            data.row.section === 'body'
          ) {
            data.cell.styles.halign = 'right'
          }
        },
        tableWidth: pageWidth - 2 * margin,
        theme: 'plain',
        columnStyles: {
          ...Object.fromEntries(
            Object.entries(columnWidths).map(([key, width], index) => [
              index,
              {
                halign: columns[index].align as HAlignType,
              },
            ]),
          ),
        },
      })

      const finalY = (doc as any).lastAutoTable.finalY || 500
      doc.setFontSize(8)
      doc.setFont('Calibri', 'bold')

      const totalKgs = tableData.reduce(
        (sum, row) => sum + row['Quantity (Kg)'],
        0,
      )
      const totalWeight = tableData.reduce(
        (sum, row) => sum + row['Net Weight'],
        0,
      )
      const totalPackages = tableData.reduce(
        (sum, row) => sum + row['Allocated Packages'],
        0,
      )
      const totalValue = tableData.reduce(
        (sum, row) => sum + row['Purchased Price'] * row['Quantity (Kg)'],
        0,
      )

      const rightAlign = (text: string, x: number, y: number) => {
        const textWidth = doc.getStringUnitWidth(text) * 8
        doc.text(text, x - textWidth, y)
      }

      doc.setLineWidth(0.5)
      doc.line(
        pageWidth - margin - 300,
        finalY + 10,
        pageWidth - margin - 50,
        finalY + 10,
      )
      doc.line(
        pageWidth - margin - 300,
        finalY + 30,
        pageWidth - margin - 50,
        finalY + 30,
      )

      rightAlign(
        ` ${totalPackages.toLocaleString()}`,
        pageWidth - margin - 275,
        finalY + 25,
      )
      rightAlign(` ${totalWeight}`, pageWidth - margin - 230, finalY + 25)
      rightAlign(` ${totalKgs}`, pageWidth - margin - 160, finalY + 25)
      rightAlign(
        `${totalValue.toFixed(2)}`,
        pageWidth - margin - 80,
        finalY + 25,
      )

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

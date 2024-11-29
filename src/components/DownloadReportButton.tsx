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
        doc.text(
          `${type} Blend Sheet as at ${formattedDate}- ${modal}`,
          pageWidth / 2,
          80,
          { align: 'center' },
        )

        if (blendInfo) {
          doc.setFontSize(10)
          const blendInfoStartY = 105
          const blendInfoGap = 15
          const leftColumnX = Math.floor(pageWidth * 0.1) // Left column starts at 10%
          const rightColumnX = Math.floor(pageWidth * 0.5) // Right column starts at 50%

          // Left column labels
          const leftLabels = [
            'Blend No',
            'Blend Date',
            'Blend Ref. No',
            'Total Contract Qty',
            'Customer Name',
          ]

          // Right column labels
          const rightLabels = [
            'Blend Standard Description',
            'Blend Average',
            'RT No',
            'Status',
          ]

          // Left column values
          const leftValues = [
            blendInfo.blendNo,
            blendInfo.blendDate,
            blendInfo.blendRefNo,
            blendInfo.export_quantity.toLocaleString(),
            blendInfo.customerName,
          ]

          // Right column values
          const rightValues = [
            blendInfo.blendStandard,
            blendInfo.averagePrice.toLocaleString(),
            blendInfo.rtNo,
            blendInfo.status,
          ]

          // Draw left column
          leftLabels.forEach((label, index) => {
            doc.text(
              `${label}`,
              leftColumnX,
              blendInfoStartY + index * blendInfoGap,
            )
            doc.text(
              `: ${leftValues[index]}`,
              leftColumnX + 100,
              blendInfoStartY + index * blendInfoGap,
            )
          })

          // Draw right column
          rightLabels.forEach((label, index) => {
            doc.text(
              `${label}`,
              rightColumnX,
              blendInfoStartY + index * blendInfoGap,
            )
            doc.text(
              `: ${rightValues[index]}`,
              rightColumnX + 100,
              blendInfoStartY + index * blendInfoGap,
            )
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
      doc.autoTable({
        head: [scaledColumns.map((col) => col.title)],
        body: tableData.map((row) =>
          scaledColumns.map((col) => row[col.dataKey as keyof TableRowData]),
        ),
        theme: 'plain', // Clean layout
        startY: 180,
        tableWidth: pageWidth - 2 * margin,
        margin: { left: margin, right: margin },

        styles: {
          fontSize: 6,
          cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }, // Increased padding
          lineWidth: 0, // No body row lines
        },
        headStyles: {
          // Light gray background
          textColor: [0, 0, 0],
          fontSize: 8, // Slightly larger font for headers
          fontStyle: 'bold',
          halign: 'center', // Center-aligned headers
          valign: 'middle', // Vertically centered
          cellPadding: { top: 6, right: 8, bottom: 6, left: 8 }, // Generous padding for headers
          lineWidth: 1,
          lineColor: [0, 0, 0], // Subtle border for headers
        },
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
        didDrawPage: function (data) {
          // Footer with page number
          doc.setFontSize(8)
          doc.text(
            `Page ${data.pageNumber}`,
            pageWidth - margin,
            pageHeight - 20,
            { align: 'right' },
          )
        },
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

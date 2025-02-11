import React, { useEffect, useRef } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator_semanticui.min.css'
import { BlendInfo } from './types'
import { CardTitle } from './ui/card'

interface ContractDialogProps {
  blendInfo: BlendInfo
}

const ContractDialog: React.FC<ContractDialogProps> = ({ blendInfo }) => {
  const tableRef = useRef<HTMLDivElement>(null)
  const tableInstance = useRef<Tabulator>()

  // Flatten the nested allocations array
  const tableData = blendInfo.allocations?.flat() || []

  // Define columns for Tabulator
  const columns = [
    { title: 'Co No', field: 'sale_order' },
    { title: 'Co Line', field: 'component_id' },
    { title: 'FG Description', field: 'finished_product_name' },
    { title: 'Quantity (kg)', field: 'quantity' },
  ]

  useEffect(() => {
    if (tableRef.current) {
      tableInstance.current = new Tabulator(tableRef.current, {
        data: tableData,
        columns: columns,
        layout: 'fitColumns',
        responsiveLayout: 'hide',
        height: '400px',
      })
    }

    return () => {
      tableInstance.current?.destroy()
    }
  }, [tableData])

  return (
    <div>
      <CardTitle className="text-sm font-semibold text-foreground">
        Contract Details
      </CardTitle>
      <div ref={tableRef}></div>
    </div>
  )
}

export default ContractDialog

'use client'

import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import { useApiMethods } from '@/hooks/useApiMethods'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'
import { ArrowRight } from 'lucide-react'

const BlendView = () => {
  const { getBlends } = useApiMethods()
  const tableRef = useRef<Tabulator | null>(null)
  const tableContainerRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeTable = async () => {
      try {
        setIsLoading(true)
        const data = await getBlends()

        if (tableContainerRef.current && !tableRef.current) {
          tableRef.current = new Tabulator(tableContainerRef.current, {
            data,
            layout: 'fitColumns',
            responsiveLayout: 'collapse',
            pagination: true,
            paginationSize: 20,
            height: '70vh',
            columns: [
              {
                title: 'Name',
                field: 'name',
                sorter: 'string',
                headerFilter: true,
                widthGrow: 2,
              },
              {
                title: 'Allocated Quantity',
                field: 'allocated_quantity',
                hozAlign: 'right',
                sorter: 'number',
                formatter: 'money',
                formatterParams: { precision: 2, thousand: ',', symbol: '' },
                widthGrow: 1,
              },
              {
                title: 'Blend Standard',
                field: 'product_name',
                hozAlign: 'right',
                sorter: 'string',
                widthGrow: 2,
              },
              {
                title: 'Export Quantity',
                field: 'export_quantity',
                hozAlign: 'right',
                sorter: 'number',
                formatter: 'money',
                formatterParams: { precision: 2, thousand: ',', symbol: '' },
                widthGrow: 1,
              },
              {
                title: 'Status',
                field: 'status',
                sorter: 'string',
                headerFilter: 'list',
                headerFilterParams: {
                  values: {
                    '': 'All',
                    Draft: 'Draft',
                    in_progress: 'In Progress',
                    confirmed: 'Confirmed',
                    Done: 'Done',
                  },
                },
                widthGrow: 1,
              },
              {
                title: 'Balance to Allocate',
                field: 'to_allocate_quantity',
                hozAlign: 'right',
                sorter: 'number',
                formatter: 'money',
                formatterParams: { precision: 2, thousand: ',', symbol: '' },
                widthGrow: 1,
              },
              {
                title: 'Actions',
                formatter: (cell) => {
                  const container = document.createElement('div')
                  const button = document.createElement('button')
                  const iconContainer = document.createElement('div')

                  ReactDOM.render(<ArrowRight size={20} />, iconContainer)
                  button.appendChild(iconContainer)
                  container.appendChild(button)

                  button.addEventListener('click', () => {
                    const rowData = cell.getData()
                    window.location.href = `/allocate?id=${encodeURIComponent(rowData.name)}`
                  })

                  return container
                },
                hozAlign: 'center',
                width: 50,
              },
            ],
            initialSort: [{ column: 'name', dir: 'asc' }],
          })
        }
        setIsLoading(false)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error fetching blend data.',
        )
        setIsLoading(false)
      }
    }

    initializeTable()

    return () => {
      if (tableRef.current) {
        tableRef.current.destroy()
        tableRef.current = null
      }
    }
  }, [getBlends])

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Blend Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {error && <div>{error}</div>}
        <div ref={tableContainerRef} />
      </CardContent>
    </Card>
  )
}

export default BlendView

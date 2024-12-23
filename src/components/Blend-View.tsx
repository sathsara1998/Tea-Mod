'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator_semanticui.min.css'
import { ArrowRight } from 'lucide-react'
import { useApiMethods } from '@/hooks/useApiMethods'
import LoadingSpinner from './LoadingSpinner'

interface StatusType {
  status:
    | 'draft'
    | 'in_progress'
    | 'confirmed'
    | 'done'
    | string
    | null
    | undefined
}

const StatusBadge = ({ status }: { status: StatusType['status'] }) => {
  const getStatusStyles = (status: StatusType['status']): string => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-gray-200 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'done':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: StatusType['status']): string => {
    if (!status) return ''

    if (status.toLowerCase() === 'in_progress') {
      return 'In Progress'
    }

    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyles(
        status,
      )}`}
    >
      {formatStatus(status)}
    </span>
  )
}

const BlendView = () => {
  const { getBlends } = useApiMethods()
  const tableRef = useRef<Tabulator | null>(null)
  const tableContainerRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createActionButton = (cell: any) => {
    const container = document.createElement('div')
    const root = createRoot(container)

    const ActionButton = () => {
      const handleClick = () => {
        const rowData = cell.getData()
        window.location.href = `/allocate?id=${encodeURIComponent(rowData.name)}`
      }

      return (
        <button
          onClick={handleClick}
          className="transparent cursor-pointer border-none hover:bg-transparent"
        >
          <ArrowRight size={20} />
        </button>
      )
    }

    root.render(<ActionButton />)
    return container
  }

  useEffect(() => {
    const initializeTable = async () => {
      try {
        setIsLoading(true)
        const data = await getBlends()
        console.log(data)

        if (tableContainerRef.current && !tableRef.current) {
          tableRef.current = new Tabulator(tableContainerRef.current, {
            height: 'auto',
            layout: 'fitColumns',
            data,
            responsiveLayout: 'collapse',
            pagination: true,
            paginationSize: 20,
            columns: [
              {
                title: 'Name',
                field: 'name',
                sorter: 'string',
                headerFilter: true,
                headerFilterPlaceholder: 'Find By Blend Name',
                widthGrow: 2,
                headerSort: false,
              },
              {
                title: 'Customer Name',
                field: 'customer_name',
                sorter: 'string',
                widthGrow: 2,
                headerSort: false,
              },
              {
                title: 'Blend Standard',
                field: 'product_name',
                hozAlign: 'left',
                sorter: 'string',
                widthGrow: 3,
              },
              {
                title: 'Average Cost',
                field: 'average_cost',
                hozAlign: 'right',
                sorter: 'number',
                formatter: 'money',
                formatterParams: { precision: 2, thousand: ',', symbol: '' },
                widthGrow: 1,
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
                formatter: (cell) => {
                  const container = document.createElement('div')
                  const root = createRoot(container)
                  root.render(<StatusBadge status={cell.getValue()} />)
                  return container
                },
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
                formatter: createActionButton,
                hozAlign: 'center',
                width: 75,
              },
            ],
            initialSort: [{ column: 'name', dir: 'asc' }],
            rowFormatter: (row) => {
              const element = row.getElement()
              element.style.backgroundColor = ''
              element.style.color = '#333'
              element.style.borderBottom = ''
            },
          })

          const headerElement = tableContainerRef.current.querySelector(
            '.tabulator-header',
          ) as HTMLElement
          if (headerElement) {
            headerElement.style.backgroundColor = '#e8f1fe'
            headerElement.style.color = '#fff'
          }
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
        {isLoading && <LoadingSpinner />}
        {error && <div>{error}</div>}
        <div ref={tableContainerRef} />
      </CardContent>
    </Card>
  )
}

export default BlendView

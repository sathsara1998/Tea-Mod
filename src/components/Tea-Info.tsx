'use client'
import React, { useEffect } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'
import { TeaAllocation } from '@/components/types'
import { useToast } from '@/components/ui/use-toast'
import { useApiMethods } from '@/hooks/useApiMethods'

const TeaInfoTable: React.FC = () => {
  const tableRef = React.useRef<Tabulator | null>(null)
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()
  const apiMethods = useApiMethods()

  useEffect(() => {
    const initializeTable = async () => {
      try {
        setIsLoading(true)
        const data = await apiMethods.getAllAuctionData()
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
              { title: 'Standard', field: 'standard', headerFilter: true },
              { title: 'Blend Standard ID', field: 'blend_standard_id' },
              { title: 'Box Number', field: 'box_number' },
              { title: 'Net Weight', field: 'net_weight', hozAlign: 'right' },
              { title: 'Free Packages', field: 'free_packages' },
              { title: 'Garden Mark', field: 'garden_mark' },
              { title: 'Grade', field: 'grade' },
              {
                title: 'Purchased Price',
                field: 'purchased_price',
                hozAlign: 'right',
                formatter: 'money',
                formatterParams: { precision: 2, thousand: ',', symbol: '' },
              },
              { title: 'Status', field: 'status', headerFilter: true },
              { title: 'Buyer', field: 'buyer' },
              { title: 'Allocation Type', field: 'allocation_type' },
            ],
            initialSort: [{ column: 'standard', dir: 'asc' }],
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
          }
        }

        setIsLoading(false)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error fetching auction data'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
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
  }, [apiMethods.getAllAuctionData, toast])

  return (
    <div ref={tableContainerRef} className="tea-info-table h-full w-full" />
  )
}

export default TeaInfoTable

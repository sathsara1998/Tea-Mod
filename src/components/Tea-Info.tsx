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
            layout: 'fitData', // Changed to fitData to fit content
            data,
            // Changed to hide to prevent collapse
            pagination: true,
            paginationSize: 20,
            scrollToRowIfVisible: false,
            layoutColumnsOnNewData: true, // Adjusts columns based on new data
            columns: [
              {
                title: 'Box Number',
                field: 'box_number',
                headerFilter: true,
                frozen: true,
                widthGrow: 1,
              },
              {
                title: 'Standard',
                field: 'standard',
                headerFilter: true,
                frozen: true,
                widthGrow: 1,
              },
              {
                title: 'Blend Standard ID',
                field: 'blend_standard_id',
                headerFilter: true,
                frozen: true,
                widthGrow: 1,
              },

              {
                title: 'Net Weight',
                field: 'net_weight',
                hozAlign: 'right',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'Free Packages',
                field: 'free_packages',
                headerFilter: true,
                widthGrow: 0.5,
              },
              {
                title: 'Free Quantity',
                field: 'free_quantity',
                headerFilter: true,
                widthGrow: 0.5,
              },
              // {
              //   title: 'Status',
              //   field: 'status',
              //   headerFilter: true,
              //   widthGrow: 1,
              // },
              {
                title: 'Garden Mark',
                field: 'garden_mark',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'Grade',
                field: 'grade',
                headerFilter: true,
              },
              {
                title: 'Purchased Price',
                field: 'purchased_price',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'Break',
                field: 'break',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'Broker Name',
                field: 'broker_name',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'Lot NO',
                field: 'lot_no',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'Category',
                field: 'category',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'Auction Type',
                field: 'auction_type',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'Sale Code',
                field: 'sale_code',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'Buyer',
                field: 'buyer',
                headerFilter: true,
                widthGrow: 1,
              },
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

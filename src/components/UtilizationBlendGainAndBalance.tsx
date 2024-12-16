'use client'
import React, { useEffect, useState } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { useToast } from '@/components/ui/use-toast'
import { useApiMethods } from '@/hooks/useApiMethods'
import LoadingSpinner from './LoadingSpinner'
import TeaViewDialog from './TeaViewDialog'
type BlendGainTableProps = {
  value: string
}

function BlendBalanceTable({ value }: BlendGainTableProps): React.JSX.Element {
  const tableRef = React.useRef<Tabulator | null>(null)
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [cellData, setCellData] = useState(null) // To store data from the clicked cell
  const [isTeaDialogOpen, setIsTeaDialogOpen] = useState(false)

  const { toast } = useToast()
  const apiMethods = useApiMethods()
  useEffect(() => {
    const initializeTable = async () => {
      try {
        setIsLoading(true)
        const data = await apiMethods.getAllAuctionData()
        const straightLineData = data.filter(
          (item: { type: string }) => item.type === value,
        )

        if (tableContainerRef.current && !tableRef.current) {
          tableRef.current = new Tabulator(tableContainerRef.current, {
            height: 'auto',
            layout: 'fitData', // Changed to fitData to fit content
            data: straightLineData,
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
                headerFilterPlaceholder: 'Find By Box Number',
              },
              {
                title: 'Standard',
                field: 'standard',
                headerFilter: true,
                frozen: true,
                widthGrow: 1,
                headerFilterPlaceholder: 'Find By Standard',
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
                hozAlign: 'right',
                widthGrow: 0.5,
              },
              {
                title: 'Free Quantity',
                field: 'free_quantity',
                headerFilter: true,
                widthGrow: 0.5,
                hozAlign: 'right',
              },
              // {
              //   title: 'Status',
              //   field: 'status',
              //   headerFilter: true,
              //   widthGrow: 1,
              // },

              {
                title: 'Purchased Price',
                field: 'purchased_price',
                headerFilter: true,
                widthGrow: 1,
                hozAlign: 'right',
              },
              {
                title: 'Break',
                field: 'break',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'Blend Line Type',
                field: 'blend_line_type',
                headerFilter: true,
                widthGrow: 1,
              },

              {
                title: 'Broker ID',
                field: 'broker_id',
                headerFilter: true,
                widthGrow: 1,
                hozAlign: 'center',
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
                hozAlign: 'right',
              },
              {
                title: 'Source Type',
                field: 'source_type',
                headerFilter: true,
                widthGrow: 1,
                hozAlign: 'center',
              },
              {
                title: 'Allocation Type',
                field: 'allocation_type',
                headerFilter: true,
                widthGrow: 1,
                hozAlign: 'center',
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
          tableRef.current?.on('cellClick', (e, cell) => {
            if (cell.getColumn().getField() === 'box_number') {
              // Only trigger for the "name" column
              setCellData(cell.getValue())
              setIsTeaDialogOpen(true)
            }
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
    <div>
      {isLoading && <LoadingSpinner />}
      <div ref={tableContainerRef} className="tea-info-table h-full w-full" />
      <TeaViewDialog
        isTeaDialogOpen={isTeaDialogOpen}
        setIsTeaDialogOpen={setIsTeaDialogOpen}
        cellData={cellData}
      />
    </div>
  )
}

export default BlendBalanceTable

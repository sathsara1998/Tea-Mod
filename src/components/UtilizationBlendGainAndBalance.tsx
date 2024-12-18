'use client'
import React, { useEffect, useRef, useState } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { useToast } from '@/components/ui/use-toast'
import jsPDF from 'jspdf'
import { useApiMethods } from '@/hooks/useApiMethods'
import LoadingSpinner from './LoadingSpinner'
import TeaViewDialog from './TeaViewDialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Checkbox } from './ui/checkbox'
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
  const [isChecked, setIsChecked] = useState(false)

  const downloadButtonRef = useRef<HTMLButtonElement>(null)

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
            layout: 'fitColumns',
            data: straightLineData,

            // Changed to hide to prevent collapse
            pagination: true,
            paginationSize: 20,
            scrollToRowIfVisible: false,
            layoutColumnsOnNewData: true, // Adjusts columns based on new data
            columns: [
              {
                title: 'BOX NUMBER',
                field: 'box_number',
                headerFilter: true,
                frozen: true,
                widthGrow: 1,
                headerFilterPlaceholder: 'Find By Box Number',
              },
              {
                title: 'STANDARD',
                field: 'standard',
                headerFilter: true,
                frozen: true,
                widthGrow: 1,
                headerFilterPlaceholder: 'Find By Standard',
              },

              {
                title: 'NET WEIGHT',
                field: 'net_weight',
                hozAlign: 'right',
                headerFilter: true,
                widthGrow: 1,
              },

              {
                title: 'FREE QTY',
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
                title: 'AVG PRICE',
                field: 'purchased_price',
                headerFilter: true,
                widthGrow: 1,
                hozAlign: 'right',
              },

              {
                title: 'SOURCE TYPE',
                field: 'source_type',
                headerFilter: true,
                widthGrow: 1,
                hozAlign: 'center',
                formatter: function (cell) {
                  // Get the cell value and convert it to uppercase
                  return cell.getValue()?.toUpperCase()
                },
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
  const handleSearch = (field: string, value: string) => {
    if (tableRef.current) {
      tableRef.current.setFilter([
        {
          field: field,
          type: 'like',
          value: value,
        },
      ])
    }
  }

  const handleFreePackagesFilter = (checked: boolean) => {
    setIsChecked(checked)
    if (tableRef.current) {
      tableRef.current.setFilter([
        {
          field: 'freepackages',
          type: checked ? '=' : '!=',
          value: '0',
        },
      ])
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-center">
        <div className="relative flex w-96 items-center space-x-2">
          {/* Input Field */}
          <Input
            type="text"
            placeholder="Search by box number..."
            className="w-full"
            onChange={(e) => handleSearch('box_number', e.target.value)}
          />

          {/* Search Button */}
          <Button
            variant="outline"
            onClick={() => {
              const searchInput = document.querySelector(
                'input[type="text"]',
              ) as HTMLInputElement
              if (searchInput) {
                handleSearch('box_number', searchInput.value)
              }
            }}
          >
            Search
          </Button>

          {/* Free Packages Filter Button */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="freepackages-checkbox"
              checked={isChecked}
              onCheckedChange={(checked) =>
                handleFreePackagesFilter(checked as boolean)
              }
            />
            <label
              htmlFor="freepackages-checkbox"
              className="text-sm font-medium"
            >
              Free Pkgs(0)
            </label>
          </div>
        </div>
      </div>
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

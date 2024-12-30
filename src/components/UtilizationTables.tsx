'use client'
import React, { useEffect, useState } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { useToast } from '@/components/ui/use-toast'
import { useApiMethods } from '@/hooks/useApiMethods'
import LoadingSpinner from './LoadingSpinner'
import TeaViewDialog from './TeaViewDialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'

type BlendGainTableProps = {
  value: string
}

function StraightLineTable({ value }: BlendGainTableProps): React.JSX.Element {
  const tableRef = React.useRef<Tabulator | null>(null)
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [cellData, setCellData] = useState<{ id: number; type: string }>({
    id: 0,
    type: '',
  }) // To store data from the clicked cell
  const [isTeaDialogOpen, setIsTeaDialogOpen] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  const { toast } = useToast()
  const apiMethods = useApiMethods()
  useEffect(() => {
    const initializeTable = async () => {
      try {
        setIsLoading(true)
        const data = await apiMethods.getAllLotData()
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
                title: 'BOX NUMBER',
                field: 'box_number',
                headerFilter: true,
                frozen: true,
                widthGrow: 1,
                headerFilterPlaceholder: 'Find By Box Number',
                formatter: (cell) => {
                  const boxNumber = cell.getValue()

                  // Format the box number to ensure a maximum length of 10
                  const formatBoxNumber = (number: string) => {
                    return number.length > 10 ? number.slice(-10) : number
                  }

                  // Call the function and return the formatted box number
                  return formatBoxNumber(boxNumber)
                },
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
                title: 'FREE PKGS',
                field: 'free_packages',
                headerFilter: true,
                hozAlign: 'center',
              },
              {
                title: 'FREE QTY',
                field: 'free_quantity',
                headerFilter: true,
                hozAlign: 'center',
              },
              // {
              //   title: 'Status',
              //   field: 'status',
              //   headerFilter: true,
              //   widthGrow: 1,
              // },

              {
                title: 'LOT NO',
                field: 'lot_no',
                headerFilter: true,
                widthGrow: 1,
                hozAlign: 'right',
              },
              {
                title: 'GARDEN MARK',
                field: 'garden_mark',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'GRADE',
                field: 'grade',
                headerFilter: true,
              },

              {
                title: 'PURCHASED PRICE',
                field: 'purchased_price',
                headerFilter: true,
                widthGrow: 1,
                hozAlign: 'right',
              },
              {
                title: 'INVOICE ',
                field: 'invoice_no',
                headerFilter: true,
                widthGrow: 1,
                hozAlign: 'right',
              },
              {
                title: 'SALE CODE',
                field: 'sale_code',
                headerFilter: true,
                widthGrow: 1,
                hozAlign: 'center',
              },
              {
                title: 'NET WEIGHT',
                field: 'net_weight',
                hozAlign: 'center',
                headerFilter: true,
                widthGrow: 1,
              },

              {
                title: 'BREAK',
                field: 'break',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'BROKER NAME',
                field: 'broker_name',
                headerFilter: true,
                widthGrow: 1,
              },

              {
                title: 'CATEGORY',
                field: 'category',
                headerFilter: true,
                widthGrow: 1,
              },
              {
                title: 'AUCTION TYPE',
                field: 'auction_type',
                headerFilter: true,
                widthGrow: 1,
                hozAlign: 'center',
                formatter: function (cell) {
                  // Get the cell value and convert it to uppercase
                  return cell.getValue()?.toUpperCase()
                },
              },

              {
                title: 'BUYER',
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
          tableRef.current?.on('cellClick', (e, cell) => {
            if (cell.getColumn().getField() === 'box_number') {
              // Only trigger for the "name" column
              const rowData = cell.getRow().getData()
              setCellData({ id: rowData.id, type: rowData.type })
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
          field: 'free_packages',
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

export default StraightLineTable

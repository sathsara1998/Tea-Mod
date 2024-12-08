import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Info, Search } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator_semanticui.min.css'
import { generatePDF, generateTestData } from '@/lib/utils'
import BlendInformationSection from './BlendInformation'
import BlendList from './BlendList'
import AvailableTeaDialog from './AvailableTeaDialog'
import SelectBlendsDialog from './SelectBlendsDialog'
import { useApiMethods } from '@/hooks/useApiMethods'
import { useToast } from './ui/use-toast'
import {
  Blend,
  BlendInfo,
  TeaAllocation,
  Tea,
  ManufacturingAllocationTableData,
  TeaBlend,
  StockLot,
} from './types'
import AllocationDetailsDialog from './AllocationDetailsDialog'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import SplitTeaDialog from './AllocationViewComponents/SplitTeaDialog'
import TeaBlendReportButton from './TeaBlendReportButton'
import DownloadReportButton from './DownloadReportButton'
import TeaViewDialog from './TeaViewDialog'

interface Allocation {
  teaId: string
  quantity: number
  packages: number
}

interface SavingAllocation {
  id: number
  quantity_packages: number
  quantity_kgs: number
}

export default function AllocationTableView() {
  const [blend, setBlend] = useState<Blend>({
    id: 0,
    name: '',
    blendName: '',
    quantity: 0,
    status: 'draft',
    allocations: [],
  })
  const [allocations, setAllocations] = useState<
    ManufacturingAllocationTableData[]
  >([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBlendDialogOpen, setIsBlendDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [availableTeas, setAvailableTeas] = useState<Tea[]>([])
  const [selectedTeas, setSelectedTeas] = useState<Tea[]>([])
  const [selectedRowCount, setSelectedRowCount] = useState(0)
  const [selectedBlend, setSelectedBlend] = useState<TeaBlend>()
  const [isDraftBlend, setIsDraftBlend] = useState(true)
  const [isGenerateConfirmOpen, setIsGenerateConfirmOpen] = useState(false)
  const [blendDetails, setBlendDetails] = useState<StockLot>()
  const [isOpenPlit, setIsOpenPlit] = useState(false)
  const [cellData, setCellData] = useState(null) // To store data from the clicked cell
  const [isTeaDialogOpen, setIsTeaDialogOpen] = useState(false)

  const {
    getBlendById,
    updateAllocations,
    getLotInfoById,
    deleteManufactureAllocs,
    editPackageAllocation,
    blendConfirm,
  } = useApiMethods()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const allocationsTableRef = useRef(null)
  const blendsTableRef = useRef(null)
  const availableTeaTableRef = useRef(null)
  const tabulatorRef = useRef<Tabulator | null>(null)
  const updatedRows = useRef<number[]>([])
  const originalAllocations = useRef<ManufacturingAllocationTableData[]>([])
  const isInitialAllocations = useRef(true)
  const selectedIdsRef = useRef<number[]>([])

  useEffect(() => {
    if (allocationsTableRef.current) {
      const adjustedAllocations: ManufacturingAllocationTableData[] =
        allocations.map((item) => {
          return {
            ...item,
            init_quantity: item.quantity_packages,
          }
        })

      tabulatorRef.current = new Tabulator(allocationsTableRef.current, {
        height: '500px',
        layout: 'fitDataFill',
        reactiveData: true,
        data: adjustedAllocations,
        selectable: isDraftBlend,
        selectableRollingSelection: false,
        columns: [
          {
            title: 'Select',
            formatter: 'rowSelection',
            titleFormatter: 'rowSelection',
            hozAlign: 'center',
            headerSort: false,
          },
          { title: '#', formatter: 'rownum', hozAlign: 'left' },
          { title: 'Box Number', field: 'box_number', hozAlign: 'left' },
          { title: 'Broker', field: 'broker', hozAlign: 'left' },
          { title: 'Garden Mark', field: 'garden_mark', hozAlign: 'left' },
          { title: 'Standard', field: 'standard', hozAlign: 'left' },
          { title: 'Inv No', field: 'invoice_no', hozAlign: 'right' },
          { title: 'Lot No', field: 'lot_no', hozAlign: 'right' },
          { title: 'Net Weight', field: 'net_weight', hozAlign: 'right' },
          { title: 'Grade', field: 'grade', hozAlign: 'left' },
          {
            title: 'Cost',
            field: 'unit_cost',
            formatter: function (cell) {
              const value = cell.getValue()
              return value
                ? value.toLocaleString('en-US', {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                    useGrouping: true,
                  })
                : '0.0000'
            },
            hozAlign: 'right',
          },
          { title: 'Purchased QTY', field: 'purchased_qty', hozAlign: 'right' },

          {
            title: 'Quantity (Kg)',
            field: 'quantity_kgs',
            formatter: function (cell) {
              const value = cell.getValue()
              const element = cell.getElement()

              if (cell.getRow().getData().allocation_type === 'w') {
                element.style.backgroundColor = '#e8f1fe'
                element.style.border = '1px solid #bfd2e8'
                return value
                  ? value.toLocaleString('en-US', {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                      useGrouping: true,
                    })
                  : '0.0000'
              }
              return value
                ? value.toLocaleString('en-US', {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                    useGrouping: true,
                  })
                : '0.0000'
            },
            topCalc: function (values) {
              const sum = values.reduce((acc, curr) => acc + (curr || 0), 0)
              return sum.toLocaleString('en-US', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
                useGrouping: true,
              })
            },
            hozAlign: 'right',
            editable: (cell) => cell.getRow().getData().allocation_type == 'w',
            editor: 'number',
            frozen: true,
          },
          {
            title: 'Packages',
            field: 'quantity_packages',
            editor: 'number',
            formatter: function (cell) {
              const value = cell.getValue()
              const element = cell.getElement()

              if (cell.getRow().getData().allocation_type === 'p') {
                element.style.backgroundColor = '#e8f1fe'
                element.style.border = '1px solid #bfd2e8'
                return value
              }
              return ''
            },
            topCalc: function (values, data) {
              let sum = 0
              data.forEach((row) => {
                if (row.allocation_type === 'p') {
                  sum += row.quantity_packages || 0
                }
              })
              return sum
            },
            hozAlign: 'right',
            editable: (cell) => cell.getRow().getData().allocation_type == 'p',
            frozen: true,
          },

          // { title: "Weight Difference (kg)", field: "weight_diff", hozAlign: "center"},
          // {
          //   title: '',
          //   formatter: () => '<Button>Save</Button>',
          //   width: 100,
          //   frozen: true,
          //   hozAlign: 'center',
          //   cellClick: (e, cell) => {
          //     const row = cell.getRow()
          //     const rowData = row.getData()

          //     updatedRows.current = [...updatedRows.current, rowData.id]
          //     handleSubmitRow(rowData, row)
          //   },
          // },
        ],
        rowFormatter: (row) => {
          const rowData = row.getData()
          if (rowData.quantity_packages > rowData.init_quantity) {
            row.getElement().style.backgroundColor = '#8aedb8'
          } else if (rowData.quantity_packages < rowData.init_quantity) {
            row.getElement().style.backgroundColor = '#eda18a'
          }
        },
      })

      tabulatorRef.current.on('cellClick', (e, cell) => {
        if (cell.getColumn().getField() === 'box_number') {
          // Only trigger for the "name" column
          setCellData(cell.getValue())
          setIsTeaDialogOpen(true)
        }
      })

      tabulatorRef.current.on(
        'rowSelectionChanged',
        function (data: any, rows: any) {
          selectedIdsRef.current = [...selectedIdsRef.current, data.id]
          setSelectedRowCount(data.length)
        },
      )

      tabulatorRef.current.on('cellEdited', function (cell: any) {
        const row = cell.getRow()
        const rowData = row.getData()
        updatedRows.current = [...updatedRows.current, rowData.id]

        // if (cell.getOldValue() < cell.getValue()) {
        //   row.getElement().style.backgroundColor = '#8aedb8'
        // } else if (cell.getOldValue() > cell.getValue()) {
        //   row.getElement().style.backgroundColor = '#eda18a'
        // }

        handleSubmitRow(rowData, row).catch(() => {
          row.getElement().style.backgroundColor = '#eda18a'
        })
      })

      return () => {
        if (tabulatorRef.current) {
          tabulatorRef.current.destroy()
        }
      }
    }
  }, [allocations, availableTeas])

  useEffect(() => {
    if (availableTeaTableRef.current) {
      const table = new Tabulator(availableTeaTableRef.current, {
        data: availableTeas,
        columns: [
          {
            title: 'Select',
            formatter: 'rowSelection',
            titleFormatter: 'rowSelection',
            hozAlign: 'center',
            headerSort: false,
            width: 60,
          },
          { title: 'Tea', field: 'name' },
          { title: 'Lot Number', field: 'lotNumber' },
          { title: 'Available (kg)', field: 'freeQuantity' },
          { title: 'Package Weight (kg)', field: 'packageWeight' },
          { title: 'Type', field: 'type' },
        ],
        layout: 'fitColumns',
        height: '400px',
        selectable: true,
        selectableRollingSelection: false,
      })

      table.on('rowSelectionChanged', function (data: any, rows: any) {
        setSelectedTeas(data)
      })

      return () => {
        table.destroy()
      }
    }
  }, [availableTeas, searchTerm])

  const handleViewDetails = (id: number) => {
    fetchLotInfo(id)
  }

  interface PackageAllocationParams {
    blend_id: string | number
    lot_id: string | number
    allocation_type: 'w' | 'p'
    value: number
    per_package_quantity?: number
  }
  const handleSubmitRow = async (rowData: any, row: any): Promise<void> => {
    console.log('change request works')
    try {
      // Early return if row hasn't been updated
      if (!updatedRows.current?.includes(rowData.id)) {
        return
      }

      // Guard clause for required blend ID
      if (!selectedBlend?.id) {
        throw new Error('No blend selected')
      }

      // Validate required fields
      if (!rowData.lot_id) {
        throw new Error('Lot ID is required')
      }

      if (
        typeof rowData.quantity_packages !== 'number' ||
        rowData.quantity_packages < 0
      ) {
        throw new Error('Valid quantity is required')
      }
      console.log('before params')

      const baseParams: Partial<PackageAllocationParams> = {
        blend_id: selectedBlend.id,
        lot_id: rowData.lot_id,
        allocation_type: rowData.allocation_type,
        value:
          rowData.allocation_type == 'p'
            ? rowData.quantity_packages
            : rowData.quantity_kgs,
      }

      if (rowData.allocation_type == 'p') {
        baseParams.per_package_quantity = rowData.net_weight
      }

      // Add per_package_quantity only for package allocation AND when net_weight exists
      const params: PackageAllocationParams =
        rowData.option === 'Packages' && rowData.net_weight
          ? ({
              ...baseParams,
              per_package_quantity: rowData.net_weight,
            } as PackageAllocationParams)
          : (baseParams as PackageAllocationParams)

      await editPackageAllocation(params)

      // Show success toast
      toast({
        title: 'Success',
        description: 'Allocation updated successfully',
        variant: 'default',
      })

      row.getElement().style.backgroundColor = 'transparent'
      fetchBlendData(selectedBlend.name, false, false)

      // Optionally reset the updated rows tracking
      if (updatedRows.current) {
        updatedRows.current = updatedRows.current.filter(
          (id) => id !== rowData.id,
        )
      }
    } catch (error) {
      // Log error for debugging
      console.error('Failed to update package allocation:', error)

      // Show error toast with appropriate message
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update allocation',
        variant: 'destructive',
      })

      // Re-throw error if needed for parent component handling
      throw error
    }
  }

  /*
!Updated By Kavishka[Intern SE] 19/11/2024
  *Modified addSelectedTeasToBlend in AllocationTableView to:

  1.Convert selected teas to the correct table data format
  2.Directly update the Tabulator table using React state
  3.Update the total quantities and costs
  4.Maintain reactivity through React's state management

  !Updated By Kavishka[Intern SE] 20/11/2024
      quantity_packages: tea.allocation_type === 'p' ? 0 : 0,
      init_quantity: tea.init_quantity,
*/
  const addSelectedTeasToBlend = (selectedTeas: any[]) => {
    if (selectedBlend && tabulatorRef.current) {
      //* Transform selected teas into the format needed for the allocation table
      const newAllocations: ManufacturingAllocationTableData[] =
        selectedTeas.map((tea, index) => ({
          id: allocations.length + index + 1,
          lot_id: Number(tea.id),
          box_number: tea.box_number,
          broker: tea.broker || '',
          garden_mark: tea.garden_mark,
          standard: tea.standard,
          invoice_no: tea.invoice_no,
          lot_no: tea.lot_no || '',
          net_weight: tea.net_weight,
          grade: tea.grade || '',
          unit_cost: tea.purchased_price || 0,
          purchased_qty: tea.purchased_price || 0,
          quantity_kgs: tea.allocation_type === 'w' ? 0 : 0,
          quantity_packages: tea.allocation_type === 'p' ? 0 : 0,
          init_quantity: tea.init_quantity,
          allocation_type: tea.allocation_type,
          package_diff: 0,
          weight_diff: 0,
          total_cost:
            (tea.purchased_price || 0) *
            (tea.allocation_type === 'w' ? 0 : tea.net_weight),
        }))

      //* Update the allocations state with new data
      setAllocations((prevAllocations) => [
        ...prevAllocations,
        ...newAllocations,
      ])

      // Clear selected rows count
      setSelectedRowCount(0)

      // Update the original allocations reference
      originalAllocations.current = [
        ...originalAllocations.current,
        ...newAllocations,
      ]

      // Add these IDs to the updatedRows ref for tracking changes
      updatedRows.current = [
        ...updatedRows.current,
        ...newAllocations.map((allocation) => allocation.id),
      ]

      // Update the table data
      if (tabulatorRef.current) {
        tabulatorRef.current.setData([...allocations, ...newAllocations])
      }
    }
  }
  const updateTotalQuantity = () => {
    const total = allocations.reduce(
      (sum, allocation) => sum + allocation.quantity_kgs,
      0,
    )
    const totalCost = allocations.reduce(
      (sum, allocation) => sum + allocation.total_cost,
      0,
    )
    const avgPrice = total > 0 ? parseFloat((totalCost / total).toFixed(2)) : 0 // Convert to number

    setBlendInfo((prev) => {
      return { ...prev, totalAllocated: total, averagePrice: avgPrice }
    })
  }

  const handleRemoveSelectedTeas = () => {
    if (tabulatorRef.current) {
      const selectedData = tabulatorRef.current.getSelectedData()
      if (selectedData.length > 0) {
        setIsConfirmDialogOpen(true)
      }
    }
  }

  const confirmRemoveSelectedTeas = async () => {
    if (tabulatorRef.current) {
      const selectedData = tabulatorRef.current.getSelectedData()
      const params = selectedData.map((item) => {
        return {
          blend_id: selectedBlend?.id,
          lot_id: item.lot_id,
          allocation_type: item.allocation_type,
          value: 0,
          per_package_quantity: item.net_weight,
        }
      })

      const data = { allocations: params }

      try {
        await deleteManufactureAllocs(data)
        toast({
          title: 'Success',
          description: 'Selected allocations have been removed',
          variant: 'default',
        })
        if (selectedBlend) {
          setSelectedRowCount(0)
          fetchBlendData(selectedBlend.name)
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        })
      } finally {
        setIsConfirmDialogOpen(false)
      }
    }
  }

  const fetchLotInfo = async (lotId: number) => {
    try {
      const data = await getLotInfoById(lotId)
      setBlendDetails(data)
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const selectAllRows = () => {
    if (tabulatorRef.current) {
      tabulatorRef.current.selectRow()
    }
  }

  const deselectAllRows = () => {
    if (tabulatorRef.current) {
      tabulatorRef.current.deselectRow()
    }
  }

  const [blendInfo, setBlendInfo] = useState<BlendInfo>({
    blendNo: '',

    broker: '',
    blend_date: '',
    blendStandard: '',
    propSample: 0,
    requiredDate: '',
    packagingType: '',
    status: '',
    customer: 0,
    customerName: '',
    totalAllocated: 0,
    averagePrice: 0,
    averageCostToAllocate: 0,
    balanceToAllocate: 0,
    teaCost: 0,
    export_quantity: 0,
    allocations: [],
  })

  const handleBlendInfoChange = useCallback((info: Partial<BlendInfo>) => {
    setBlendInfo((prev) => ({ ...prev, ...info }))
  }, [])

  // Get blend data by blendid
  const fetchBlendData = useCallback(
    async (
      id: string,
      isEdit: boolean = false,
      isAllocationUpdate: boolean = true,
    ) => {
      try {
        const data = await getBlendById(id)
        const teas: TeaBlend = data[0]

        if (isEdit) {
          setSelectedBlend(teas)
          return
        }

        const teablendInfo: BlendInfo = {
          blendNo: teas.name,

          blend_date: teas.blend_date,
          blendStandard: teas.product_name,
          propSample: teas.propSample ?? 0,
          requiredDate: '',
          packagingType: teas.packagingType ?? '',
          status: teas.status,
          customer: teas.customer_id,
          customerName: teas.customer_name,
          totalAllocated: teas.allocated_quantity,
          averagePrice: teas.average_cost,
          averageCostToAllocate: teas.average_cost,
          balanceToAllocate: teas.to_allocate_quantity,
          teaCost: teas.average_cost,
          export_quantity: teas.export_quantity,
          allocations: [],
          broker: teas.broker,
        }
        setBlendInfo(teablendInfo)
        const tableData = teas.manufacturing_allocations.map((item, index) => {
          return {
            ...item,
            id: index + 1,
            package_diff: 0,
            weight_diff: 0,
            total_cost: item.unit_cost * item.quantity_kgs,
          }
        })
        if (isAllocationUpdate) {
          setAllocations(tableData)
        }
        originalAllocations.current = tableData
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        })
      }
    },
    [],
  )

  const handleGenerateBlendSheet = useCallback(async () => {
    try {
      // Create a BlendAllocation object from blendInfo and allocations
      const blendAllocation: any = {
        ...blendInfo,
        allocations: allocations,
      }

      const blendName = { blend_name: blendAllocation.blendNo }
      setIsGenerateConfirmOpen(false)

      const success = await blendConfirm(blendName)

      if (success) {
        console.log('Blend sheet generated successfully')
        toast({
          title: 'Success',
          description: 'Blend sheet generated successfully',
          variant: 'default',
        })

        // Fetch updated data only if selectedBlend exists
        if (selectedBlend) {
          await fetchBlendData(selectedBlend.name)
        }
      } else {
        console.error('Failed to generate blend sheet')
        toast({
          title: 'Error',
          description: 'Failed to generate blend sheet',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error generating blend sheet:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to generate blend sheet',
        variant: 'destructive',
      })
    }
  }, [
    blendInfo,
    allocations,
    selectedBlend,
    blendConfirm,
    fetchBlendData,
    toast,
  ])

  useEffect(() => {
    if (selectedBlend) {
      fetchBlendData(selectedBlend.name)
    }
  }, [selectedBlend, fetchBlendData])

  const saveTableData = async () => {
    const updatingObjs = updatedRows.current
      .map((item) => {
        const allocation: ManufacturingAllocationTableData | undefined =
          allocations.find((alloc) => item === alloc.id)
        if (allocation) {
          return {
            id: allocation.id,
            quantity_packages: allocation.quantity_packages,
            quantity_kgs: allocation.quantity_kgs,
          }
        }
      })
      .filter((item) => item != undefined)

    if (updatingObjs.length > 0) {
      try {
        await updateAllocations(updatingObjs)
        toast({
          title: 'Success',
          description: 'Allocation data updated successfully',
          variant: 'default',
        })
        if (selectedBlend) {
          fetchBlendData(selectedBlend.name)
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        })
      }
    }
  }

  const addTeaBtnClick = () => {
    if (selectedBlend) {
      setIsDialogOpen(true)
    } else {
      toast({
        title: 'Error',
        description: 'Please select a Blend first',
        variant: 'destructive',
      })
    }
  }

  const customerChanged = (blend: TeaBlend) => {
    if (blend) {
      router.replace(`${pathname}?id=${blend.name}`)
      setSelectedBlend(blend)
    }
  }

  useEffect(() => {
    if (selectedBlend) {
      fetchBlendData(selectedBlend.name)
    }
  }, [selectedBlend])

  // Get the id if it exists
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      fetchBlendData(id, true)
    }
  }, [searchParams])
  console.log(blendInfo)
  // console.log('selected', selectedBlend)
  // console.log('blendinfo', blendInfo)
  return (
    <>
      <div className="w-[100%] p-4">
        <h1 className="mb-4 text-2xl font-semibold">Tea Blend Allocation</h1>
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-6">
            <Card className="mb-5">
              <CardHeader className="top-0 z-10 flex flex-row items-center justify-between pb-4">
                <CardTitle>
                  Selected Blend
                  <label className="text-md ms-5">
                    {selectedBlend ? selectedBlend.name : '-'}
                  </label>
                </CardTitle>
                {selectedBlend && (
                  <label className="text-md">
                    Blend Standard: {blendInfo?.blendStandard}
                  </label>
                )}
                {selectedBlend && (
                  <label className="text-md">
                    Customer Name: {selectedBlend.customer_name}
                  </label>
                )}

                {selectedBlend && (
                  <DownloadReportButton
                    tabulatorRef={tabulatorRef}
                    blendInfo={{
                      blendNo: selectedBlend.name,
                      blendRefNo: '',
                      customerName: selectedBlend.customer_name,
                      status: blendInfo?.status || '',
                      blendDate: blendInfo.blend_date,
                      totalContractQty: 0,
                      blendStandard: blendInfo?.blendStandard || '',
                      blendAverage: blendInfo?.averagePrice || 0,
                      rtNo: '',
                      broker: blendInfo?.broker || '',
                      export_quantity: blendInfo?.export_quantity || 0,
                      averagePrice: blendInfo?.averagePrice || 0,
                    }}
                  />
                )}
                <div className="flex gap-2">
                  <Dialog
                    open={isBlendDialogOpen}
                    onOpenChange={setIsBlendDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 text-white">
                        Select Blend
                      </Button>
                    </DialogTrigger>
                    <SelectBlendsDialog
                      isOpen={isBlendDialogOpen}
                      onClose={() => setIsBlendDialogOpen(false)}
                      onSelectBlend={customerChanged}
                    />
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <BlendInformationSection
                  blendInfo={blendInfo}
                  lotDetails={blendDetails}
                  onBlendInfoChange={handleBlendInfoChange}
                  onGenerateBlendSheet={() => setIsGenerateConfirmOpen(true)}
                  onSaveTableData={() => saveTableData()}
                />
                {/* <div ref={blendsTableRef}></div> */}
              </CardContent>
              <TeaViewDialog
                isTeaDialogOpen={isTeaDialogOpen}
                setIsTeaDialogOpen={setIsTeaDialogOpen}
                cellData={cellData}
              />
            </Card>
            <Card>
              <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between">
                <CardTitle>Tea Allocations</CardTitle>
                {isDraftBlend && (
                  <div className="flex gap-2">
                    {/* View allocations */}
                    {selectedBlend && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button className="bg-blue-600 text-white">
                            View Order Lines
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <h4 className="mb-2 font-semibold">Allocations</h4>
                          <ScrollArea className="h-60">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Order</TableHead>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Quantity</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedBlend.allocations.map(
                                  (allocation, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {allocation.sale_order_name}
                                      </TableCell>
                                      <TableCell>
                                        {allocation.product_name}
                                      </TableCell>
                                      <TableCell>
                                        {allocation.quantity.toFixed(3)}
                                      </TableCell>
                                    </TableRow>
                                  ),
                                )}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                    )}
                    {/* <Button onClick={openSplit} className="bg-blue-600 text-white">
                Split
              </Button> */}

                    {selectedBlend && selectedBlend.status === 'draft' && (
                      <div className="allocationBtns">
                        <Button
                          onClick={selectAllRows}
                          className="bg-blue-600 text-white"
                        >
                          Select All
                        </Button>
                        <Button
                          onClick={deselectAllRows}
                          className="bg-gray-600 text-white"
                        >
                          Deselect All
                        </Button>
                        <Button
                          onClick={handleRemoveSelectedTeas}
                          className="bg-red-600 text-white"
                          disabled={selectedRowCount === 0}
                        >
                          Remove Selected Teas ({selectedRowCount})
                        </Button>
                        <Button
                          className="bg-green-600 text-white"
                          onClick={addTeaBtnClick}
                        >
                          Add Tea
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="w-100">
                <div ref={allocationsTableRef}></div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Dialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Removal</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to remove the selected teas from the blend?
            </p>
            <DialogFooter>
              <Button
                onClick={() => setIsConfirmDialogOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRemoveSelectedTeas}
                className="bg-red-600 text-white"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation for generate button */}
        <Dialog
          open={isGenerateConfirmOpen}
          onOpenChange={setIsGenerateConfirmOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Generation</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to generate the blend?</p>
            <DialogFooter>
              <Button
                onClick={() => setIsGenerateConfirmOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateBlendSheet}
                className="bg-green-600 text-white"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isOpenPlit && selectedBlend && (
          <SplitTeaDialog
            blendId={selectedBlend.id}
            isOpen={isOpenPlit}
            onClose={() => setIsOpenPlit(false)}
          />
        )}

        {selectedBlend && (
          <AvailableTeaDialog
            selectedIds={allocations.map((item) => {
              return { weight: item.net_weight, boxNo: item.box_number }
            })}
            blendId={selectedBlend.id}
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onAddTeas={addSelectedTeasToBlend}
          />
        )}
      </div>
    </>
  )
}

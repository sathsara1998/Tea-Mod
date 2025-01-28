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
import { useTheme } from 'next-themes'

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
  NewCustomerOrdersTableData,
} from './types'
import AllocationDetailsDialog from './AllocationDetailsDialog'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import SplitTeaDialog from './AllocationViewComponents/SplitTeaDialog'
import TeaBlendReportButton from './TeaBlendReportButton'
import DownloadReportButton from './DownloadReportButton'
import TeaViewDialog from './TeaViewDialog'
import LoadingSpinner from './LoadingSpinner'
import ReportDownloadButton from './ReportDownload'
// import BlendReport from './BlendReport'

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
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [blendDetails, setBlendDetails] = useState<StockLot>()
  const [isOpenPlit, setIsOpenPlit] = useState(false)
  const [cellData, setCellData] = useState<{ id: number; type: string }>({
    id: 0,
    type: '',
  }) // To store data from the clicked cell
  const [isTeaDialogOpen, setIsTeaDialogOpen] = useState(false)
  const [selectedBlendID, setSelectedBlendID] = useState<number | null>(null)
  const [reportType, setReportType] = useState<'finance' | 'stores'>('finance')
  // const [isLoading, setIsLoading] = useState(false)

  const {
    getBlendById,
    updateAllocations,
    getLotInfoById,
    deleteManufactureAllocs,
    editPackageAllocation,
    blendConfirm,
    blendReset,
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
            free_quantity: item.free_quantity,
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
          { title: 'Broker', field: 'broker_name', hozAlign: 'left' },
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
            title: 'Available QTY',
            field: 'free_quantity',
            hozAlign: 'right',
            frozen: true,
          },
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
            editorParams: {
              min: 1,
              selectContents: true,
            },
            frozen: true,
            cellEditCancelled: function (cell) {
              const rowData = cell.getRow().getData()
              if (rowData.allocation_type === 'p' && rowData.net_weight) {
                const newQuantityKgs = cell.getValue() * rowData.net_weight
                cell.getRow().update({
                  quantity_kgs: newQuantityKgs,
                })
              }
            },
          },
          {
            title: 'Packages',
            field: 'quantity_packages',
            editor: 'number',
            editorParams: {
              min: 1,
              selectContents: true,
            },
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
          const rowData = cell.getRow().getData()
          setCellData({ id: rowData.lot_id, type: rowData.type })
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

        if (
          cell.getColumn().getField() === 'quantity_packages' &&
          rowData.allocation_type === 'p' &&
          rowData.net_weight
        ) {
          // Calculate new quantity in kg
          const newQuantityKgs = rowData.quantity_packages * rowData.net_weight
          const quantityDiff =
            rowData.quantity_packages - (rowData.init_quantity || 0)

          // Update available quantity
          const newFreeQuantity = Math.max(
            0,
            rowData.free_quantity - quantityDiff,
          )

          // Update the row with new quantities
          row.update({
            quantity_kgs: newQuantityKgs,
            quantity_packages: rowData.quantity_packages,
            free_quantity: newFreeQuantity,
          })
        } else if (
          cell.getColumn().getField() === 'quantity_kgs' &&
          rowData.allocation_type === 'w'
        ) {
          // For weight-based allocations
          const quantityDiff =
            rowData.quantity_kgs - (rowData.init_quantity || 0)
          const newFreeQuantity = Math.max(
            0,
            rowData.free_quantity - quantityDiff,
          )

          // Update the row with new free quantity
          row.update({
            quantity_kgs: rowData.quantity_kgs,
            free_quantity: newFreeQuantity,
          })
        }

        updatedRows.current = [...updatedRows.current, rowData.id]

        handleSubmitRow(rowData, row).catch(() => {
          row.getElement().style.backgroundColor = '#eda18a'

          // Revert changes on failed submission
          row.update({
            quantity_kgs: rowData.init_quantity,
            quantity_packages: rowData.init_quantity,
            free_quantity: rowData.free_quantity,
          })
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

  //addTea Function
  const addSelectedTeasToBlend = (selectedTeas: any[]) => {
    // setIsLoading(true)
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
          free_quantity: tea.free_quantity || 0,
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
    id: 0,
    blendNo: '',
    broker: '',
    blend_date: '',
    blendStandard: '',
    prop_sample_grams: 0,
    requiredDate: '',
    status: '',
    customer: 0,
    customerName: '',
    totalAllocated: 0,
    averagePrice: 0,
    averageCostToAllocate: 0,
    balanceToAllocate: 0,
    teaCost: 0,
    export_quantity: 0,
    manufacturing_allocations: [],
    allocations: [],
    propSample: 0,
    packing_type: '',
    avg_tea_cost: 0,
    avg_to_allocate_tea_cost: 0,
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
        // const allocations: NewCustomerOrdersTableData = teas.allocations
        // console.log(allocations)
        const allocationData = teas.allocations?.[0] || null
        console.log(`data`, teas.allocations)
        if (isEdit) {
          setSelectedBlend(teas)
          return
        }

        if (data?.data?.length > 0) {
          setSelectedBlendID(data.data[0].id) // Set customer name
        } else {
          setSelectedBlendID(null) // Handle case where no orders are returned
        }
        // const isallocation: NewCustomerOrdersTableData = {
        //   finished_product_id: allocations.allocations[0].finished_product_id,
        // }
        console.log(teas)
        const teablendInfo: BlendInfo = {
          id: teas.id,
          blendNo: teas.name,
          blend_date: teas.blend_date,
          blendStandard: teas.product_name,
          propSample: teas.propSample ?? 0,
          requiredDate: '',
          packing_type: teas.packing_type ?? '',
          status: teas.status,
          customer: teas.customer_id,
          customerName: teas.customer_name,
          totalAllocated: teas.allocated_quantity,
          averagePrice: teas.average_cost,
          averageCostToAllocate: teas.average_cost,
          balanceToAllocate: teas.to_allocate_quantity,
          teaCost: teas.average_cost,
          export_quantity: teas.export_quantity,
          broker: teas.broker,
          prop_sample_grams: teas.prop_sample_grams,
          manufacturing_allocations: [],
          allocations: [teas.allocations],
          avg_tea_cost: teas.avg_tea_cost,
          avg_to_allocate_tea_cost: teas.avg_to_allocate_tea_cost,
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
  const handleResetBlendSheet = useCallback(async () => {
    try {
      // Create a BlendAllocation object from blendInfo and allocations
      const blendAllocation: any = {
        ...blendInfo,
        allocations: allocations,
      }

      const blendName = { blend_name: blendAllocation.blendNo }
      setIsResetConfirmOpen(false)

      const success = await blendReset(blendName)

      if (success) {
        console.log('Blend sheet Reseted successfully')
        toast({
          title: 'Success',
          description: 'Blend sheet Reseted successfully',
          variant: 'default',
        })

        // Fetch updated data only if selectedBlend exists
        if (selectedBlend) {
          await fetchBlendData(selectedBlend.name)
        }
      } else {
        console.error('Failed to reset blend sheet')
        toast({
          title: 'Error',
          description: 'Failed to reset blend sheet',
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

  // console.log('selected', selectedBlend)
  console.log('blendinfo-allocations', blendInfo)

  return (
    <>
      <div className="w-[100%] p-4">
        <h1 className="mb-4 text-2xl font-semibold">Tea Blend Allocation</h1>
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-6">
            <Card className="mb-5">
              <CardHeader className="top-0 z-10 flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
                  {/* Blend Info Section */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-m">Selected Blend:</span>
                      <span className="text-sm font-medium text-gray-600">
                        {selectedBlend ? selectedBlend.name : '-'}
                      </span>
                    </div>
                    {selectedBlend && (
                      <div className="ml-2 flex flex-wrap gap-4">
                        <div className="flex items-center">
                          <span className="text-m">Blend Standard:</span>
                          <span className="ml-1 text-sm font-medium text-gray-600">
                            {blendInfo?.blendStandard}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <span className="text-m">Customer:</span>
                          <span className="ml-1 text-sm font-medium text-gray-600">
                            {selectedBlend.customer_name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardTitle>

                {/* Actions Section */}
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  <div>
                    {/*Download Report*/}
                    <ReportDownloadButton
                      selectedBlend={
                        selectedBlend ? { id: selectedBlend.id } : null
                      }
                      type={reportType}
                      onTypeChange={setReportType}
                    />
                  </div>
                  <Dialog
                    open={isBlendDialogOpen}
                    onOpenChange={setIsBlendDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
                        variant="default"
                      >
                        <span className="hidden sm:inline">Select Blend</span>
                        <span className="sm:hidden">Blend</span>
                        <svg
                          className="ml-1 h-3 w-3 sm:h-4 sm:w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                          />
                        </svg>
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
                  onResetBlendSheet={() => setIsResetConfirmOpen(true)}
                  onSaveTableData={() => saveTableData()}
                  // OnUpdateBlendDetails={()=>setIsGenerateConfirmOpen(true)}
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
                          <Button className="inline-flex items-center gap-2 border border-gray-200 bg-gray-50 text-gray-700 shadow-sm hover:bg-gray-100">
                            View Order Lines
                            <Info className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <h4 className="mb-2 font-semibold">Allocations</h4>
                          <ScrollArea className="h-60">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Co No</TableHead>
                                  <TableHead>Co Line</TableHead>
                                  <TableHead>FG Description</TableHead>
                                  <TableHead>Quantity (kg)</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedBlend.allocations.map(
                                  (allocation, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {allocation.sale_order}
                                      </TableCell>
                                      <TableCell>
                                        {allocation.component_id}
                                      </TableCell>
                                      <TableCell>
                                        {allocation.finished_product_name}
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
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={selectAllRows}
                            variant="outline"
                            className="inline-flex items-center border border-blue-200 px-3 py-2 text-blue-700 transition-colors hover:bg-blue-50"
                          >
                            <span className="mr-1">Select All</span>
                          </Button>

                          <Button
                            onClick={deselectAllRows}
                            variant="outline"
                            className="inline-flex items-center border border-gray-200 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <span className="mr-1">Deselect All</span>
                          </Button>

                          <Button
                            onClick={handleRemoveSelectedTeas}
                            variant="outline"
                            disabled={selectedRowCount === 0}
                            className={`inline-flex items-center border px-3 py-2 transition-colors
                              ${
                                selectedRowCount === 0
                                  ? 'cursor-not-allowed border-gray-200 text-gray-400'
                                  : 'border-red-200 text-red-700 hover:bg-red-50'
                              }`}
                          >
                            <span className="mr-1">Remove Selected</span>
                            {selectedRowCount > 0 && (
                              <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                {selectedRowCount}
                              </span>
                            )}
                          </Button>

                          <Button
                            onClick={addTeaBtnClick}
                            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-green-700"
                          >
                            <svg
                              className="mr-2 h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Add Tea
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="w-100">
                {/* {isLoading && <LoadingSpinner />} */}
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
              <Button onClick={confirmRemoveSelectedTeas} variant="destructive">
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
                variant="outline"
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-green-700 hover:text-white"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Confirmation for reset button */}
        <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Reset</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to reset the blend?</p>
            <DialogFooter>
              <Button
                onClick={() => setIsResetConfirmOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleResetBlendSheet} variant="destructive">
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

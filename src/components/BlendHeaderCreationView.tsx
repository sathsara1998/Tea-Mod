'use client'
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import EditBlendDialog from './BlendHeaderCreationViewComponents/EditBlendDialog'
import TotalDemandCard, {
  TotalDemand,
} from './BlendHeaderCreationViewComponents/TotalDemandCard'
import BlendCreation, {
  BlendShowType,
} from './BlendHeaderCreationViewComponents/BlendCreation'
import BlendsList from './BlendHeaderCreationViewComponents/BlendsList'
import { useApiMethods } from '@/hooks/useApiMethods'
import {
  SalesOrder,
  SelectedBlend,
  ConfirmedSaleOrder,
  TeaBlend,
  CustomerOrdersTableData,
  BlendCreateReq,
  Customer,
  BatchAllocationUpdateRequest,
  AllocationUpdate,
} from './types'
import { CustomerFullBlends } from './BlendHeaderCreationViewComponents/NewBlendDialog'
import CustomerSelection from './BlendHeaderCreationViewComponents/CustomerSelection'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function BlendAllocator() {
  const [confirmedSaleOrders, setConfirmedSaleOrders] = useState<
    ConfirmedSaleOrder[]
  >([])
  const [selectedSalesOrders, setSelectedSalesOrders] = useState<SalesOrder[]>(
    [],
  )
  const [blends, setBlends] = useState<TeaBlend[]>([])
  const [selectedBlends, setSelectedBlends] = useState<SelectedBlend[]>([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingBlend, setEditingBlend] = useState<TeaBlend | null>(null)
  const [selectedAllocations, setSelectedAllocations] = useState<
    CustomerOrdersTableData[]
  >([])
  const [groupedDemands, setGroupedDemands] = useState<TotalDemand[]>([])
  const [isEditBlend, setIsEditBlend] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedPartnerId, setSelectedPartnerId] = useState(0)
  const [editingBlendCustomer, setEditingBlendCustomer] = useState<Customer>()
  const [editingBlendId, setEditingBlendId] = useState(0)
  const [blendLoading, setBlendsLoading] = useState(false)
  const [editingBlendInfo, setEditingBlendInfo] = useState<BlendShowType>({
    name: '',
    productName: '',
    customerName: '',
    quantity: 0,
  })
  const { toast } = useToast()
  const {
    getConfirmedSaleOrders,
    getBlends,
    getTeaBlendSales,
    updateBlend,
    blendCreate,
    updateSalesOrder,
    getCustomers,
    getBlendByBlendNo,
    getBlendByCustomer,
    createNewBlend,
    updateNewBlend,
    deleteSalesAllocs,
  } = useApiMethods()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialSalesOrders = useRef<CustomerOrdersTableData[]>([])
  const [blendItems, setBlendItems] = useState<CustomerOrdersTableData[]>([])
  const fetchConfirmedSaleOrders = useCallback(async () => {
    setError(null)
    try {
      const data = await getConfirmedSaleOrders()
      setConfirmedSaleOrders(data)
    } catch (err: any) {
      setError('Error fetching confirmed sale orders. Please try again.')
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    }
  }, [])

  const fetchBlends = async () => {
    setError(null)
    setBlendsLoading(true)
    try {
      const data = await getBlendByCustomer(selectedPartnerId)

      setBlends(data)
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
      setBlends([])
    } finally {
      setBlendsLoading(false)
    }
  }

  const fetchCustomers = useCallback(async () => {
    try {
      const customers = await getCustomers()
      setCustomers(customers)
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    }
  }, [])

  useEffect(() => {
    fetchConfirmedSaleOrders()
    fetchCustomers()
  }, [fetchConfirmedSaleOrders, fetchCustomers])

  const fetchSalesOrderDetails = async (saleOrderNumber: string) => {
    setError(null)
    try {
      const data = await getTeaBlendSales(saleOrderNumber)
      return data
    } catch (err: any) {
      setError('Error fetching sales order details. Please try again.')
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
      return null
    }
  }

  const handleSalesOrderSelect = async (orderId: string) => {
    const order = confirmedSaleOrders.find((so) => so.id.toString() === orderId)
    if (order) {
      const orderDetails = await fetchSalesOrderDetails(order.name)
      if (orderDetails) {
        setSelectedSalesOrders((prev) => [...prev, orderDetails])
      }
    }
  }

  const handleRemoveSalesOrder = (orderId: number) => {
    setSelectedSalesOrders((prev) =>
      prev.filter((order) => order.id !== orderId),
    )
  }

  const handleBlendSelect = (
    blendName: string,
    lineId: number,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedBlends((prev) => {
        const existingBlend = prev.find((b) => b.blendName === blendName)
        if (existingBlend) {
          return prev.map((b) =>
            b.blendName === blendName
              ? { ...b, quantities: { ...b.quantities, [lineId]: 0 } }
              : b,
          )
        } else {
          return [...prev, { blendName, quantities: { [lineId]: 0 } }]
        }
      })
    } else {
      setSelectedBlends((prev) =>
        prev
          .map((b) =>
            b.blendName === blendName
              ? {
                  ...b,
                  quantities: Object.fromEntries(
                    Object.entries(b.quantities).filter(
                      ([id]) => id !== lineId.toString(),
                    ),
                  ),
                }
              : b,
          )
          .filter((b) => Object.keys(b.quantities).length > 0),
      )
    }
  }

  const handleBlendQuantityChange = (
    blendName: string,
    lineId: number,
    quantity: number,
  ) => {
    setSelectedBlends((prev) =>
      prev.map((b) =>
        b.blendName === blendName
          ? { ...b, quantities: { ...b.quantities, [lineId]: quantity } }
          : b,
      ),
    )
  }

  const handleAllocateFullQuantity = (
    blendName: string,
    lineId: number,
    fullQuantity: number,
  ) => {
    setSelectedBlends((prev) =>
      prev.map((b) =>
        b.blendName === blendName
          ? { ...b, quantities: { ...b.quantities, [lineId]: fullQuantity } }
          : b,
      ),
    )
  }

  const calculateTotalDemand = () => {
    return selectedBlends.map((blend) => ({
      blendName: blend.blendName,
      totalQuantity: Object.values(blend.quantities).reduce(
        (sum, q) => sum + q,
        0,
      ),
    }))
  }

  const handleConfirm = async () => {
    setIsConfirming(true)
    if (isEditBlend) {
      editExistingBlend()
    } else {
      createBlend()
    }
  }

  const editExistingBlend = async () => {
    try {
      // Create updates array for changed allocations
      const updates = []

      for (const currentAlloc of selectedAllocations) {
        // Find matching initial allocation
        const initialAlloc = initialSalesOrders.current.find(
          (initial) => initial.allocation_id === currentAlloc.allocation_id,
        )

        // Only include if quantity has changed
        if (
          initialAlloc &&
          initialAlloc.allocated_blend_quantity !== currentAlloc.blending_qty
        ) {
          updates.push({
            allocation_id: currentAlloc.allocation_id,
            quantity: currentAlloc.quantity,
          })
        }
      }

      // Only proceed if there are changes
      if (updates.length === 0) {
        toast({
          title: 'No Changes',
          description: 'No changes detected in allocations',
          variant: 'default',
        })
        setIsConfirming(false)
        return
      }

      // Send updates as array
      await updateSalesOrder(updates)

      toast({
        title: 'Success',
        description: `Successfully updated ${updates.length} allocation(s)`,
        variant: 'default',
      })
      if (searchParams.get('id')) {
        await getBlendData(searchParams.get('id')!)
      }
      await fetchBlends()
    } catch (err: any) {
      console.error('Failed to allocation:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to update allocations',
        variant: 'destructive',
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const createBlend = async () => {
    try {
      let quantities: number[] = []
      let demand_line_ids: number[] = []

      // Process each allocation to extract quantities and line IDs
      selectedAllocations.forEach((item) => {
        quantities.push(item.quantity)
        demand_line_ids.push(item.line_id)
      })

      const requestBody = {
        partner_id: selectedPartnerId,
        quantities,
        demand_line_ids,
      }

      await createNewBlend(requestBody)
      toast({
        title: 'Blend Created',
        description: `Created blend successfully`,
        variant: 'default',
      })

      resetData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to create allocation',
        variant: 'destructive',
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const handleUpdateBlend = async () => {
    if (!editingBlend) return

    try {
      await updateBlend(editingBlend.id, editingBlend)

      await fetchBlends()
      setEditingBlend(null)
      toast({
        title: 'Blend Updated',
        description: `Updated blend: ${editingBlend.name}`,
      })
    } catch (error: any) {
      console.error('Error updating blend:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  function groupByProductNameAndSum(): TotalDemand[] {
    const grouped = selectedAllocations.reduce(
      (acc: Record<string, { total: number; product_id: number }>, order) => {
        // If the product_name already exists, add the tea_weight to the total
        if (acc[order.product_name]) {
          acc[order.product_name].total += 1
        } else {
          // Otherwise, initialize it with the current tea_weight and product_id
          acc[order.product_name] = {
            total: 1,
            product_id: order.product_id, // Add product_id here
          }
        }
        return acc
      },
      {},
    )

    // Convert the grouped object to an array of { product_id, product_name, total }
    return Object.entries(grouped).map(
      ([product_name, { total, product_id }]) => ({
        product_name,
        product_id,
        total,
      }),
    )
  }

  useEffect(() => {
    if (selectedAllocations.length > 0) {
      setGroupedDemands(groupByProductNameAndSum())
    }
  }, [selectedAllocations])

  const onNewBlendDataAdd = (data: CustomerFullBlends) => {
    router.replace(pathname)
    setIsEditBlend(false)
    setSelectedAllocations(data.products)
  }

  const resetData = () => {
    setSelectedAllocations([])
    fetchBlends()
  }

  const onEditPressed = (blend: TeaBlend) => {
    router.replace(`${pathname}?id=${blend.name}`)
    getBlendData(blend.name)
  }

  const getBlendData = async (name: string) => {
    try {
      const data = await getBlendByBlendNo(name)
      setEditingData(data[0])
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Get the id if it exists
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      getBlendData(id)
    }
  }, [searchParams])

  const setEditingData = (blend: TeaBlend) => {
    setIsEditBlend(true)

    const allocations: CustomerOrdersTableData[] = []
    blend.allocations.forEach((alloc) => {
      const tableData: CustomerOrdersTableData = {
        contract_number: alloc.sale_order,
        contract_line_no: alloc.demand_line_id,
        allocation_id: alloc.allocation_id,
        product_internal_ref: alloc.component_id,
        product_uom_qty: alloc.quantity_needed,
        product_uom: 'Units',
        product_name: alloc.component_name,
        product_blend_internal_ref: alloc.product_internal_ref,
        blend_details: '',
        tea_weight: alloc.length?.quantity ?? 0,
        allocated_blend_quantity:
          alloc.quantity_needed - alloc.quantity_remaining,
        product_id: alloc.product_id,
        release_number: 1,
        blending_qty: alloc.quantity_remaining + alloc.quantity || 0,
        standard: '',
        line_id: 0,
        id: alloc.id,
        quantity_remaining: alloc.quantity_remaining,
        quantity: alloc.quantity,
      }
      console.log(tableData)
      allocations.push(tableData)
    })
    setEditingBlendCustomer({
      id: blend.customer_id,
      name: blend.customer_name,
    })
    setEditingBlendInfo({
      name: blend.name,
      productName: blend.product_name,
      customerName: blend.customer_name,
      quantity: blend.quantity,
    })
    setEditingBlendId(blend.id)
    setSelectedPartnerId(blend.customer_id)
    setSelectedAllocations(allocations)
    initialSalesOrders.current = JSON.parse(JSON.stringify(allocations))
  }

  const allocationsDeleted = (ids: number[]) => {
    setSelectedAllocations((prev) =>
      prev.filter((a: any) => !ids.includes(a.id)),
    )
  }

  const customerSelected = (id: number) => {
    setSelectedPartnerId(id)
  }

  useEffect(() => {
    if (selectedPartnerId) {
      resetData()
    }
  }, [selectedPartnerId])

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <Loader2 className="h-8 w-8 animate-spin" />
  //     </div>
  //   )
  // }

  // if (error) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-screen">
  //       <Alert variant="destructive" className="mb-4">
  //         <AlertTriangle className="h-4 w-4" />
  //         <AlertTitle>Error</AlertTitle>
  //         <AlertDescription>{error}</AlertDescription>
  //       </Alert>
  //       <Button onClick={fetchConfirmedSaleOrders} variant="outline">
  //         <RefreshCw className="mr-2 h-4 w-4" />
  //         Retry
  //       </Button>
  //     </div>
  //   )
  // }

  const handleDelete = async (selectedIds: number[]) => {
    await deleteSalesAllocs(selectedIds)
    // Update the blendItems state by filtering out deleted items
    // setBlendItems((prevItems) =>
    //   prevItems.filter((item) => !selectedIds.includes(item.allocation_id)),
    // )
    if (searchParams.get('id')) {
      await getBlendData(searchParams.get('id')!)
    }
    await fetchBlends()
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Left Side - Blends */}
      <div className="col-span-1">
        <BlendsList
          customerId={selectedPartnerId}
          blends={blends}
          fetchBlends={fetchBlends}
          onNewBlendDataAdd={onNewBlendDataAdd}
          onEditPress={onEditPressed}
          loading={blendLoading}
        />
      </div>

      {/* Middle - Blend Creation */}
      <div className="col-span-3">
        <CustomerSelection
          customers={customers}
          selectedCustomer={editingBlendCustomer}
          customerSelected={customerSelected}
        />

        <BlendCreation
          isEdit={isEditBlend}
          selectedBlends={selectedBlends}
          isConfirming={isConfirming}
          handleConfirm={handleConfirm}
          blendItems={selectedAllocations}
          allocationsChanged={setSelectedAllocations}
          customerId={selectedPartnerId}
          blendId={editingBlendId}
          editiingInfo={editingBlendInfo}
          onDelete={handleDelete}
        />
      </div>

      {/* Right Side - Total Demand */}
      {/* {!isEditBlend && (
        <div className="w-full md:w-1/4">
          <TotalDemandCard totalDemand={groupedDemands} />
        </div>
      )} */}

      {/* Edit Blend Dialog */}
      {/* {editingBlend && (
        <EditBlendDialog
        editingBlend={editingBlend}
        setEditingBlend={setEditingBlend}
        handleUpdateBlend={handleUpdateBlend}
      />
      )} */}
    </div>
  )
}

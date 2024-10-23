"use client"
import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import EditBlendDialog from './BlendHeaderCreationViewComponents/EditBlendDialog';
import TotalDemandCard, { TotalDemand } from './BlendHeaderCreationViewComponents/TotalDemandCard';
import BlendCreation from './BlendHeaderCreationViewComponents/BlendCreation';
import BlendsList from './BlendHeaderCreationViewComponents/BlendsList'
import { useApiMethods } from '@/hooks/useApiMethods'
import {
  SalesOrder,
  SelectedBlend, 
  ConfirmedSaleOrder, 
  TeaBlend,
  CustomerOrdersTableData,
  BlendCreateReq,
  Customer
} from './types'
import { CustomerFullBlends } from './BlendHeaderCreationViewComponents/NewBlendDialog'
import CustomerSelection from './BlendHeaderCreationViewComponents/CustomerSelection'


export default function BlendAllocator() {
  const [confirmedSaleOrders, setConfirmedSaleOrders] = useState<ConfirmedSaleOrder[]>([])
  const [selectedSalesOrders, setSelectedSalesOrders] = useState<SalesOrder[]>([])
  const [blends, setBlends] = useState<TeaBlend[]>([])
  const [selectedBlends, setSelectedBlends] = useState<SelectedBlend[]>([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingBlend, setEditingBlend] = useState<TeaBlend | null>(null)
  const [selectedAllocations, setSelectedAllocations] = useState<CustomerOrdersTableData[]>([])
  const [groupedDemands, setGroupedDemands] = useState<TotalDemand[]>([])
  const [isEditBlend, setIsEditBlend] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedPartnerId, setSelectedPartnerId] = useState(0);
  const [editingBlendCustomer, setEditingBlendCustomer] = useState<Customer>();
  const [editingBlendId, setEditingBlendId] = useState(0);
  const { toast } = useToast()
  const { 
    getConfirmedSaleOrders, 
    getBlends, 
    getTeaBlendSales, 
    createBlend,
    updateBlend,
    blendCreate,
    updateSalesOrder,
    getCustomers,
    getBlendByBlendNo,
    getBlendByCustomer
  } = useApiMethods();

  const initialSalesOrders = useRef<CustomerOrdersTableData[]>([])

  const fetchConfirmedSaleOrders = useCallback(async () => {
    setError(null)
    try {
      const data = await getConfirmedSaleOrders();
      setConfirmedSaleOrders(data)
    } catch (err) {
      setError('Error fetching confirmed sale orders. Please try again.')
      toast({
        title: "Error",
        description: 'Error fetching confirmed sale orders. Please try again.',
        variant: "destructive",
      })
    }
  }, [])

  const fetchBlends = async (load: boolean = true) => {
    setError(null)
    try {
      const data = await getBlendByCustomer(selectedPartnerId);
      
      setBlends(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomers = useCallback(async () => {
    try {
      const customers = await getCustomers()
      setCustomers(customers)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
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
      const data = await getTeaBlendSales(saleOrderNumber);
      return data;
    } catch (err: any) {
      setError('Error fetching sales order details. Please try again.')
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
      return null
    }
  }

  const handleSalesOrderSelect = async (orderId: string) => {
    const order = confirmedSaleOrders.find(so => so.id.toString() === orderId)
    if (order) {
      const orderDetails = await fetchSalesOrderDetails(order.name)
      if (orderDetails) {
        setSelectedSalesOrders(prev => [...prev, orderDetails])
      }
    }
  }

  const handleRemoveSalesOrder = (orderId: number) => {
    setSelectedSalesOrders(prev => prev.filter(order => order.id !== orderId))
  }

  const handleBlendSelect = (blendName: string, lineId: number, checked: boolean) => {
    if (checked) {
      setSelectedBlends(prev => {
        const existingBlend = prev.find(b => b.blendName === blendName)
        if (existingBlend) {
          return prev.map(b => 
            b.blendName === blendName 
              ? { ...b, quantities: { ...b.quantities, [lineId]: 0 } }
              : b
          )
        } else {
          return [...prev, { blendName, quantities: { [lineId]: 0 } }]
        }
      })
    } else {
      setSelectedBlends(prev => 
        prev.map(b => 
          b.blendName === blendName 
            ? { ...b, quantities: Object.fromEntries(Object.entries(b.quantities).filter(([id]) => id !== lineId.toString())) }
            : b
        ).filter(b => Object.keys(b.quantities).length > 0)
      )
    }
  }

  const handleBlendQuantityChange = (blendName: string, lineId: number, quantity: number) => {
    setSelectedBlends(prev =>
      prev.map(b => 
        b.blendName === blendName 
          ? { ...b, quantities: { ...b.quantities, [lineId]: quantity } }
          : b
      )
    )
  }

  const handleAllocateFullQuantity = (blendName: string, lineId: number, fullQuantity: number) => {
    setSelectedBlends(prev =>
      prev.map(b => 
        b.blendName === blendName 
          ? { ...b, quantities: { ...b.quantities, [lineId]: fullQuantity } }
          : b
      )
    )
  }

  const calculateTotalDemand = () => {
    return selectedBlends.map(blend => ({
      blendName: blend.blendName,
      totalQuantity: Object.values(blend.quantities).reduce((sum, q) => sum + q, 0)
    }))
  }

  const handleConfirm = async () => {
    setIsConfirming(true)
    if (isEditBlend) {
      editExistingBlend()
    } else {
      createNewBlend()
    }
  }

  const editExistingBlend = async () => {
    let sendData : any = [];

    selectedAllocations.forEach((item, index) => {
      if (initialSalesOrders.current.length > index) {
        if (initialSalesOrders.current[index].blending_qty != item.blending_qty) {
          sendData.push({
            id: item.id,
            quantity: item.blending_qty
          })
        }
      }
    })

    try {
      await updateSalesOrder({
        allocations: sendData
      })
      toast({
        title: "Blend Updated",
        description: `Updated blend successfully`,
        variant: "default",
      })
      resetData()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const createNewBlend = async () => {
    let mainObj: {
      partner_id: number;
      products: {
        product_id: number;
        quantity: number;
        allocations: {
          sale_order_line_id: number;
          quantity: number;
        }[]
      }[]
    } = {
      partner_id: selectedPartnerId,
      products: []
    };

    groupedDemands.forEach(dem => {
      let obj : any = {
        product_id: dem.product_id,
        quantity: dem.total,
        allocations: []
      }
      let allocations : any = []
      const allData = selectedAllocations.filter(item => item.product_id == dem.product_id)
      if (allData.length > 0) {
        allocations = allData.map(item => {
          return {
            sale_order_line_id: item.line_id,
            quantity: item.blending_qty
          }
        })
      }
      obj.allocations = allocations;

      mainObj.products.push(obj);
    })

    try {
      await blendCreate(mainObj)
      toast({
        title: "Blend Created",
        description: `Created blend successfully`,
        variant: "default",
      })
      resetData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create blend. Please try again.",
        variant: "destructive",
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
        title: "Blend Updated",
        description: `Updated blend: ${editingBlend.name}`,
      })
    } catch (error) {
      console.error('Error updating blend:', error)
      toast({
        title: "Error",
        description: "Failed to update blend. Please try again.",
        variant: "destructive",
      })
    }
  }

  function groupByProductNameAndSum(): TotalDemand[] {
    const grouped = selectedAllocations.reduce((acc: Record<string, { total: number, product_id: number }>, order) => {
      // If the product_name already exists, add the tea_weight to the total
      if (acc[order.product_name]) {
        acc[order.product_name].total += 1;
      } else {
        // Otherwise, initialize it with the current tea_weight and product_id
        acc[order.product_name] = {
          total: 1,
          product_id: order.product_id // Add product_id here
        };
      }
      return acc;
    }, {});
  
    // Convert the grouped object to an array of { product_id, product_name, total }
    return Object.entries(grouped).map(([product_name, { total, product_id }]) => ({
      product_name,
      product_id,
      total,
    }));
  }

  useEffect(() => {
    if (selectedAllocations.length > 0) {
      setGroupedDemands(groupByProductNameAndSum());
    }
  }, [selectedAllocations])

  const onNewBlendDataAdd = (data: CustomerFullBlends) => {
    setIsEditBlend(false);
    setSelectedAllocations(data.products);
  }

  const resetData = () => {
    setSelectedAllocations([]);
    setGroupedDemands([]);
    setSelectedPartnerId(0)
    fetchBlends();
  }

  const resetBlendData = () => {
    setSelectedAllocations([]);
    setGroupedDemands([]);
    fetchBlends(false);
  }

  const onEditPressed = (blend: TeaBlend) => {
    getBlendData(blend.name);
  }

  const getBlendData = async (name: string) => {
    try {
      const data = await getBlendByBlendNo(name);
      setEditingData(data[0]);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const setEditingData = (blend: TeaBlend) => {
    setIsEditBlend(true);
    const allocations : CustomerOrdersTableData[] = []
    blend.allocations.forEach(alloc => {
      const tableData : CustomerOrdersTableData = {
        contract_number: alloc.contract_number,
        contract_line_no: alloc.contract_no,
        product_internal_ref: alloc.product_internal_ref,
        product_uom_qty: 0,
        product_uom: "",
        product_name: alloc.product_name,
        product_blend_internal_ref: alloc.product_internal_ref,
        blend_details: "",
        tea_weight: 0,
        allocated_blend_quantity: alloc.allocated_blend_quantity,
        product_id: alloc.product_id,
        release_number: 1,
        blending_qty: alloc.tea_weight ? alloc.tea_weight - alloc.allocated_blend_quantity : 0,
        standard: "",
        line_id: 0,
        id: alloc.id
      }
      allocations.push(tableData);
    })
    setEditingBlendCustomer({
      id: blend.customer_id,
      name: blend.customer_name
    })
    setEditingBlendId(blend.id)
    setSelectedPartnerId(blend.customer_id)
    setSelectedAllocations(allocations);
    initialSalesOrders.current = JSON.parse(JSON.stringify(allocations));
  }

  const allocationsDeleted = (ids: number[]) => {
    setSelectedAllocations(prev => prev.filter((a: any) => !ids.includes(a.id)))
  }


  const customerSelected = (id: number) => {
    setSelectedPartnerId(id);
  }

  useEffect(() => {
    if (selectedPartnerId) {
      resetBlendData()
    }
  }, [selectedPartnerId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchConfirmedSaleOrders} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container w-full p-4 flex flex-row ml-0 mr-0">
      {/* Left Side - Blends */}
      <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4 ml-0">
        <BlendsList 
          customerId={selectedPartnerId}
          blends={blends} 
          fetchBlends={fetchBlends} 
          onNewBlendDataAdd={onNewBlendDataAdd} 
          onEditPress={onEditPressed}
        />
      </div>

      {/* Middle - Blend Creation */}
      <div className="w-full md:w-1/2 mb-4 md:mb-0 md:mr-4">

        <CustomerSelection
          customers={customers} 
          selectedCustomer={editingBlendCustomer}
          customerSelected={customerSelected} />

        <BlendCreation
          isEdit={isEditBlend}
          selectedBlends={selectedBlends}
          isConfirming={isConfirming}
          handleConfirm={handleConfirm}
          blendItems={selectedAllocations}
          allocationsChanged={setSelectedAllocations}
          deleted={allocationsDeleted}
          customerId={selectedPartnerId}
          blendId={editingBlendId}
        />
      </div>

      {/* Right Side - Total Demand */}
      <div className="w-full md:w-1/4">
        <TotalDemandCard totalDemand={groupedDemands} />
      </div>

      {/* Edit Blend Dialog */}
      {editingBlend && (
        <EditBlendDialog
        editingBlend={editingBlend}
        setEditingBlend={setEditingBlend}
        handleUpdateBlend={handleUpdateBlend}
      />
      )}
    </div>
  )
}
import { useCallback } from 'react'
import useApiClient from './useApiClient'
import { AxiosRequestConfig } from 'axios'
import {
  AddAllocationArray,
  AddAllocationObject,
  AddSalesAllocation,
  AllocationUpdate,
  BatchAllocationUpdateRequest,
  BlendCreateReq,
  ConfirmedSaleOrder,
} from '@/components/types'

interface CustomConfig extends AxiosRequestConfig {
  url: string
  errorMessage: string
}

export const useApiMethods = () => {
  const apiClient = useApiClient()

  // Get confirmed sale  search component
  const getSalesContractDetailsByCustomerId = useCallback(
    async (customerId: number) => {
      const config: CustomConfig = {
        url: `/api/salesOrder/get_contract_details/${customerId}`,
        errorMessage:
          'Error fetching customer sales details. Please try again.',
        method: 'get',
      }
      try {
        const response = await apiClient(config)
        const data: ConfirmedSaleOrder[] = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Get confirmed sale orders
  const getConfirmedSaleOrders = useCallback(async () => {
    const config: CustomConfig = {
      url: '/api/salesOrder/get_confirmed_orders',
      errorMessage: 'Error fetching confirmed sale orders. Please try again.',
      method: 'get',
    }
    try {
      const response = await apiClient(config)
      const data: ConfirmedSaleOrder[] = response.data
      return data
    } catch (error) {
      throw new Error(config.errorMessage)
    }
  }, [apiClient])

  // Get Blends
  const getBlends = useCallback(async () => {
    const config: CustomConfig = {
      url: '/api/blend',
      errorMessage: 'Error fetching blends. Please try again.',
      method: 'get',
    }
    try {
      const response = await apiClient(config)
      const data = response.data
      return data
    } catch (error) {
      throw new Error(config.errorMessage)
    }
  }, [apiClient])

  // Get Tea blend sales
  const getTeaBlendSales = useCallback(
    async (saleOrderNumber: string) => {
      const config: CustomConfig = {
        url: `/api/salesOrder/get_tea_blend_sales?sale_order_number=${saleOrderNumber}`,
        errorMessage: 'Error fetching sales order details. Please try again.',
        method: 'get',
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        if (data.length > 0) {
          return data[0]
        } else {
          throw new Error('Empty')
        }
      } catch (error: any) {
        if (error.message == 'Empty') {
          throw new Error('No data found for the selected sales order')
        } else {
          throw new Error(config.errorMessage)
        }
      }
    },
    [apiClient],
  )

  // Create blend
  const createBlend = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: '/api/blend',
        errorMessage: 'Failed to create blends. Please try again.',
        method: 'POST',
        data: data,
      }

      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Update blend
  const updateBlend = useCallback(
    async (blendId: number, data: any) => {
      const config: CustomConfig = {
        url: `/api/blend?id=${blendId}`,
        errorMessage: 'Failed to update blends. Please try again.',
        method: 'PUT',
        data: data,
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Delete blend
  const deleteBlend = useCallback(
    async (blendId: number) => {
      const config: CustomConfig = {
        url: `/api/blend?id=${blendId}`,
        errorMessage: 'Failed to delete blends. Please try again.',
        method: 'delete',
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Get all auction data
  const getAllAuctionData = useCallback(async () => {
    const config: CustomConfig = {
      url: '/api/auctionData',
      errorMessage: 'Error fetching data. Please try again.',
      method: 'get',
    }
    try {
      const response = await apiClient(config)
      const data = response.data
      return data
    } catch (error) {
      throw new Error(config.errorMessage)
    }
  }, [apiClient])
  // Get all lot data
  const getAllLotData = useCallback(async () => {
    const config: CustomConfig = {
      url: '/api/auctionData/allData',
      errorMessage: 'Error fetching data. Please try again.',
      method: 'get',
    }
    try {
      const response = await apiClient(config)
      const data = response.data
      return data
    } catch (error) {
      throw new Error(config.errorMessage)
    }
  }, [apiClient])

  // Get Blend data by id
  const getBlendById = useCallback(
    async (id: string) => {
      const config: CustomConfig = {
        url: '/api/blend/blendByBlendNo?id=' + id,
        errorMessage: 'Error fetching data. Please try again.',
        method: 'get',
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )
  // Get Blend data by id and type
  const getSourceById = useCallback(
    async (id: string, type: string) => {
      const config: CustomConfig = {
        url: `/api/blend/source?id=${id}&type=${type}`,
        errorMessage: 'Error fetching data. Please try again.',
        method: 'get',
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Add allocation to blend
  const addAllocationtoBlend = useCallback(
    async (data: AddAllocationArray) => {
      const config: CustomConfig = {
        url: '/api/blend/addManufacturingAllocations',
        errorMessage: 'An error occurred while Adding Allocations.',
        method: 'post',
        data: data,
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Update allocations
  const updateAllocations = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: `/api/blend/updateManufacturingAllocations`,
        errorMessage: 'An error occurred while Updating Allocations.',
        method: 'put',
        data: data,
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Get lot info by id
  const getLotInfoById = useCallback(
    async (id: number) => {
      const config: CustomConfig = {
        url: `/api/auctionData/lotsById?id=${id}`,
        errorMessage: 'An error occurred while fetching details.',
        method: 'get',
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Get Custoers
  const getCustomers = useCallback(async () => {
    const config: CustomConfig = {
      url: `/api/customers`,
      errorMessage: 'An error occurred while fetching Customers.',
      method: 'get',
    }
    try {
      const response = await apiClient(config)
      const data = response.data
      return data
    } catch (error) {
      throw new Error(config.errorMessage)
    }
  }, [apiClient])

  // Get Customer sales orders
  const getCustomerOrders = useCallback(
    async (id: number) => {
      const config: CustomConfig = {
        url: `/api/customers/orderLines?id=${id}`,
        errorMessage: 'An error occurred while fetching Orders.',
        method: 'get',
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Create Blend
  const blendCreate = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: `/api/blend/createBlend`,
        errorMessage: 'An error occurred while creating blend.',
        method: 'post',
        data: data,
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Get blend info
  const updateSalesOrder = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: `/api/blend/updateSalesAllocations`,
        errorMessage: 'An error occurred while updating blend data.',
        method: 'put',
        data: data,
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Delete Manufacture Allocations
  const deleteManufactureAllocs = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: `/api/blend/deleteManufacallocations`,
        errorMessage: 'An error occurred while deleting allocations',
        method: 'post',
        data: data,
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Delete Manufacture Allocations
  const deleteSalesAllocs = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: `/api/blend/deleteSalesallocations`,
        errorMessage: 'An error occurred while deleting allocations',
        method: 'post',
        data: {
          allocation_ids: data,
        },
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Add sales allocation to blend
  const addSalesAllocationtoBlend = useCallback(
    async (data: AddSalesAllocation[]) => {
      const config: CustomConfig = {
        url: '/api/blend/addSalesAllocations',
        errorMessage: 'An error occurred while Adding Allocations.',
        method: 'post',
        data: {
          allocations: data,
        },
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Get blend by blend number
  const getBlendByBlendNo = useCallback(
    async (id: string) => {
      const config: CustomConfig = {
        url: '/api/blend/getBlendByBlendNo?id=' + id,
        errorMessage: 'An error occurred while Adding Allocations.',
        method: 'get',
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Get blends by customer id
  const getBlendByCustomer = useCallback(
    async (id: number) => {
      const config: CustomConfig = {
        url: '/api/blend/getBlendsbyCustomer?id=' + id,
        errorMessage: 'An error occurred while Fetching Blends.',
        method: 'get',
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error: any) {
        throw new Error(error.response.data.error)
      }
    },
    [apiClient],
  )

  // Get blends by customer id
  const editPackageAllocation = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: '/api/package/allocate',
        errorMessage: 'An error occurred while adding allocations.',
        method: 'post',
        data: data,
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error: any) {
        throw new Error(error.response.data.error)
      }
    },
    [apiClient],
  )

  // Split package allocation
  const splitPackage = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: '/api/package/split',
        errorMessage: 'An error occurred while splitting allocations.',
        method: 'post',
        data: data,
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error: any) {
        throw new Error(error.response.data.error)
      }
    },
    [apiClient],
  )

  const blendConfirm = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: '/api/blend/confirmBlend',
        errorMessage: 'An error occurred while adding allocations.',
        method: 'post',
        data: data,
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error: any) {
        throw new Error(error.response.data.error)
      }
    },
    [apiClient],
  )
  const blendReset = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: '/api/blend/resetBlend',
        errorMessage: 'An error occurred while adding allocations.',
        method: 'post',
        data: data,
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error: any) {
        throw new Error(error.response.data.error)
      }
    },
    [apiClient],
  )
  // Get Customer sales orders
  const getCustomerBlendOrders = useCallback(
    async (id: number) => {
      const config: CustomConfig = {
        url: `/api/tea-blend/orderLines?id=${id}`,
        errorMessage: 'An error occurred while fetching Orders.',
        method: 'get',
      }
      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )

  // Create blend
  const createNewBlend = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: 'api/tea-blend/createBlend',
        errorMessage: 'Failed to create blends. Please try again.',
        method: 'POST',
        data: data,
      }

      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )
  // Update blend
  // const updateNewBlend = async (blendData: any) => {
  //   try {
  //     const response = await fetch('/api/tea-blend/updateBlend', {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(blendData),
  //     })
  //     const result = await response.json()
  //     console.log(result)
  //   } catch (error) {
  //     console.error('Error updating blend:', error)
  //   }
  //   ;[apiClient]
  // }

  // In your useApiMethods.ts file
  const updateNewBlend = async (data: BatchAllocationUpdateRequest | AllocationUpdate): Promise<any> => {
    const response = await fetch('/api/tea_blend/update_allocation', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update allocations');
    }

    return response.json();
  };

  
  // Add Allocation
  const addAllocation = useCallback(
    async (data: any) => {
      const config: CustomConfig = {
        url: 'api/tea-blend/addAllocation',
        errorMessage: 'Failed to Add Allocation. Please try again.',
        method: 'POST',
        data: data,
      }

      try {
        const response = await apiClient(config)
        const data = response.data
        return data
      } catch (error) {
        throw new Error(config.errorMessage)
      }
    },
    [apiClient],
  )
  return {
    getConfirmedSaleOrders,
    getBlends,
    getTeaBlendSales,
    createBlend,
    updateBlend,
    deleteBlend,
    getAllAuctionData,
    getBlendById,
    addAllocationtoBlend,
    updateAllocations,
    getLotInfoById,
    getCustomers,
    getCustomerOrders,
    blendCreate,
    updateSalesOrder,
    deleteManufactureAllocs,
    deleteSalesAllocs,
    addSalesAllocationtoBlend,
    getBlendByBlendNo,
    getBlendByCustomer,
    editPackageAllocation,
    splitPackage,
    blendConfirm,
    blendReset,
    getSourceById,
    getAllLotData,
    getCustomerBlendOrders,
    createNewBlend,
    updateNewBlend,
    addAllocation,
  }
}

import React, { useCallback, useEffect, useState } from 'react'
// import BlendForm from "./BlendForm"
import { Tea, BlendAllocation } from './types'
import BlendsList from './BlendHeaderCreationViewComponents/BlendsList'
import { Blend } from './types'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from './ui/button'
import { useApiMethods } from '@/hooks/useApiMethods'
import AllocationTableView from './AllocationTableView'

interface AllocationViewProps {
  availableTeas: Tea[]
  setAvailableTeas: React.Dispatch<React.SetStateAction<Tea[]>>
  blendAllocations: BlendAllocation[]
  setBlendAllocations: React.Dispatch<React.SetStateAction<BlendAllocation[]>>
  blendNameSequence: number
  setBlendNameSequence: React.Dispatch<React.SetStateAction<number>>
  blendNumberSequence: number
  setBlendNumberSequence: React.Dispatch<React.SetStateAction<number>>
}

export default function AllocationView({
  availableTeas,
  setAvailableTeas,
  blendAllocations,
  setBlendAllocations,
  blendNameSequence,
  setBlendNameSequence,
  blendNumberSequence,
  setBlendNumberSequence,
}: AllocationViewProps) {
  const [editingBlendId, setEditingBlendId] = useState<string | null>(null)
  // const [newBlend, setNewBlend] = useState<BlendAllocation>({
  //   id: "",
  //   name: "",
  //   blendNo: "",
  //   allocations: [],
  //   totalQuantity: 0,
  //   toAllocate: 0,
  //   balance: 0,
  //   status: 'draft',
  //   createdAt: new Date()
  // })
  const [isLoading, setIsLoading] = useState(false)
  const [blends, setBlends] = useState<Blend[]>([])
  const [error, setError] = useState<string | null>(null)
  const { getBlends } = useApiMethods()

  const fetchBlends = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getBlends()
      // Transform the data to match our Blend type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedBlends: Blend[] = Object.values(data).map(
        (blend: any) => ({
          id: blend.id,
          name: blend.name,
          blendName: blend.blendName,
          quantity: blend.quantity,
          status: blend.status,
          allocations: blend.allocations,
        }),
      )
      setBlends(transformedBlends)
    } catch (err) {
      setError('Error fetching blends. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchTeaCost = async (blendId: string): Promise<number> => {
    try {
      // Assume some API call here to get the tea cost for a blend
      // const response = await fetch(`/api/teaCost?blendId=${blendId}`);
      // const data = await response.json();
      return 23
    } catch (error) {
      console.error('Error fetching tea cost:', error)
      return 0 // Fallback cost
    }
  }

  // useEffect(() => {
  //   fetchBlends()
  // }, [fetchBlends])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchBlends} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 ">
      {/* <div className="p-4">
      <BlendsList blends={blends} fetchBlends={fetchBlends}/>
      </div> */}
      <AllocationTableView />
      {/* <BlendForm
        newBlend={newBlend}
        setNewBlend={setNewBlend}
        editingBlendId={editingBlendId}
        setEditingBlendId={setEditingBlendId}
        availableTeas={availableTeas}
        setAvailableTeas={setAvailableTeas}
        blendAllocations={blendAllocations}
        setBlendAllocations={setBlendAllocations}
        blendNameSequence={blendNameSequence}
        setBlendNameSequence={setBlendNameSequence}
        blendNumberSequence={blendNumberSequence}
        setBlendNumberSequence={setBlendNumberSequence} 
        fetchTeaCost={fetchTeaCost}      
        /> */}
    </div>
  )
}

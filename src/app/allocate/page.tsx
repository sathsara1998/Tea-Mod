'use client'
import AllocationView from '@/components/AllocationView'
import ThemeToggle from '@/components/ThemeToggle'
import { BlendAllocation, Tea } from '@/components/types'
import { generateTeas } from '@/lib/utils'
import React, { useState } from 'react'

const Page: React.FC = () => {

    
  const [availableTeas, setAvailableTeas] = useState<Tea[]>(generateTeas())
  const [blendAllocations, setBlendAllocations] = useState<BlendAllocation[]>([])
  const [blendNameSequence, setBlendNameSequence] = useState(567)
  const [blendNumberSequence, setBlendNumberSequence] = useState(1000001)
    return (
        <>
         <AllocationView
          availableTeas={availableTeas}
          setAvailableTeas={setAvailableTeas}
          blendAllocations={blendAllocations}
          setBlendAllocations={setBlendAllocations}
          blendNameSequence={blendNameSequence}
          setBlendNameSequence={setBlendNameSequence}
          blendNumberSequence={blendNumberSequence}
          setBlendNumberSequence={setBlendNumberSequence}
        />   
                <ThemeToggle />

        </>
    )
}

export default Page;
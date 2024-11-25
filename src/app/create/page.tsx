'use client'
import React, { Suspense } from 'react'
import BlendHeaderCreationView from "@/components/BlendHeaderCreationView"


const page: React.FC= () => {
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <BlendHeaderCreationView/>
            </Suspense>
        </div>
    )
}

export default page;
import React from 'react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-60 animate-pulse flex-col items-center gap-4">
        <div>
          <div className="h-6 w-48 rounded-md bg-slate-400"></div>
          <div className="mx-auto mt-3 h-4 w-28 rounded-md bg-slate-400"></div>
        </div>
        <div className="h-7 w-full rounded-md bg-slate-400"></div>
        <div className="h-7 w-full rounded-md bg-slate-400"></div>
        <div className="h-7 w-full rounded-md bg-slate-400"></div>
        <div className="h-7 w-1/2 rounded-md bg-slate-400"></div>
      </div>
    </div>
  )
}

export default LoadingSpinner

"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TabulatorFull as Tabulator } from "tabulator-tables"
import "tabulator-tables/dist/css/tabulator_semanticui.min.css"
import { createRoot } from "react-dom/client"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"
import { Search } from "lucide-react"
import type { StoreSample } from "../types/store_sample"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export default function StoreMonitorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [samples, setSamples] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentSample, setCurrentSample] = useState<StoreSample | null>(null)

  const tableRef = useRef<HTMLDivElement | null>(null)
  const tableInstance = useRef<Tabulator | null>(null)

  // Fetch store samples data
  const fetchStoreSamples = async () => {
    try {
      setLoading(true)

      const response = await axios.get("https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/store_sample")
      setSamples(response.data)
      console.log("Transformed store samples:", samples);
    } catch (error) {
      console.error("Error fetching store samples:", error)
    } finally {
      setLoading(false)
    }
  }

  // Initialize Tabulator
  useEffect(() => {
    if (tableRef.current && samples.length > 0) {
      // Clean up any existing table instance
      if (tableInstance.current) {
        tableInstance.current.destroy()
        tableInstance.current = null
      }

      // Create the Tabulator instance
      tableInstance.current = new Tabulator(tableRef.current, {
        data: samples,
        layout: "fitColumns",
        pagination: true,
        paginationSize: 10,
        columns: [
          { title: "Reference", field: "reference", headerSort: true },
          { title: "Requested Date", field: "requestedDate", headerSort: true },
          { title: "Trader", field: "trader", headerSort: true },
          { title: "Customer", field: "customer", headerSort: true },
          { title: "Qty", field: "quantity", headerSort: true },
          { title: "Contract No", field: "contractNo", headerSort: true },
          { title: "Blend No", field: "blendNo", headerSort: true },
          { title: "S/Line Q", field: "straightLineQuantity", headerSort: true },
          { title: "Prop Q", field: "propQuantity", headerSort: true },
          { title: "Standard", field: "standard", headerSort: true },
          {
            title: "Status",
            field: "status",
            headerSort: true,
            formatter: (cell) => {
              const status = cell.getValue() as string
              const container = document.createElement("div")
              const root = createRoot(container)

              root.render(
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    status === "Done" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {status}
                </span>,
              )

              return container
            },
          },
          {
            title: "Action",
            field: "action",
            headerSort: false,
            formatter: (cell) => {
              const rowData = cell.getRow().getData() as StoreSample
              const container = document.createElement("div")
              const root = createRoot(container)

              root.render(
                <Button
                  size="sm"
                  disabled={rowData.status === "Done"}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentSample(rowData)
                    setShowConfirmDialog(true)
                  }}
                >
                  Sample sent
                </Button>,
              )

              return container
            },
          },
        ],
      })
    }

    return () => {
      if (tableInstance.current) {
        tableInstance.current.destroy()
        tableInstance.current = null
      }
    }
  }, [samples])

  // Fetch data on component mount
  useEffect(() => {
    fetchStoreSamples()
  }, [])

  // Handle search
  useEffect(() => {
    if (tableInstance.current && searchQuery) {
      tableInstance.current.setFilter(
        [
          { field: "reference", type: "like", value: searchQuery },
          { field: "customer", type: "like", value: searchQuery },
          { field: "standard", type: "like", value: searchQuery },
        ],
        "or",
      )
    } 
    // else if (tableInstance.current) {
    //   tableInstance.current.clearFilter()
    // }
  }, [searchQuery])

  const fintUpdated = async(sample:any) =>{
    const response = await axios.put(
      `https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/store_sample/${sample.id}`,
      sample,
    )
  }

  // Handle sending a sample
  const handleSendSample = async () => {
    if (!currentSample) {
      toast({
        variant: "destructive",
        title: "No sample selected",
        description: "Please select a sample to send.",
        duration: 3000,
      })
      return
    }

    try {
      // In a real app, you would update the sample in the database
      // For now, we'll just update the local state
      const updatedSamples = samples.map((sample) => {
        if (sample.id === currentSample.id) {
          return { ...sample, status: "Done" }
        }
        return sample
      })

      updatedSamples.map((sample)=>{
        if(sample.status === "Done"){
          fintUpdated(sample)   
        }
      })

      setSamples(updatedSamples)
      setCurrentSample(null)

      // Update the table data
      if (tableInstance.current) {
        tableInstance.current.setData(updatedSamples)
      }

      toast({
        variant: "success",
        title: "Sample sent successfully",
        description: `The sample has been marked as sent.`,
        duration: 3000,
      })

      // Close the confirmation dialog
      setShowConfirmDialog(false)
    } catch (error) {
      console.error("Error sending sample:", error)
      toast({
        variant: "destructive",
        title: "Error sending sample",
        description: "There was an error sending the sample. Please try again.",
        duration: 3000,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading store samples...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="bg-white ">
        <div className="p-4 ">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Stores sample point</h1>
            {/* <div>
              <Button variant="outline" onClick={() => router.push("/sample")}>
                Back to Samples
              </Button>
            </div> */}
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <div ref={tableRef} className="w-full"></div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Sample Dispatch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this sample as sent? This action will change the status from "Pending" to
              "Done".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendSample}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

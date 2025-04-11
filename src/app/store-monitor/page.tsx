"use client"
import { useEffect, useState, useRef } from "react"
import { createRoot } from "react-dom/client"
import { useRouter } from "next/navigation"
// Shadcn Ui Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// tabulator table
import { TabulatorFull as Tabulator } from "tabulator-tables"
import "tabulator-tables/dist/css/tabulator_semanticui.min.css"
//axios
import axios from "axios"
// lucide icons
import { Search, Info } from "lucide-react"
// types
import type { StoreSample } from "../types/store_sample"

// Tea Tang brand colors
const BRAND_COLORS = {
  primary: "#875A7B", // purppl
  secondary: "#FFFFFF", // White
  accent: "#875A7B", // light purpel for hover states
  text: "#333333",
  background: "#FFFFFF",
}

export default function StoreMonitorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [samples, setSamples] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentSample, setCurrentSample] = useState<StoreSample | null>(null)
  const [tableInitialized, setTableInitialized] = useState(false)
  // Add these state variables after the other state declarations (around line 40)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // State for standard details dialog
  const [showStandardDetails, setShowStandardDetails] = useState(false)
  const [standardDetails, setStandardDetails] = useState<{
    name: string
    details: Record<string, any>
  }>({ name: "", details: {} })

  const tableRef = useRef<HTMLDivElement | null>(null)
  const tableInstance = useRef<Tabulator | any>(null)

  // you can change this get API url store sample
  const backendUri = "https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/store_sample/"

  // Fetch store samples data
  const fetchStoreSamples = async () => {
    try {
      setLoading(true)
      const response = await axios.get(backendUri)
      setSamples(response.data)
      console.log("Fetched store samples:", response.data)
    } catch (error) {
      console.error("Error fetching store samples:", error)
    } finally {
      setLoading(false)
    }
  }

  // Function to show standard details

  const handleShowStandardDetails = (rowData: any) => {
    setStandardDetails({
      name: rowData.requested_sample_name || rowData.standard,
      details: {
        Reference: rowData.reference || "N/A",
        Customer: rowData.customer || "N/A",
        Standard: rowData.standard || "N/A",
        "Requested Date": rowData.requestedDate || "N/A",
        Quantity: rowData.quantity || "N/A",
        Trader: rowData.trader || "N/A",
        Status: rowData.status || "N/A",
      },
    })
    setShowStandardDetails(true)
  }

  // Initialize Tabulator
  const initializeTable = () => {
    if (!tableRef.current || tableInstance.current || samples.length === 0) return

    try {
      // Ensure the table container has a defined height
      if (tableRef.current) {
        tableRef.current.style.minHeight = "400px"
      }
      // Create the Tabulator instance
      tableInstance.current = new Tabulator(tableRef.current, {
        data: samples,
        layout: "fitColumns",
        pagination: true,
        paginationSize: 20,
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
          {
            title: "Standard",
            field: "standard",
            headerSort: true,
            formatter: (cell) => {
              const value = cell.getValue() as string
              const rowData = cell.getRow().getData()
              const displayName = rowData.requested_sample_name || value
              const container = document.createElement("div")
              const root = createRoot(container)

              root.render(
                <div
                  className="flex items-center space-x-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShowStandardDetails(rowData)
                  }}
                >
                  <span>{displayName}</span>
                  <Info size={14} className="text-[#875A7B] hover:text-[#875A7B]" />
                </div>,
              )

              return container
            },
          },
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
                  className="bg-[#875A7B] hover:bg-[#875A7B] text-white"
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

      setTableInitialized(true)

      // Apply search filter if there's a query
      if (searchQuery && tableInstance.current) {
        applySearchFilter(searchQuery)
      }
    } catch (error) {
      console.error("Error initializing table:", error)
    }
  }

  // Apply search filter
  const applySearchFilter = (query: string) => {
    if (!tableInstance.current) return

    if (query) {
      const lowercaseQuery = query.toLowerCase()

      // Use standard Tabulator filtering with a custom filter function
      tableInstance.current.setFilter((data: any) => {
        // Search in reference field
        if (data.reference && data.reference.toLowerCase().includes(lowercaseQuery)) {
          return true
        }

        // Search in customer field
        if (data.customer && data.customer.toLowerCase().includes(lowercaseQuery)) {
          return true
        }

        // Search in standard field
        if (data.standard && data.standard.toLowerCase().includes(lowercaseQuery)) {
          return true
        }

        return false
      })
    } else {
      tableInstance.current.clearFilter()
    }
  }

  // Add this function after the applySearchFilter function (around line 190)
  const applyStatusFilter = (status: string) => {
    if (!tableInstance.current) return

    if (status && status !== "all") {
      tableInstance.current.setFilter("status", "=", status)
    } else {
      // If "all" is selected, clear the status filter but keep any search filter
      tableInstance.current.removeFilter("status")
      // Re-apply search filter if it exists
      if (searchQuery) {
        applySearchFilter(searchQuery)
      }
    }
  }

  // Initialize table when data is available
  useEffect(() => {
    if (samples.length > 0 && tableRef.current && !tableInitialized) {
      // Use setTimeout to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        initializeTable()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [samples])

  // Handle search query changes
  useEffect(() => {
    if (tableInstance.current && tableInitialized) {
      applySearchFilter(searchQuery)
    }
  }, [searchQuery, tableInitialized])

  // Add this effect to handle status filter changes (after the search query effect)
  useEffect(() => {
    if (tableInstance.current && tableInitialized) {
      applyStatusFilter(statusFilter)
    }
  }, [statusFilter, tableInitialized])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (tableInstance.current) {
        try {
          tableInstance.current.destroy()
        } catch (e) {
          console.error("Error destroying table:", e)
        }
        tableInstance.current = null
      }
      setTableInitialized(false)
    }
  }, [])

  // Fetch data on component mount
  useEffect(() => {
    fetchStoreSamples()
  }, [])

  // update data
  const fintUpdated = async (sample: any) => {
    try {
      const response = await axios.put(`${backendUri + sample.id}`, sample)
      return response.data
    } catch (error) {
      console.error("Error updating sample:", error)
      throw error
    }
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
      // update the sample in the database
      const updatedSamples = samples.map((sample) => {
        if (sample.id === currentSample.id) {
          return { ...sample, status: "Done" }
        }
        return sample
      })

      // Update samples that have status "Done"
      const updatePromises = updatedSamples
        .filter((sample) => sample.status === "Done")
        .map((sample) => fintUpdated(sample))

      await Promise.all(updatePromises)

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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#875A7B] mx-auto"></div>
          <p className="mt-4">Loading store samples...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="bg-white">
        <div className="p-4 bg-[#875A7B] text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-XUWqp10SrqLFPpCq4p2mXus0hcvi8O.png"
                  alt="Tea Tang Logo"
                  className="object-contain"
                  width={40}
                  height={40}
                />
              </div>
              <h1 className="text-xl font-semibold">Stores sample point</h1>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4">
            {/* Search bar and filter buttons in the same row */}
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[#875A7B] focus:ring-[#875A7B]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  className={
                    statusFilter === "all"
                      ? "bg-[#875A7B] hover:bg-[#875A7B] text-white"
                      : "border-[#875A7B] text-[#875A7B] hover:bg-[#875A7B]/10"
                  }
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "Pending" ? "default" : "outline"}
                  onClick={() => setStatusFilter("Pending")}
                  className={
                    statusFilter === "Pending"
                      ? "bg-[#875A7B] hover:bg-[#875A7B] text-white"
                      : "border-[#875A7B] text-[#875A7B] hover:bg-[#875A7B]/10"
                  }
                >
                  Pending
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "Done" ? "default" : "outline"}
                  onClick={() => setStatusFilter("Done")}
                  className={
                    statusFilter === "Done"
                      ? "bg-[#875A7B] hover:bg-[#875A7B] text-white"
                      : "border-[#875A7B] text-[#875A7B] hover:bg-[#875A7B]/10"
                  }
                >
                  Done
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div ref={tableRef} className="w-full min-h-[400px]"></div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="border-[#875A7B]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#875A7B]">Confirm Sample Dispatch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this sample as sent? This action will change the status from "Pending" to
              "Done".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#875A7B] text-[#875A7B]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendSample} className="bg-[#875A7B] hover:bg-[#875A7B] text-white">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Standard Details Dialog */}
      <Dialog open={showStandardDetails} onOpenChange={setShowStandardDetails}>
        <DialogContent className="sm:max-w-md border-[#875A7B]">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-XUWqp10SrqLFPpCq4p2mXus0hcvi8O.png"
                alt="Tea Tang Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <DialogTitle className="text-xl text-[#875A7B]">{standardDetails.name}</DialogTitle>
            <DialogDescription>Tea standard details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {Object.entries(standardDetails.details).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 items-center gap-4 border-b pb-2">
                <p className="text-sm font-medium text-[#875A7B]">{key}:</p>
                <p className="col-span-2 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

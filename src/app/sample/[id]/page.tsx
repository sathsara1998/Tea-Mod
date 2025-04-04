"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Stepper } from "@/components/ui/stepper"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import type { Sample } from "@/app/types/sample"
import { TabulatorFull as Tabulator } from "tabulator-tables"
import "tabulator-tables/dist/css/tabulator_semanticui.min.css"
import { createRoot } from "react-dom/client"
import { useToast } from "@/components/ui/use-toast"
import { Toast, Toast as toast } from "@/components/ui/toast"
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

// Mock courier services
const courierServices = [
  { id: "courier1", name: "Express Delivery" },
  { id: "courier2", name: "Standard Shipping" },
  { id: "courier3", name: "Premium Logistics" },
  { id: "courier4", name: "Global Transport" },
  { id: "courier5", name: "FedEx" },
]

// Mock storage areas
const storageAreas = ["Main Warehouse", "Temperature Controlled", "Secure Storage", "Quarantine Area", "Tea Room"]

export default function SampleDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [sampleData, setSampleData] = useState<Sample | null>(null)
  const [loading, setLoading] = useState(true)
  const [courierService, setCourierService] = useState("")
  const [storageArea, setStorageArea] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [currentStatus, setCurrentStatus] = useState("Draft")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null)
  const [requestSent, setRequestSent] = useState(false)
  // Add a new state to track the active tab
  const [activeTab, setActiveTab] = useState("inquiry")

  const tableRef = useRef<HTMLDivElement | null>(null)
  const tableInstance = useRef<Tabulator | null>(null)

  // Fetch the sample data
  useEffect(() => {
    const fetchSampleData = async () => {
      try {
        setLoading(true)
        console.log(`Attempting to fetch data for sample ID: ${params.id}`)

        // Try to fetch from the API - note the endpoint has changed to match your code
        const response = await axios.get(
          `https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/tabledata?id=${params.id}`,
        )

        // Check if we got an array or a single object
        const data = Array.isArray(response.data) ? response.data[0] : response.data

        console.log("API response:", data)

        setSampleData(data)
        setCourierService(data.courier_service?.name || "")
        setStorageArea(data.sample_storing_area || "")
        setTrackingNumber( data.tracking_number || "")
        setCurrentStatus(data.status || "Draft")
      } catch (error) {
        console.error("Error fetching sample data:", error)
        console.log("Falling back to mock data")

        // Create mock data with the new structure
        const mockData: Sample = {
          id: params.id,
          reference: `SI-ERM-${params.id.padStart(3, "0")}`,
          creationdate: "2024/12/01",
          ed: "2025/01/02",
          customer: {
            name: "Sigath",
            address: "No 1, Colombo",
            country: "Sri Lanka",
          },
          trader: "Jhonethon",
          status: "Draft",
          requested_samples: [
            {
              
              name: "Chai Tea Srilanka",
              standerd_code: "ahj_jk_005_al",
              net_weight: 200,
              reference: "Get A packing Most Important Sheet",
              store_stat: "Pending",
            },
            {
             
              name: "Herbal Tea Standard",
              standerd_code: "Sdl_Al_0114A_lk",
              net_weight: 100,
              reference: "Get A packing Most Important Sheet",
              store_stat: "Pending",
            },
            {
          
              name: "White Tea Standard",
              standerd_code: "Sdl_Al_0114A_lk",
              net_weight: 300,
              reference: "Get A packing Most Important Sheet",
              store_stat: "Pending",
            },
          ],
          courier_service: {
            name: "FedEx",
            charges: 2500,
          },
          sample_storing_area: "Tea Room",
          tracking_number: "Tra001",
          tracking_stages: {
            handover_to_courier: { date: "2025-04-01", completed: true },
            package_to_collection: { date: "2025-04-02", completed: true },
            package_shipped: { date: "2025-04-03", completed: true },
            package_arrived: { date: "2025-04-04", completed: false },
            picked_by_clearance: { date: "2025-04-05", completed: false },
          },
        }

        setSampleData(mockData)
        setCourierService(mockData.courier_service?.name || "")
        setStorageArea(mockData.sample_storing_area || "")
        setTrackingNumber( mockData.tracking_number || "")
        setCurrentStatus(mockData.status || "Draft")
      } finally {
        setLoading(false)
      }
    }

    fetchSampleData()
  }, [params.id])

  // Initialize Tabulator when sampleData is available
  // Modify the useEffect for Tabulator initialization to respond to tab changes
  useEffect(() => {
    // Only initialize the table if we're on the inquiry tab and have sample data
    if (tableRef.current && sampleData && activeTab === "inquiry") {
      // Clean up any existing table instance
      if (tableInstance.current) {
        tableInstance.current.destroy()
        tableInstance.current = null
      }

      // Format the data for Tabulator
      const tableData = sampleData.requested_samples.map((sample) => ({
        ...sample,
        editable: !requestSent,
      }))

      // Create the Tabulator instance
      tableInstance.current = new Tabulator(tableRef.current, {
        data: tableData,
        layout: "fitColumns",
        columns: [
          { title: "Sample Standard", field: "name", headerSort: true },
          {
            title: "Standard Code",
            field: "standerd_code",
            editor: "input",
            editable: (cell) => cell.getData().editable,
          },
          {
            title: "Net weight (g)",
            field: "net_weight",
            editor: "number",
            editable: (cell) => cell.getData().editable,
          },
          {
            title: "Reference",
            field: "reference",
            editor: "input",
            editable: (cell) => cell.getData().editable,
          },
          { title: "Stores stat", field: "store_stat" },
          {
            title: "Action",
            field: "action",
            formatter: (cell) => {
              const container = document.createElement("div")
              const root = createRoot(container)
              const rowData = cell.getRow().getData()

              root.render(
                <Button
                  size="sm"
                  variant="default"
                  disabled={requestSent || rowData?.store_stat === "Requesting"}
                  onClick={() => {
                    console.log("Clicked Button " + rowData.id);
                    console.log("Clicked Button " + rowData.name);
                    console.log("Clicked Button " + rowData);
                    setSelectedSampleId(rowData.name)
                    setShowConfirmDialog(true)
                  }}
                >
                  Send request 
                </Button>,
              )

              return container
            },
          },
        ],
        footerElement: `<div class="tabulator-footer">
        <div class="tabulator-footer-contents">
          <div class="tabulator-calcs-holder"></div>
          <div class="total-weight">
            <strong>Total Weight:</strong> ${calculateTotalWeight()} g
          </div>
        </div>
      </div>`,
      })
    }

    return () => {
      if (tableInstance.current) {
        tableInstance.current.destroy()
        tableInstance.current = null
      }
    }
  }, [sampleData, requestSent, activeTab]) // Add activeTab as a dependency

  // Calculate total weight of requested samples
  function calculateTotalWeight() {
    if (!sampleData?.requested_samples) return 0
    return sampleData.requested_samples.reduce((sum, sample) => sum + sample.net_weight, 0)
  }

  // Handle sending request to stores
  const handleSendRequest = (sampleId: string) => {
    console.log(sampleId);
    if (!sampleData) return

    // Update the sample status
    const updatedSamples = sampleData.requested_samples.map((sample) => {
      if (sample.name === sampleId) {
        return { ...sample, store_stat: "Requesting" }
      }
      return sample
    })

    // Update the sample data
    setSampleData({
      ...sampleData,
      requested_samples: updatedSamples,
    })

    // Update the table data
    if (tableInstance.current) {
      tableInstance.current.updateData(
        updatedSamples.map((sample) => ({
          ...sample,
          editable: sample.name === sampleId ? false : !requestSent,
        })),
      )
    }

    console.log(`Request sent for sample ID: ${sampleId}`)

    // Show success toast
    toast({
      variant:"success",
      title: "Request Sent",
      description: "Your request has been sent to stores successfully.",
      duration: 3000,
    })
  }

  if (loading || !sampleData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading sample details...</p>
        </div>
      </div>
    )
  }

  // Convert tracking stages to stepper format
  const trackingSteps = [
    {
      title: "Handover to Courier service",
      description: sampleData.tracking_stages.handover_to_courier.date,
      completed: sampleData.tracking_stages.handover_to_courier.completed,
    },
    {
      title: "Package Handover to Collecting center",
      description: sampleData.tracking_stages.package_to_collection.date,
      completed: sampleData.tracking_stages.package_to_collection.completed,
    },
    {
      title: "Package shipped",
      description: sampleData.tracking_stages.package_shipped.date,
      completed: sampleData.tracking_stages.package_shipped.completed,
    },
    {
      title: "Package Arrived to destination airport",
      description: sampleData.tracking_stages.package_arrived.date,
      completed: sampleData.tracking_stages.package_arrived.completed,
    },
    {
      title: "Picked by Clearance company",
      description: sampleData.tracking_stages.picked_by_clearance.date,
      completed: sampleData.tracking_stages.picked_by_clearance.completed,
    },
  ]

  const handleCancel = () => {
    // Only allow cancellation if status is Draft
    if (currentStatus.toLowerCase() === "draft") {
      // Handle cancellation logic here
      alert("Sample request cancelled successfully")
      router.push("/")
    }
  }

  const handleStatusChange = (status: string) => {
    setCurrentStatus(status)
  }

  const handleSave = async () => {
    try {
      // Update the sampleData with the current values
      const updatedData = {
        ...sampleData,
        courier_service: {
          ...sampleData.courier_service,
          name: courierService,
        },
        sample_storing_area: storageArea,
        tracking_number: trackingNumber,
        status: currentStatus,
      }

      // In a real app, you would save this data to your API
      await axios.put(`https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/tabledata/${params.id}`, updatedData);

     alert("Changes saved successfully")
      router.push("/")
    } catch (error) {
      console.error("Error saving data:", error)
      alert("Failed to save changes")
    }
  }

  return (
    <div className=" mx-auto py-6 max-w-full">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/sample")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Samples
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Sample inquiry management system</h2>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={currentStatus === "Draft" ? "default" : "outline"}
                onClick={() => handleStatusChange("Draft")}
              >
                Draft
              </Button>
              <Button
                variant={currentStatus === "Sent" ? "default" : "outline"}
                className={currentStatus === "Sent" ? "bg-blue-500" : ""}
                onClick={() => handleStatusChange("Sent")}
              >
                Sent
              </Button>
              <Button
                variant={currentStatus === "Done" ? "default" : "outline"}
                className={currentStatus === "Done" ? "bg-green-500" : ""}
                onClick={() => handleStatusChange("Done")}
              >
                Done
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between mb-4">
            <Button variant="destructive" onClick={handleCancel} disabled={currentStatus.toLowerCase() !== "draft"}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <Label>Create Date:</Label>
                <span className="ml-2">{sampleData.creationdate}</span>
              </div>
              <div>
                <Label>Reference Number:</Label>
                <span className="ml-2">{sampleData.reference}</span>
              </div>
              <div>
                <Label>Customer Name:</Label>
                <span className="ml-2">{sampleData.customer.name}</span>
              </div>
              <div>
                <Label>Customer Address:</Label>
                <div className="mt-1 text-sm text-gray-600">{sampleData.customer.address}</div>
              </div>
              <div>
                <Label>Customer Country:</Label>
                <div className="mt-1">{sampleData.customer.country}</div>
              </div>
              <div>
                <Label>Trader:</Label>
                <div className="mt-1">{sampleData.trader}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="courier-service">Courier Service:</Label>
                <Select value={courierService} onValueChange={setCourierService}>
                  <SelectTrigger id="courier-service" className="mt-1">
                    <SelectValue placeholder="Select courier service" />
                  </SelectTrigger>
                  <SelectContent>
                    {courierServices.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="storage-area">Sample Storing Area:</Label>
                <Select value={storageArea} onValueChange={setStorageArea}>
                  <SelectTrigger id="storage-area" className="mt-1">
                    <SelectValue placeholder="Select storage area" />
                  </SelectTrigger>
                  <SelectContent>
                    {storageAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tracking-number">Tracking (AWB) Number:</Label>
                <Input
                  id="tracking-number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Courier Charges:</Label>
                <div className="mt-1">{sampleData.courier_service.charges} LKR</div>
              </div>
            </div>
          </div>

          {/* Modify the Tabs component to track tab changes */}
          <Tabs defaultValue="inquiry" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inquiry">Sample Details</TabsTrigger>
              <TabsTrigger value="tracking">Tracking Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="inquiry" className="border rounded-md p-4 mt-2">
              <div className="overflow-x-auto">
                {/* Tabulator table */}
                <div ref={tableRef} className="w-full"></div>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="border rounded-md p-4 mt-2">
              <div className="space-y-4">
                <div>
                  <Label>Date of Handover:</Label>
                  <span className="ml-2">{sampleData.tracking_stages.handover_to_courier.date}</span>
                </div>
                <div>
                  <Label>Estimated Delivery date:</Label>
                  <span className="ml-2">{sampleData.ed}</span>
                </div>
                <div>
                  <Label>Courier charges for inquiry:</Label>
                  <span className="ml-2">{sampleData.courier_service.charges} LKR</span>
                </div>

                <div className="mt-8 px-4">
                  <Stepper steps={trackingSteps} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Request to Stores</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send this request to stores? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                console.log("selecteed" + selectedSampleId);
                console.log(selectedSampleId);
                if (selectedSampleId) {
                  handleSendRequest(selectedSampleId)
                  setSelectedSampleId(null)
                }
              }}
            >
              Sure
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


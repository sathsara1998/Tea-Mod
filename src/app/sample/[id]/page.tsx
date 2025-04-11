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
import type { StoreSample } from "@/app/types/store_sample"
import { courierServices } from "@/data/sample"
import { storageAreas } from "@/data/sample"

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
  const [selectedSampleData, setSelectedSampleData] = useState<any>(null)
  const [requestSent, setRequestSent] = useState(false)
  const [resivedSample, setResivedSample] = useState<StoreSample | any>();

  const [storeLength, setStoreLength] = useState<number>();
  // Add a new state to track the active tab
  const [activeTab, setActiveTab] = useState("inquiry")
  const [updatedStatus, setUpdatedStatus] = useState("")
  const [apiUpdating, setApiUpdating] = useState(false)

  const tableRef = useRef<HTMLDivElement | null>(null)
  const tableInstance = useRef<Tabulator | null>(null)

  // get one with params id change it (tabledata)
  const backendGetOneUrl = "https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/tabledata?id="

  // Put one with params id change it (tabledata) 
  const backendPutOneUrl = "https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/tabledata/";

  // get All (store_sample database)
  const backendGetAllUrl = "https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/store_sample"

  // Post One (store_sample database)
  const backendPostUrl = "https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/store_sample";

  // Fetch the sample data
  const fetchSampleData = async () => {
    try {
      setLoading(true)
      console.log(`Attempting to fetch data for sample ID: ${params.id}`)

      // Try to fetch from the API 
      const response = await axios.get(`${backendGetOneUrl+params.id}`)

      // Check if we got an array or a single object
      const data = Array.isArray(response.data) ? response.data[0] : response.data

      console.log("API response:", data)

      setSampleData(data)
      setCourierService(data.courier_service?.name || "")
      setStorageArea(data.sample_storing_area || "")
      setTrackingNumber(data.tracking_number || "")
      setCurrentStatus(data.status || "Draft")
    } catch (error) {
      console.error("Error fetching sample data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSampleData()
  }, [])

  const changeStatus = async (sampleName: string) => {
    const response2 = await axios.get(`${backendGetOneUrl+params.id}`)
    // console.log(response2.data)

    const updatedSampleData = response2.data[0];
    // console.log(updatedSampleData);
    // console.log(response2.data.requested_samples?.length)
    for(let i = 0 ; i< updatedSampleData.requested_samples?.length ; i++){
      if (updatedSampleData.requested_samples[i].name === sampleName) {
        updatedSampleData.requested_samples[i].store_stat = "Recieved"
      }
    }
    // console.log(updatedSampleData);

    // Send the updated data to the API
    const response = await axios.put(`${backendPutOneUrl+params.id}`,updatedSampleData)
    fetchSampleData(); 
  }

  useEffect(() => {
    const fetchStoreMonitor = async () => {
      const response = await axios.get(backendGetAllUrl)
      setStoreLength(response.data.length + 1);
      let i = 0;
      for ( i = 0; i < response.data.length; i++) {
        // console.log(response.data[i].status)
        // console.log(response.data[i].sampleId)
        // console.log(params.id);
        if (response.data[i].status === "Done" && response.data[i].sampleId === params.id) {
          console.log(response.data[i].requested_sample_name , i);
          changeStatus(response.data[i].requested_sample_name);

        }
      }
    }
    fetchStoreMonitor()
  }, [])

  // Initialize Tabulator when sampleData is available
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
            cellEdited: (cell) => {
              // Get the updated data
              const data = cell.getData()
              console.log("Cell edited:", data)
            },
          },
          {
            title: "Net weight (g)",
            field: "net_weight",
            editor: "number",
            editable: (cell) => cell.getData().editable,
            cellEdited: (cell) => {
              // Get the updated data
              const data = cell.getData()
              console.log("Cell edited:", data)
            },
          },
          {
            title: "Reference",
            field: "reference",
            editor: "input",
            editable: (cell) => cell.getData().editable,
            cellEdited: (cell) => {
              // Get the updated data
              const data = cell.getData()
              console.log("Cell edited:", data)
            },
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
                  disabled={requestSent || rowData?.store_stat === "Requesting" || apiUpdating || rowData?.store_stat === "Recieved" || rowData?.store_stat === "Done"}
                  onClick={() => {
                    console.log("Clicked Button " + rowData.name)
                    setSelectedSampleId(rowData.name)
                    setSelectedSampleData(rowData)
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
  }, [sampleData, requestSent, activeTab, apiUpdating]) // Add activeTab as a dependency

  // Calculate total weight of requested samples
  function calculateTotalWeight() {
    if (!sampleData?.requested_samples) return 0
    return sampleData.requested_samples.reduce((sum, sample) => sum + sample.net_weight, 0)
  }

  const postStoreSample = async (obj: any) => {
    const response2 = await axios.post(backendPostUrl, obj);
  }

  // Handle sending request to stores
  const handleSendRequest = async (sampleId: string) => {
    if (!sampleData || !selectedSampleData) return

    setApiUpdating(true)

    try {
      // Get the current table data for the selected sample
      const currentTableData = tableInstance.current?.getData()
      const updatedSampleData = currentTableData?.find((item: any) => item.name === sampleId)

      if (!updatedSampleData) {
        throw new Error("Could not find the selected sample data")
      }

      console.log("Updated sample data to send:", updatedSampleData)

      // Update the sample status
      const updatedSamples = sampleData.requested_samples.map((sample) => {
        if (sample.name === sampleId) {
          return {
            ...sample,
            store_stat: "Requesting",
            // Update with the edited values from the table
            standerd_code: updatedSampleData.standerd_code,
            net_weight: updatedSampleData.net_weight,
            reference: updatedSampleData.reference,
          }
        }
        return sample
      })

      // Create the updated sample data object
      const updatedData = {
        ...sampleData,
        requested_samples: updatedSamples,
      }

      // Send the updated data to the API
      const response = await axios.put(
        `https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/tabledata/${params.id}`,
        updatedData,
      )


      console.log("API update response:", response.data)


      console.log(storeLength)
      console.log(updatedData.reference)
      console.log(updatedData.customer.name)
      console.log(updatedSampleData.net_weight)
      console.log(updatedSampleData.standerd_code)

      let obj = {
        id: `${storeLength}`,
        reference: updatedData.reference,
        requestedDate: new Date().toISOString().split('T')[0],
        trader: updatedData.trader,
        customer: updatedData.customer.name,
        quantity: updatedSampleData.net_weight,
        contractNo: "",
        blendNo: "",
        straightLineQuantity: 0,
        propQuantity: 0,
        standard: updatedSampleData.standerd_code,
        requested_sample_name: updatedSampleData.name,
        status: "Pending",
        sampleId: updatedData.id
      }
      console.log(obj)
      postStoreSample(obj);


      // Update the local state with the response data
      setSampleData(response.data)

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
        variant: "default",
        title: "Request Sent",
        description: "Your request has been sent to stores successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error updating sample data:", error)

      // Show error toast
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error sending your request. Please try again.",
        duration: 3000,
      })
    } finally {
      setApiUpdating(false)
    }
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
      description: sampleData.tracking_stages?.handover_to_courier.date,
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

  const handleCancel = async () => {
    // Only allow cancellation if status is Draft
    if (currentStatus.toLowerCase() === "draft") {
      // Handle cancellation logic

      try {
        const updatedData = {
          ...sampleData,
          status: "Cancel",
        }
        const response = await axios.put(
          `${backendPutOneUrl+params.id}`,
          updatedData,
        )
        console.log(response);
        toast({
          variant: "default",
          title: "Successfully Cancelled",
          description: "Sample request cancelled successfully.",
          duration: 3000,
        })

        router.push("/sample")
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Something wrong",
          description: "Come some errors",
          duration: 1000,
        })
      }
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
      const response = await axios.put(
        `${backendPutOneUrl+params.id}`,updatedData)

      toast({
        variant: "default",
        title: "Changes saved successfully",
        description: "Changes saved successfully Completed.",
        duration: 3000,
      })
      router.push("/sample")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save changes",
        description: "Error :" + error,
        duration: 3000,
      })
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
      
      <div className="bg-white ">
        <div className="p-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Sample inquiry management system</h2>
            </div>

            {/* status buttons */}
            <div className="flex space-x-2">
              <Button
                disabled={currentStatus.toLowerCase() !== "cancel"}
                variant={currentStatus === "Cancel" ? "default" : "outline"}
              // onClick={() => handleStatusChange("Cancle")}
              >
                Cancel
              </Button>
              <Button
                disabled={currentStatus.toLowerCase() !== "draft"}
                variant={currentStatus === "Draft" ? "default" : "outline"}
              // onClick={() => handleStatusChange("Draft")}
              >
                Draft
              </Button>
              <Button
                disabled={currentStatus.toLowerCase() !== "sent"}
                variant={currentStatus === "Sent" ? "default" : "outline"}
                className={currentStatus === "Sent" ? "bg-blue-500" : ""}
              // onClick={() => handleStatusChange("Sent")}
              >
                Sent
              </Button>
              <Button
                disabled={currentStatus.toLowerCase() !== "done"}
                variant={currentStatus === "Done" ? "default" : "outline"}
                className={currentStatus === "Done" ? "bg-green-500" : ""}
              // onClick={() => handleStatusChange("Done")}
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
                <Label className="font-bold">Create Date:</Label>
                <span className="ml-2 text-sm text-gray-600">{sampleData.creation_date}</span>
              </div>
              <div>
                <Label className="font-bold">Reference Number:</Label>
                <span className="ml-2 text-sm text-gray-600">{sampleData.reference}</span>
              </div>
              <div>
                <Label className="font-bold">Customer Name:</Label>
                <span className="ml-2 text-sm text-gray-600">{sampleData.customer.name}</span>
              </div>
              <div>
                <Label className="font-bold">Customer Address:</Label>
                <div className="mt-1 text-sm text-gray-600">{sampleData.customer.address}</div>
              </div>
              <div>
                <Label className="font-bold">Customer Country:</Label>
                <div className="mt-1 text-sm text-gray-600">{sampleData.customer.country}</div>
              </div>
              <div>
                <Label className="font-bold">Trader:</Label>
                <div className="mt-1 text-sm text-gray-600">{sampleData.trader}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="courier-service" className="font-bold">Courier Service:</Label>
                <Select value={courierService} onValueChange={setCourierService}>
                  <SelectTrigger id="courier-service" className="mt-1 text-sm text-gray-600">
                    <SelectValue placeholder="Select courier service" />
                  </SelectTrigger>
                  <SelectContent>
                    {courierServices.map((service) => (
                      <SelectItem  key={service.id} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="storage-area" className="font-bold">Sample Storing Area:</Label>
                <Select value={storageArea} onValueChange={setStorageArea}>
                  <SelectTrigger id="storage-area" className="mt-1 text-sm text-gray-600">
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
                <Label htmlFor="tracking-number" className="font-bold">Tracking (AWB) Number:</Label>
                <Input
                  id="tracking-number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="mt-1 text-sm text-gray-600"
                />
              </div>
              <div>
                <Label className="font-bold">Courier Charges:</Label>
                <div className="mt-1 text-sm text-gray-600">{sampleData.courier_service.charges} LKR</div>
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
                  <span className="ml-2">{sampleData.expected_delivery}</span>
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
                console.log("Selected sample: " + selectedSampleId)
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


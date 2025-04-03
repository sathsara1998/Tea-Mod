"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Stepper } from "@/components/ui/stepper"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ArrowLeft } from "lucide-react"

// Mock client data - in a real app, this would come from your API or database
const clients = [
  {
    id: "client1",
    name: "Acme Corporation",
    address: "123 Business Ave, Suite 100, Business District",
    country: "United States",
  },
  {
    id: "client2",
    name: "Global Enterprises",
    address: "456 Commerce St, Tower B, Financial Center",
    country: "United Kingdom",
  },
  {
    id: "client3",
    name: "Pacific Trading Co.",
    address: "789 Harbor Blvd, Warehouse 5, Port Area",
    country: "Japan",
  },
]

// Mock tea standards
const teaStandards = [
  {
    id: "tea1",
    name: "Black Tea Standard",
    code: "STD 9733 & 9734 SITHAKA TYPE",
    weight: 100,
    reference: "-",
    status: "Requested",
  },
  {
    id: "tea2",
    name: "Green Tea Standard",
    code: "STD 9733 & 9740 CEYLON FBOP",
    weight: 150,
    reference: "Seal pack",
    status: "Pending",
  },
  {
    id: "tea3",
    name: "Oolong Tea Standard",
    code: "STD 9735 & 9736 NE FBOP",
    weight: 100,
    reference: "-",
    status: "Received",
  },
  { id: "tea4", name: "White Tea Standard", code: "STD 9737", weight: 80, reference: "-", status: "Requested" },
  { id: "tea5", name: "Herbal Tea Standard", code: "STD 9738", weight: 120, reference: "-", status: "Pending" },
  { id: "tea6", name: "Chai Tea Standard", code: "STD 9739", weight: 90, reference: "-", status: "Received" },
]

// Mock courier services
const courierServices = [
  { id: "courier1", name: "Express Delivery" },
  { id: "courier2", name: "Standard Shipping" },
  { id: "courier3", name: "Premium Logistics" },
  { id: "courier4", name: "Global Transport" },
]

// Mock storage areas
const storageAreas = [
  { id: "area1", name: "Main Warehouse" },
  { id: "area2", name: "Temperature Controlled" },
  { id: "area3", name: "Secure Storage" },
  { id: "area4", name: "Quarantine Area" },
]

interface RowData {
  id: number
  reference: string
  creationdate: string
  ed: string
  customer: string
  trader: string
  customer_address: string
  customer_country: string
  selected_Samples: string[]
  courier_service?: string
  storage_area?: string
  tracking_number?: string
  status: string
  handover_date?: string
  estimated_delivery?: string
  courier_charges?: string
  tracking_stages?: {
    handover_to_courier: { date: string; completed: boolean }
    package_to_collection: { date: string; completed: boolean }
    package_shipped: { date: string; completed: boolean }
    package_arrived: { date: string; completed: boolean }
    picked_by_clearance: { date: string; completed: boolean }
  }
}

export default function SampleDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [rowData, setRowData] = useState<RowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [courierService, setCourierService] = useState("")
  const [storageArea, setStorageArea] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [currentStatus, setCurrentStatus] = useState("Draft")

  // Fetch the sample data
  useEffect(() => {
    const fetchSampleData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/tabledata/${params.id}`,
        )
        setRowData(response.data)
        setCourierService(response.data.courier_service || "")
        setStorageArea(response.data.storage_area || "")
        setTrackingNumber(response.data.tracking_number || "")
        setCurrentStatus(response.data.status || "Draft")
      } catch (error) {
        console.error("Error fetching sample data:", error)
        // Fallback to mock data if API fails
        const mockData: RowData = {
          id: Number.parseInt(params.id),
          reference: `SI-25-${params.id.padStart(3, "0")}`,
          creationdate: "21/02/2025",
          ed: "15/03/2025",
          customer: "client1",
          trader: "trader1",
          customer_address: "123 Business Ave, Suite 100, Business District",
          customer_country: "United States",
          selected_Samples: ["tea1", "tea2"],
          status: "Draft",
          tracking_stages: {
            handover_to_courier: { date: "02/21/2025", completed: true },
            package_to_collection: { date: "02/22/2025", completed: true },
            package_shipped: { date: "02/23/2025", completed: true },
            package_arrived: { date: "03/02/2025", completed: false },
            picked_by_clearance: { date: "03/04/2025", completed: false },
          },
        }
        setRowData(mockData)
        setCourierService(mockData.courier_service || "")
        setStorageArea(mockData.storage_area || "")
        setTrackingNumber(mockData.tracking_number || "")
        setCurrentStatus(mockData.status || "Draft")
      } finally {
        setLoading(false)
      }
    }

    fetchSampleData()
  }, [params.id])

  if (loading || !rowData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading sample details...</p>
        </div>
      </div>
    )
  }

  // Default tracking stages if not provided
  const trackingStages = rowData.tracking_stages || {
    handover_to_courier: { date: "02/21/2025", completed: true },
    package_to_collection: { date: "02/22/2025", completed: true },
    package_shipped: { date: "02/23/2025", completed: true },
    package_arrived: { date: "03/02/2025", completed: false },
    picked_by_clearance: { date: "03/04/2025", completed: false },
  }

  // Convert tracking stages to stepper format
  const trackingSteps = [
    {
      title: "Handover to Courier service",
      description: trackingStages.handover_to_courier.date,
      completed: trackingStages.handover_to_courier.completed,
    },
    {
      title: "Package Handover to Collecting center",
      description: trackingStages.package_to_collection.date,
      completed: trackingStages.package_to_collection.completed,
    },
    {
      title: "Package shipped",
      description: trackingStages.package_shipped.date,
      completed: trackingStages.package_shipped.completed,
    },
    {
      title: "Package Arrived to destination airport",
      description: trackingStages.package_arrived.date,
      completed: trackingStages.package_arrived.completed,
    },
    {
      title: "Picked by Clearance company",
      description: trackingStages.picked_by_clearance.date,
      completed: trackingStages.picked_by_clearance.completed,
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
      // Update the rowData with the current values
      const updatedData = {
        ...rowData,
        courier_service: courierService,
        storage_area: storageArea,
        tracking_number: trackingNumber,
        status: currentStatus,
      }

      // In a real app, you would save this data to your API
      // await axios.put(`https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/tabledata/${params.id}`, updatedData);

      alert("Changes saved successfully")
      router.push("/")
    } catch (error) {
      console.error("Error saving data:", error)
      alert("Failed to save changes")
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
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
                <span className="ml-2">{rowData.creationdate}</span>
              </div>
              <div>
                <Label>Reference Number:</Label>
                <span className="ml-2">{rowData.reference}</span>
              </div>
              <div>
                <Label>Customer Name:</Label>
                <span className="ml-2">{clients.find((c) => c.id === rowData.customer)?.name || rowData.customer}</span>
              </div>
              <div>
                <Label>Customer Address:</Label>
                <div className="mt-1 text-sm text-gray-600">{rowData.customer_address}</div>
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
                      <SelectItem key={service.id} value={service.id}>
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
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Customer Country:</Label>
                <div className="mt-1">{rowData.customer_country}</div>
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
            </div>
          </div>

          <Tabs defaultValue="inquiry" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inquiry">Sample Details</TabsTrigger>
              <TabsTrigger value="tracking">Tracking Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="inquiry" className="border rounded-md p-4 mt-2">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left w-10"></th>
                      <th className="border p-2 text-left">Sample Standard</th>
                      <th className="border p-2 text-left">Standard Code</th>
                      <th className="border p-2 text-left">Net weight (g)</th>
                      <th className="border p-2 text-left">Reference</th>
                      <th className="border p-2 text-left">Stores stat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teaStandards.slice(0, 3).map((standard, index) => (
                      <tr key={standard.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border p-2">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="border p-2">{standard.name}</td>
                        <td className="border p-2">{standard.code}</td>
                        <td className="border p-2">{standard.weight}</td>
                        <td className="border p-2">{standard.reference}</td>
                        <td className="border p-2">{standard.status}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="border p-2" colSpan={2}></td>
                      <td className="border p-2 font-bold">Total Weight</td>
                      <td className="border p-2">350</td>
                      <td className="border p-2" colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <Button>Send request to stores</Button>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="border rounded-md p-4 mt-2">
              <div className="space-y-4">
                <div>
                  <Label>Date of Handover:</Label>
                  <span className="ml-2">{rowData.handover_date || "02/21/2025"}</span>
                </div>
                <div>
                  <Label>Estimated Delivery date:</Label>
                  <span className="ml-2">{rowData.estimated_delivery || "15/03/2025"}</span>
                </div>
                <div>
                  <Label>Courier charges for inquiry:</Label>
                  <span className="ml-2">{rowData.courier_charges || "xxx.xx LKR"}</span>
                </div>

                <div className="mt-8 px-4">
                  <Stepper steps={trackingSteps} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}


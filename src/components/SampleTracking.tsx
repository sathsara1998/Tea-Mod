"use client"
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import type React from "react"
import { createRoot } from "react-dom/client"
import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { TabulatorFull as Tabulator } from "tabulator-tables"
import "tabulator-tables/dist/css/tabulator_semanticui.min.css"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import type { RowComponent } from "tabulator-tables"
import axios from "axios"

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

const traders = [
  { id: "trader1", name: "John Smith" },
  { id: "trader2", name: "Emma Johnson" },
  { id: "trader3", name: "Michael Wong" },
  { id: "trader4", name: "Sarah Davis" },
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

interface NewSampleDialogProps {
  length: number
}

const NewSampleDialog: React.FC<NewSampleDialogProps> = ({ length }) => {
  const [creationDate] = useState<Date>(new Date())
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedTrader, setSelectedTrader] = useState<string>("")
  const [clientAddress, setClientAddress] = useState<string>("")
  const [clientCountry, setClientCountry] = useState<string>("")
  const [selectedSamples, setSelectedSamples] = useState<string[]>([])
  const [newSample, setNewSample] = useState<any>({
    id: length + 1,
    reference: `SI-25-${String(length + 1).padStart(3, "0")}`,
    creationdate: format(creationDate, "dd/MM/yyyy"),
    ed: "15/03/2025",
    customer: selectedClient,
    trader: selectedTrader,
    customer_address: clientAddress,
    customer_country: clientCountry,
    selected_Samples: selectedSamples,
    status: "Draft",
  })

  useEffect(() => {
    const newOne = {
      id: length + 1,
      reference: `SI-25-${String(length + 1).padStart(3, "0")}`,
      creationdate: format(creationDate, "dd/MM/yyyy"),
      ed: "15/03/2025",
      customer: selectedClient,
      trader: selectedTrader,
      customer_address: clientAddress,
      customer_country: clientCountry,
      selected_Samples: selectedSamples,
      status: "Draft",
    }
    setNewSample(newOne)
  }, [selectedClient, selectedTrader, clientAddress, clientCountry, selectedSamples, length, creationDate])

  // Update client details when a client is selected
  useEffect(() => {
    if (selectedClient) {
      const client = clients.find((c) => c.id === selectedClient)
      if (client) {
        setClientAddress(client.address)
        setClientCountry(client.country)
      }
    } else {
      setClientAddress("")
      setClientCountry("")
    }
  }, [selectedClient])

  // Remove a selected sample
  const removeSample = (sampleId: string) => {
    setSelectedSamples((prev) => prev.filter((id) => id !== sampleId))
  }

  const submithandle = async (): Promise<void> => {
    try {
      const response = await axios.post<RowData>(
        "https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/tabledata",
        newSample,
      )
      console.log("Data successfully posted:", response.data)
      alert("Successfully submitted")
    } catch (error) {
      console.error("Error posting data:", error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>New</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto flex flex-col justify-start items-start">
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Sample</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            submithandle()
          }}
        >
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Tea Sample Request Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Creation Date (Auto-filled) */}
              <div className="space-y-2">
                <Label>Creation Date</Label>
                <div className="p-2 border rounded-md bg-muted/20">
                  {creationDate ? format(creationDate, "PPP") : "Invalid Date"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Selection */}
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger id="client-name">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trader Selection */}
                <div className="space-y-2">
                  <Label htmlFor="trader">Trader</Label>
                  <Select value={selectedTrader} onValueChange={setSelectedTrader}>
                    <SelectTrigger id="trader">
                      <SelectValue placeholder="Select trader" />
                    </SelectTrigger>
                    <SelectContent>
                      {traders.map((trader) => (
                        <SelectItem key={trader.id} value={trader.id}>
                          {trader.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Auto-filled Client Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Address (Auto-filled) */}
                <div className="space-y-2">
                  <Label>Customer Address</Label>
                  <div className="p-1 border rounded-md min-h-[60px] bg-muted/20 text-gray-500 text-sm">
                    {clientAddress || "Address will appear here after selecting a client"}
                  </div>
                </div>

                {/* Customer Country (Auto-filled) */}
                <div className="space-y-2">
                  <Label>Customer's Country</Label>
                  <div className="p-1 border rounded-md bg-muted/20 text-gray-500 text-sm">
                    {clientCountry || "Country will appear here after selecting a client"}
                  </div>
                </div>
              </div>

              {/* Requested Samples (Multi-select) */}
              <div className="space-y-2">
                <Label>Requested Samples</Label>

                {/* Display selected samples as badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedSamples.length > 0 ? (
                    selectedSamples.map((sampleId) => {
                      const sample = teaStandards.find((s) => s.id === sampleId)
                      return sample ? (
                        <Badge key={sampleId} variant="secondary" className="flex items-center gap-1">
                          {sample.name}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeSample(sampleId)} />
                        </Badge>
                      ) : null
                    })
                  ) : (
                    <div className="text-muted-foreground text-sm">No samples selected</div>
                  )}
                </div>

                {/* Multi-select dropdown */}
                <Select
                  onValueChange={(value) => {
                    if (!selectedSamples.includes(value)) {
                      setSelectedSamples((prev) => [...prev, value])
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select tea standards" />
                  </SelectTrigger>
                  <SelectContent>
                    {teaStandards.map((standard) => (
                      <SelectItem
                        key={standard.id}
                        value={standard.id}
                        disabled={selectedSamples.includes(standard.id)}
                      >
                        {standard.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" type="submit">
                Submit Request
              </Button>
            </CardFooter>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// interface for the identify states type
interface StatusType {
  status: "sent" | "draft" | "done" | string | null | undefined
}

// status badge component
const StatusBadge = ({ status }: { status: StatusType["status"] }) => {
  const getStatusStyles = (status: StatusType["status"]): string => {
    switch (status?.toLowerCase()) {
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-200 text-gray-800"
      case "done":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: StatusType["status"]): string => {
    if (!status) return ""

    if (status.toLowerCase() === "in_progress") {
      return "In Progress"
    }

    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyles(status)}`}
    >
      {formatStatus(status)}
    </span>
  )
}

// tracking list function
export default function SampleTracking() {
  const router = useRouter()
  const [tabledata, setTabledata] = useState<RowData[]>([])
  const tableRef = useRef<HTMLDivElement | null>(null) // Reference to table div
  const tableInstance = useRef<Tabulator | null>(null) // Reference to Tabulator instance

  // Function to handle row click and navigate to details page
  const handleRowClick = (row: RowComponent) => {
    console.log("Row clicked:", row.getData())
    const rowData = row.getData() as RowData
    router.push(`/sample/${rowData.id}`)
  }

  //   fetch data for the Table
  const fetchData = async () => {
    try {
      const response = await axios.get("https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/tabledata")
      console.log(response.data)
      setTabledata(response.data) // Set the fetched data in state
    } catch (error) {
      console.error("Error fetching data:", error) // Handle errors
      // Fallback to mock data if API fails
      setTabledata([
        {
          id: 1,
          reference: "SI-25-001",
          creationdate: "21/02/2025",
          ed: "15/03/2025",
          customer: "client1",
          trader: "trader1",
          customer_address: "123 Business Ave, Suite 100, Business District",
          customer_country: "United States",
          selected_Samples: ["tea1", "tea2"],
          status: "Draft",
        },
        {
          id: 2,
          reference: "SI-25-002",
          creationdate: "22/02/2025",
          ed: "20/03/2025",
          customer: "client2",
          trader: "trader2",
          customer_address: "456 Commerce St, Tower B, Financial Center",
          customer_country: "United Kingdom",
          selected_Samples: ["tea3"],
          status: "Sent",
        },
        {
          id: 3,
          reference: "SI-25-003",
          creationdate: "23/02/2025",
          ed: "25/03/2025",
          customer: "client3",
          trader: "trader3",
          customer_address: "789 Harbor Blvd, Warehouse 5, Port Area",
          customer_country: "Japan",
          selected_Samples: ["tea4", "tea5", "tea6"],
          status: "Done",
        },
      ])
    }
  }

  // adding data on Table
  useEffect(() => {
    if (tableRef.current && !tableInstance.current) {
      tableInstance.current = new Tabulator(tableRef.current, {
        height: "auto",
        data: tabledata,
        layout: "fitColumns",
        responsiveLayout: "collapse",
        pagination: true,
        paginationSize: 20,
        columns: [
          { title: "Reference", field: "reference", width: 150 },
          { title: "Creation Date ", field: "creationdate", hozAlign: "left" },
          { title: "Expected Delivery", field: "ed" },
          {
            title: "Customer",
            field: "customer",
            sorter: "string",
            hozAlign: "left",
            formatter: (cell) => {
              const customerId = cell.getValue()
              const customer = clients.find((c) => c.id === customerId)
              return customer ? customer.name : customerId
            },
          },
          {
            title: "Status",
            field: "status",
            sorter: "string",
            hozAlign: "left",
            headerFilterParams: {
              values: {
                "": "All",
                sent: "Sent",
                draft: "Draft",
                done: "Done",
              },
            },
            formatter: (cell) => {
              const container = document.createElement("div")
              const root = createRoot(container)
              root.render(<StatusBadge status={cell.getValue()} />)
              return container
            },
          },
        ],
      })

      // Add row click event listener after table is initialized
      tableInstance.current.on("rowClick", (e, row) => {
        console.log("Row clicked:", row.getData())
        const rowData = row.getData() as RowData
        router.push(`/sample/${rowData.id}`)
      })
    }

    return () => {
      // Clean up Tabulator instance on component unmount
      if (tableInstance.current) {
        tableInstance.current.destroy()
        tableInstance.current = null
      }
    }
  }, [tabledata, router])

  //  Calling Fetch api
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div>
      {/* Heading */}
      <div className="text-left">
        <p className="font-bold text-2xl py-4">Sample Inquiry Management System</p>
      </div>
      <div className="flex justify-between items-center">
        {/* Add button and topic section */}
        <div className="flex justify-center items-center gap-7">
          <NewSampleDialog length={tabledata?.length || 0} />
          <h1 className="font-bold">Samples</h1>
        </div>
        {/* Search bar */}
        <div className="w-full outline-2 border-2 flex flex-row px-4 mx-10 me-4 py-2 gap-4">
          <Search />
          <input className="outline-none w-full" placeholder="Search" />
        </div>
      </div>
      {/* table */}
      <div ref={tableRef} className="cursor-pointer"></div>
    </div>
  )
}


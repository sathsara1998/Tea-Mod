"use client"
import type React from "react"
import { createRoot } from "react-dom/client"
import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

// Shadcn Conponents
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

// Icons
import { Search, X } from "lucide-react"

// Tabulator
import { TabulatorFull as Tabulator } from "tabulator-tables"
import "tabulator-tables/dist/css/tabulator_semanticui.min.css"
// import type { RowComponent } from "tabulator-tables"

// axios
import axios from "axios"

// Types
import type { Sample } from "@/app/types/sample"
import type { RequestedSample } from "@/app/types/sample"
import type { Sample as RowData } from "@/app/types/sample"
import type { StatusType } from "@/app/types/sample"

// import mock data
import { BRAND_COLORS } from "@/data/sample"
import { clients } from "@/data/sample"
import { traders } from "@/data/sample"
import { teaStandards } from "@/data/sample"


interface NewSampleDialogProps {
  length: number
  onSuccess: () => void
}

const NewSampleDialog: React.FC<NewSampleDialogProps> = ({ length, onSuccess }) => {

  const { toast } = useToast()
  const [creationDate] = useState<Date>(new Date())
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedTrader, setSelectedTrader] = useState<string>("")
  const [clientAddress, setClientAddress] = useState<string>("")
  const [clientCountry, setClientCountry] = useState<string>("")
  const [selectedSamples, setSelectedSamples] = useState<string[]>([])
  const [newSample, setNewSample] = useState<Sample>()
  const [open, setOpen] = useState(false)

  // you can change post api url in tabledata
  const backEndUrl = "https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/tabledata"


  useEffect(() => {
    // Find full client and trader objects based on selected IDs
    const selectedClientObj = clients.find((c) => c.id === selectedClient)
    const selectedTraderObj = traders.find((t) => t.id === selectedTrader)

    // Map selected sample IDs to full RequestedSample objects
    const requestedSamples: RequestedSample[] = teaStandards
      .filter((ts) => selectedSamples.includes(ts.id))
      .map((ts) => ({
        name: ts.name,
        standerd_code: ts.standerd_code,
        net_weight: ts.net_weight,
        reference: ts.reference,
        store_stat: ts.store_stat,
      }))

    // Create ISO date strings (recommended format)
    const creationDateISO = creationDate.toISOString().split("T")[0]
    setNewSample({
      id: (length + 1).toString(),
      reference: `SI-25-${String(length + 1).padStart(3, "0")}`,
      creationdate: creationDateISO,
      ed: "Waiting...",
      customer: {
        name: selectedClientObj?.name || "",
        address: clientAddress,
        country: clientCountry,
      },
      status: "Draft",
      requested_samples: requestedSamples,
      courier_service: {
        name: "",
        charges: 0,
      },
      sample_storing_area: "",
      trader: selectedTraderObj?.name || "",
      tracking_number: "",
      tracking_stages: {
        handover_to_courier: {
          date: "",
          completed: false,
        },
        package_to_collection: {
          date: "",
          completed: false,
        },
        package_shipped: {
          date: "",
          completed: false,
        },
        package_arrived: {
          date: "",
          completed: false,
        },
        picked_by_clearance: {
          date: "",
          completed: false,
        },
      },
    })
  }, [
    selectedClient,
    selectedTrader,
    clients,
    traders,
    clientAddress,
    clientCountry,
    selectedSamples,
    length,
    creationDate,
  ])

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

  // submit to the data in new Sample
  const submithandle = async (): Promise<void> => {
    try {
      const response = await axios.post<RowData>(backEndUrl,newSample,)
      console.log("Data successfully posted:", response.data)
      // Show success toast
      toast({
        variant: "success",
        title: "Successfully Submit Inquary",
        description: "Your New Inquery has been save to successfully.",
        duration: 3000,
      })
      onSuccess()

    } catch (error) {
      console.error("Error posting data:", error)
      toast({
        variant: "destructive",
        title: "Unsuccessfull",
        description: "Your New Inquery Unsuccessfully.",
        duration: 3000,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} className="bg-[#B91C1C] hover:bg-[#8B0000] text-white">
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto flex flex-col justify-start items-start border-[#B91C1C]">
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-XUWqp10SrqLFPpCq4p2mXus0hcvi8O.png"
              alt="Tea Tang Logo"
              className="w-8 h-8 object-contain"
            />
            <h2 className="text-xl font-bold text-[#B91C1C]">Add New Sample</h2>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            submithandle()
            setOpen(false)
          }}
        >
          <Card className="w-full max-w-4xl mx-auto border-[#B91C1C]/20">
            <CardHeader className="border-b border-[#B91C1C]/10">
              <CardTitle className="text-[#B91C1C]">Tea Sample Request Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {/* Creation Date (Auto-filled) */}
              <div className="space-y-2">
                <Label className="text-[#B91C1C]">Creation Date</Label>
                <div className="p-2 border rounded-md bg-muted/20 border-[#B91C1C]/20">
                  {creationDate ? format(creationDate, "PPP") : "Invalid Date"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Selection */}
                <div className="space-y-2">
                  <Label htmlFor="client-name" className="text-[#B91C1C]">
                    Client Name
                  </Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger id="client-name" className="border-[#B91C1C]/20 focus:ring-[#B91C1C]/20">
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
                  <Label htmlFor="trader" className="text-[#B91C1C]">
                    Trader
                  </Label>
                  <Select value={selectedTrader} onValueChange={setSelectedTrader}>
                    <SelectTrigger id="trader" className="border-[#B91C1C]/20 focus:ring-[#B91C1C]/20">
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
                  <Label className="text-[#B91C1C]">Customer Address</Label>
                  <div className="p-1 border rounded-md min-h-[60px] bg-muted/20 text-gray-500 text-sm border-[#B91C1C]/20">
                    {clientAddress || "Address will appear here after selecting a client"}
                  </div>
                </div>

                {/* Customer Country (Auto-filled) */}
                <div className="space-y-2">
                  <Label className="text-[#B91C1C]">Customer's Country</Label>
                  <div className="p-1 border rounded-md bg-muted/20 text-gray-500 text-sm border-[#B91C1C]/20">
                    {clientCountry || "Country will appear here after selecting a client"}
                  </div>
                </div>
              </div>

              {/* Requested Samples (Multi-select) */}
              <div className="space-y-2">
                <Label className="text-[#B91C1C]">Requested Samples</Label>

                {/* Display selected samples as badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedSamples.length > 0 ? (
                    selectedSamples.map((sampleId) => {
                      const sample = teaStandards.find((s) => s.id === sampleId)
                      return sample ? (
                        <Badge
                          key={sample.id}
                          variant="secondary"
                          className="flex items-center gap-1 pr-2 bg-[#B91C1C]/10 text-[#B91C1C] hover:bg-[#B91C1C]/20"
                        >
                          <span className="max-w-[200px] truncate">{sample.name}</span>
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-[#8B0000]"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeSample(sample.id)
                            }}
                          />
                        </Badge>
                      ) : null
                    })
                  ) : (
                    <div className="text-muted-foreground text-sm">No samples selected yet</div>
                  )}
                </div>

                {/* Multi-select dropdown */}
                <Select
                  onValueChange={(value: string) => {
                    if (!selectedSamples.includes(value)) {
                      setSelectedSamples((prev) => [...prev, value])
                    }
                  }}
                >
                  <SelectTrigger className="w-full border-[#B91C1C]/20 focus:ring-[#B91C1C]/20">
                    <SelectValue placeholder="Select tea standards" />
                  </SelectTrigger>
                  <SelectContent>
                    {teaStandards.map((standard) => (
                      <SelectItem
                        key={standard.id}
                        value={standard.id}
                        disabled={selectedSamples.includes(standard.id)}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span>{standard.name}</span>
                          <span className="text-muted-foreground text-sm">{standard.standerd_code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="border-t border-[#B91C1C]/10 pt-4">
              <Button className="ml-auto bg-[#B91C1C] hover:bg-[#8B0000] text-white" type="submit">
                Submit Request
              </Button>
            </CardFooter>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  )
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
      case "cancel":
        return "bg-red-100 text-red-800"
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
  const [tabledata, setTabledata] = useState<Sample[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const tableRef = useRef<HTMLDivElement | null>(null) // Reference to table div
  const tableInstance = useRef<Tabulator | any>(null) // Reference to Tabulator instance
  const [customerName, setCustomerName] = useState<string>()
  const [tableInitialized, setTableInitialized] = useState(false)

  // this is mockApi you can change this link -  get all
  const backEndUrl = "https://67ecc34faa794fb3222ebb52.mockapi.io/api/teafactory/tabledata"

  //   fetch data for the tableData useState
  const fetchData = async () => {
    try {
      const response = await axios.get(backEndUrl)
      console.log(response.data)
      setTabledata(response.data) // Set the fetched data in state
    } catch (error) {
      console.error("Error fetching data:", error) // Handle errors
    }
  }

  // Initialize table when data is available
  useEffect(() => {
    if (tabledata.length > 0 && tableRef.current && !tableInitialized) {
      // Use setTimeout to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        initializeTable()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [tabledata])

  // Initialize Tabulator
  const initializeTable = () => {
    if (!tableRef.current || tableInstance.current) return

    try {
      // Ensure the table container has a defined height
      if (tableRef.current) {
        tableRef.current.style.minHeight = "800px"
      }
      // Set Data in the Tabulator Table (Colums)
      tableInstance.current = new Tabulator(tableRef.current, {
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
              const customerName = cell.getValue()
              const client = tabledata.find((c) => c.customer.name === customerName.name)
              return client ? customerName.name : ""
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
      tableInstance.current.on("rowClick", (e: any, row: any) => {
        console.log("Row clicked:", row.getData())
        const rowData = row.getData() as Sample
        router.push(`/sample/${rowData.id}`)
      })

      // Apply search filter if there's a query
      if (searchQuery && tableInstance.current) {
        tableInstance.current.setFilter(
          [
            { field: "reference", type: "like", value: searchQuery },
            { field: "customer.name", type: "like", value: searchQuery },
            { field: "status", type: "like", value: searchQuery },
          ],
          "or",
        )
      }

      setTableInitialized(true)

    } catch (error) {
      console.error("Error initializing table:", error)
    }
  }

  // Handle search query changes (Search Bar)
  useEffect(() => {
    if (tableInstance.current && tableInitialized) {
      if (searchQuery) {
        tableInstance.current.setFilter(
          [
            { field: "reference", type: "like", value: searchQuery },
            { field: "customer.name", type: "like", value: searchQuery },
            { field: "status", type: "like", value: searchQuery },
          ],
          "or",
        )
      } else {
        tableInstance.current.clearFilter()
      }
    }
  }, [searchQuery, tableInitialized])

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
    fetchData()
  }, [])

  return (
    <div>
      {/* Heading */}
      <div className="text-left bg-[#B91C1C] text-white p-4 rounded-t-md flex items-center space-x-3">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-XUWqp10SrqLFPpCq4p2mXus0hcvi8O.png"
          alt="Tea Tang Logo"
          className="w-10 h-10 object-contain"
        />
        <p className="font-bold text-2xl">Sample Inquiry Management System</p>
      </div>

      {/* Search Bar topic And Add Button */}
      <div className="flex justify-between items-center p-4 bg-white border-x border-b border-[#B91C1C]/20 rounded-b-md mb-4">
        {/* Add button and topic section */}
        <div className="flex justify-center items-center gap-7">
          <NewSampleDialog
            length={tabledata?.length || 0}
            onSuccess={() => {
              fetchData()
              // Reset table when new data is added
              if (tableInstance.current) {
                tableInstance.current.destroy()
                tableInstance.current = null
                setTableInitialized(false)
              }
            }}
          />
          <h1 className="font-bold text-[#B91C1C]">Samples</h1>
          {/* <Button
            variant="outline"
            className="border-[#B91C1C] text-[#B91C1C] hover:bg-[#B91C1C]/10"
            onClick={() => router.push("/store-monitor")}
          >
            Store Monitor
          </Button> */}
        </div>
        {/* Search bar */}
        <div className="w-full outline-2 border-2 border-[#B91C1C]/20 flex flex-row px-4 mx-10 me-4 py-2 gap-4 rounded-md">
          <Search className="text-[#B91C1C]" />
          <input
            className="outline-none w-full"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* table */}
      <div ref={tableRef} className="cursor-pointer min-h-[400px]"></div>
    </div>
  )
}

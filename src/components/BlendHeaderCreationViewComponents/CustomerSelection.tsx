import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Customer } from '../types'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Search, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface CustomerSelectionProps {
  customers: Customer[]
  customerSelected: (customerId: number) => void
  selectedCustomer: Customer | undefined
}

function CustomerSelection({
  customers,
  customerSelected,
  selectedCustomer,
}: CustomerSelectionProps) {
  const [selectCustomer, setSelectCustomer] = useState<Customer>()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState(customers)
  const commandListRef = useRef<HTMLDivElement>(null)

  // Filter customers based on search query
  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredCustomers(filtered)
  }, [searchQuery, customers])

  // Scroll to the top of the CommandList when searchQuery changes
  useEffect(() => {
    if (commandListRef.current) {
      commandListRef.current.scrollTop = 0
    }
  }, [searchQuery])

  const onSelected = (customer: Customer) => {
    setSelectCustomer(customer)
    setIsDropdownOpen(false)
    customerSelected(customer.id)
    setSearchQuery('') // Reset search when selection is made
  }

  const clearSelection = () => {
    setSelectCustomer(undefined)
    customerSelected(-1) // Assuming -1 indicates no customer selected
  }

  useEffect(() => {
    if (selectedCustomer) {
      setSelectCustomer(selectedCustomer)
    }
  }, [selectedCustomer])

  // Sort customers alphabetically
  const sortedCustomers = [...filteredCustomers].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  return (
    <div className="mb-5">
      <Card>
        <CardHeader className="top-0 z-10 flex flex-row items-center justify-between">
          <CardTitle>Blend Header Creation</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2">
              <Search className="h-4 w-4 text-gray-500" />
              <span className="text-md font-medium">
                {selectCustomer ? selectCustomer.name : 'No customer selected'}
              </span>
              {selectCustomer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="h-4 w-4 p-0 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => setIsDropdownOpen(true)}
                >
                  Select Customer
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0" align="end">
                <Command>
                  <div className="flex flex-col gap-2 p-4">
                    <h2 className="text-lg font-semibold">Select a Customer</h2>
                    <CommandInput
                      placeholder="Search customers..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                  </div>
                  <CommandList
                    ref={commandListRef}
                    className="max-h-[300px] overflow-y-auto"
                  >
                    <CommandEmpty>No customers found.</CommandEmpty>
                    <CommandGroup>
                      {sortedCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          onSelect={() => onSelected(customer)}
                          className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-gray-100"
                        >
                          <span>{customer.name}</span>
                          {selectCustomer?.id === customer.id && (
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

export default CustomerSelection

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Customer } from "../types";
import { useEffect, useState } from "react";
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"


interface CustomerSelectionProps {
    customers: Customer[]
    customerSelected: (customerId: number) => void,
    selectedCustomer: Customer | undefined
}

function CustomerSelection({ customers, customerSelected, selectedCustomer }: CustomerSelectionProps) {
    const [selectCustomer, setSelectCustomer] = useState<Customer>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onSelected = (customer: Customer) => {
        console.log("selected", customer);

        setSelectCustomer(customer);
        setIsDialogOpen(false);
        customerSelected(customer.id);
    }

    useEffect(() => {
        if (selectedCustomer) {
            setSelectCustomer(selectedCustomer);
        }
    }, [selectedCustomer])

    return (<>
        <div className="mb-5">
            <Card>
                <CardHeader className="top-0 z-10 flex flex-row items-center justify-between">
                    <CardTitle>Blend Header Creation</CardTitle>
                    <div className="flex gap-2">
                        <label className="text-md">
                            {selectCustomer ? selectCustomer.name : '-'}
                        </label>
                        <Button className="bg-green-600 text-white" onClick={() => setIsDialogOpen(true)}>Select Customer</Button>
                        <CommandDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <CommandInput placeholder="Type a command or search..." />
                            <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>
                                {customers.map(customer => {
                                    return (
                                        <CommandItem key={customer.id} onSelect={() => onSelected(customer)}>
                                            <span>{customer.name}</span>
                                        </CommandItem>
                                    )
                                })}
                            </CommandList>
                        </CommandDialog>
                    </div>
                </CardHeader>
            </Card>
        </div>
    </>);
}

export default CustomerSelection;
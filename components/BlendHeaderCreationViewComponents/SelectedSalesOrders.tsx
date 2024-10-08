'use client'
import React from 'react'
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface SelectedSalesOrdersProps {
    order: { id: number; name: string; partner_name: string };
    handleRemoveSalesOrder: (id: number) => void;
  }

export const SelectedSalesOrders: React.FC<SelectedSalesOrdersProps> = ({order, handleRemoveSalesOrder}) => {
    return (
        <Badge key={order.id} variant="secondary" className="flex items-center gap-1">
        {order.name} - {order.partner_name}
        <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={() => handleRemoveSalesOrder(order.id)}
        >
            <X className="h-3 w-3" />
        </Button>
    </Badge>
    )
}
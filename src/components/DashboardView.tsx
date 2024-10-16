import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardView() {
  return (
    <div className="flex-1 p-4 space-y-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Blends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Tea Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0 kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Available Tea</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0 kg</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Blends</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No recent blends to display.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tea Inventory Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where you would display a chart or table showing the current tea inventory levels.</p>
        </CardContent>
      </Card>
    </div>
  )
}
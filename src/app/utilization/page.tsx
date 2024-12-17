'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import StraightLine from '@/components/StraightLine'
import BlendBalance from '@/components/BlendBalance'
import ThemeToggle from '@/components/ThemeToggle'

const Dashboard = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex w-full items-center justify-between">
        <h1 className="text-3xl font-bold">Tea Tang (Pvt) Ltd</h1>
        <ThemeToggle />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Straight line</TabsTrigger>
          <TabsTrigger value="details">
            Utilization of Blend Report Balance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StraightLine />
        </TabsContent>

        <TabsContent value="details">
          <BlendBalance />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard

'use client'
import React, { useEffect, useState } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator_semanticui.min.css'
import { TeaAllocation } from '@/components/types'
import { useToast } from '@/components/ui/use-toast'
import { useApiMethods } from '@/hooks/useApiMethods'
import TeaViewDialog from './TeaViewDialog'
import LoadingSpinner from './LoadingSpinner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import StraightLineTable from './UtilizationOf StraightLine'

const TeaInfoTable: React.FC = () => {
  // To store data from the clicked cell
  const [isTeaDialogOpen, setIsTeaDialogOpen] = useState(false)

  const { toast } = useToast()
  const apiMethods = useApiMethods()

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <p className="h-2">Utilization of Straight line</p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="straightline">
            <TabsList className="flex h-auto flex-wrap gap-2">
              <TabsTrigger
                value="straightline"
                className="flex-grow sm:flex-grow-0"
              >
                Straigt Line
              </TabsTrigger>
              <TabsTrigger
                value="blendbalance"
                className="flex-grow sm:flex-grow-0"
              >
                Blend Balance
              </TabsTrigger>
              <TabsTrigger
                value="blendgain"
                className="flex-grow sm:flex-grow-0"
              >
                Blend Gain
              </TabsTrigger>
            </TabsList>
            <TabsContent value="straightline">
              <StraightLineTable />
            </TabsContent>
            <TabsContent value="blendbalance">
              Blend Balance Data should be here
            </TabsContent>
            <TabsContent value="blendgain">
              Blend Gain Data should be here
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}

export default TeaInfoTable

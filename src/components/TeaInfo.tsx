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

import BlendGainTable from './UtilizationTables'
import BlendBalanceTable from './UtilizationBlendGainAndBalance'

const TeaInfoTable: React.FC = () => {
  // To store data from the clicked cell
  const [isTeaDialogOpen, setIsTeaDialogOpen] = useState(false)

  const { toast } = useToast()
  const apiMethods = useApiMethods()
  const value1: string = 'blend_gain'
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <p className="md:auto text-center text-xl font-extrabold ">
              Utilization of Straight line | Blend Balance | Blend Gain
            </p>
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
            <TabsContent value="straightline" className="mt-4">
              <BlendGainTable value={'straight_line'} />
            </TabsContent>
            <TabsContent value="blendbalance" className="mt-4">
              <BlendBalanceTable value={'blend_balance'} />
            </TabsContent>
            <TabsContent value="blendgain" className="mt-4">
              <BlendBalanceTable value={'blend_gain'} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}

export default TeaInfoTable

import React, { useState } from 'react'
import { Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useApiMethods } from '@/hooks/useApiMethods'

type ReportType = 'finance' | 'stores'

interface ReportDownloadProps {
  selectedBlend: { id: number } | null
  type: ReportType
  onTypeChange: (type: ReportType) => void
}

const ReportDownloadButton = ({
  selectedBlend,
  type,
  onTypeChange,
}: ReportDownloadProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { getBlendReport, getBlendSalesReport } = useApiMethods()

  //Generate Report According To Report Type
  const generateReport = async (reportType: ReportType): Promise<void> => {
    if (!selectedBlend?.id) {
      toast({
        title: 'Error',
        description: 'No blend selected',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    onTypeChange(reportType)

    try {
      const reportMethod =
        reportType === 'finance' ? getBlendReport : getBlendSalesReport
      const blob = await reportMethod(selectedBlend.id)

      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      // Cleanup the URL object after a delay to ensure the blob is loaded
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)

      toast({
        title: 'Success',
        description: 'Report downloaded successfully',
      })
    } catch (error) {
      console.error('Report generation error:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to generate report',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          disabled={isLoading}
        >
          <Download className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating...' : 'Download Report'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => generateReport('finance')}
          className="cursor-pointer"
          disabled={isLoading}
        >
          Finance Report
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => generateReport('stores')}
          className="cursor-pointer"
          disabled={isLoading}
        >
          Stores Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ReportDownloadButton

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

interface ReportDownloadProps {
  onGenerateReport: () => Promise<void>
  selectedBlend: { id: string } | null
}

const ReportDownloadButton = ({
  onGenerateReport,
  selectedBlend,
}: ReportDownloadProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  interface ReportGenerationError {
    message: string
  }

  interface ReportType {
    reportType: 'finance' | 'stores'
  }

  const handleGenerateReport = async (
    reportType: ReportType['reportType'],
  ): Promise<void> => {
    if (reportType === 'finance') {
      if (!selectedBlend?.id) {
        toast({
          title: 'Error',
          description: 'No blend selected',
          variant: 'destructive',
        })
        return
      }

      setIsLoading(true)
      try {
        await onGenerateReport()
      } catch (error: unknown) {
        console.error('Report generation error:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to generate report',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    } else if (reportType === 'stores') {
      if (!selectedBlend?.id) {
        toast({
          title: 'Error',
          description: 'No blend selected',
          variant: 'destructive',
        })
        return
      }

      setIsLoading(true)
      try {
        await onGenerateReport()
      } catch (error: unknown) {
        console.error('Report generation error:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to generate report',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
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
          onClick={() => handleGenerateReport('finance')}
          className="cursor-pointer"
          disabled={isLoading}
        >
          Finance Report
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleGenerateReport('stores')}
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

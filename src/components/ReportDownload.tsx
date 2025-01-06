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

interface ReportType {
  reportType: 'finance' | 'stores'
}

interface ReportDownloadProps {
  onGenerateReport: () => Promise<void>
  selectedBlend: { id: string } | null
  type: ReportType['reportType']
  onTypeChange: (type: ReportType['reportType']) => void
  isLoading: boolean
}

const ReportDownloadButton = ({
  onGenerateReport,
  selectedBlend,
  type,
  onTypeChange,
}: ReportDownloadProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  interface ReportGenerationError {
    message: string
  }

  const handleGenerateReport = async (
    reportType: ReportType['reportType'],
  ): Promise<void> => {
    // Notify parent component about type change
    onTypeChange?.(reportType)

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

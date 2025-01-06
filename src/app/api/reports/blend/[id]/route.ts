// src/app/api/reports/blend/[id]/route.ts
import { apiClient } from '@/lib/utils'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = params.id

  if (!id) {
    return NextResponse.json(
      { error: 'Report ID is required' },
      { status: 400 },
    )
  }

  try {
    const response = await apiClient({
      url: `/reportext/pdf/t_mod_new.tea_blend_report/${id}`,
      method: 'GET',
      responseType: 'arraybuffer',
    })

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=blend-report-${id}.pdf`,
      },
    })
  } catch (error) {
    console.error('PDF Generation Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while generating the report.' },
      { status: 500 },
    )
  }
}

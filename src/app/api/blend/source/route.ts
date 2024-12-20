import { apiClient } from '@/lib/utils'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Get Blends
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const type = searchParams.get('type')

  try {
    const response = await apiClient({
      url: `/tea/blend/source?id=${id}&type=${type}`,
      method: 'GET',
    })

    return NextResponse.json(response.data)
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err.response.data.error || 'An error occurred while fetching blends.',
      },
      { status: 500 },
    )
  }
}

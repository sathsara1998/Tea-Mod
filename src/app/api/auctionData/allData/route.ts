import { apiClient } from '@/lib/utils'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
// Get All Auction data
export async function GET() {
  try {
    const response = await apiClient({
      url: '/tea/lot/all',
      method: 'GET',
    })

    return NextResponse.json(response.data)
  } catch (err) {
    return NextResponse.json(
      { error: 'An error occurred while fetching data.' },
      { status: 500 },
    )
  }
}

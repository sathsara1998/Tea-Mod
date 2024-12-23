import { apiClient } from '@/lib/utils'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

//Reset Blend Status
export async function POST(req: Request) {
  const data = await req.json()

  try {
    const response = await apiClient({
      url: `/draft_blend`,
      method: 'POST',
      data: data,
    })

    return NextResponse.json(response.data)
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: 'An error occured While Reseting Blend' })
  }
}

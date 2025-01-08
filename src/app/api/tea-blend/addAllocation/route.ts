import { apiClient } from '@/lib/utils'
import { NextResponse } from 'next/server'

// Create Blend
export async function POST(req: Request) {
  const data = await req.json()

  try {
    const response = await apiClient({
      url: '/tea_blend/add_demand_line',
      method: 'POST',
      data: data,
    })

    return NextResponse.json(response.data)
  } catch (err) {
    console.log(err)

    return NextResponse.json({ error: `${err}` }, { status: 500 })
  }
}

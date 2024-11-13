import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";


// Get Blends
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    try {
        const response = await apiClient({
            url: `/tea_blends?customer_id=${id}`,
            method: 'GET',
        });

        return NextResponse.json(response.data);
    } catch (err: any) {
        return NextResponse.json({ error: err.response.data.error || 'An error occurred while fetching blends.' }, { status: 500 });
    }
}
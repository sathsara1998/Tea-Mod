import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";


// Get Blends
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sale_order_number = searchParams.get('sale_order_number');
    
    try {
        const response = await apiClient({
            url: `/tea_blend_sales?sale_order_number=${sale_order_number}`,
            method: 'GET',
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'Error fetching confirmed sale orders. Please try again.' }, { status: 500 });
    }
}
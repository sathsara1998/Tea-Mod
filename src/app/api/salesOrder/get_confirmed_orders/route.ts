import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";


// Get Blends
export async function GET() {
    try {
        const response = await apiClient({
            url: '/confirmed_sale_orders',
            method: 'GET',
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'Error fetching confirmed sale orders. Please try again.' }, { status: 500 });
    }
}
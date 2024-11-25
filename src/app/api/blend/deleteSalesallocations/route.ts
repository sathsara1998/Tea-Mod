import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

// Delete Allocations in Sales allocations
export async function POST(req: Request) {
    const data = await req.json();

    try {
        const response = await apiClient({
            url: `/tea_blends/delete_sales_allocations`,
            method: 'POST',
            data: data
        });

        return NextResponse.json(response.data);
    } catch (err) {
        console.log(err);
        
        return NextResponse.json({ error: 'An error occurred while Deleting the Allocations.' }, { status: 500 });
    }
}
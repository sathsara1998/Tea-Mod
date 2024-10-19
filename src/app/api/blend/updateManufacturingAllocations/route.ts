import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

// Update Allocations in blend
export async function PUT(req: Request) {
    const data = await req.json();

    try {
        const response = await apiClient({
            url: `/tea_blends/update_manufacturing_allocations`,
            method: 'PUT',
            data: data
        });

        return NextResponse.json(response.data);
    } catch (err) {
        console.log(err);
        
        return NextResponse.json({ error: 'An error occurred while updating the Allocations.' }, { status: 500 });
    }
}
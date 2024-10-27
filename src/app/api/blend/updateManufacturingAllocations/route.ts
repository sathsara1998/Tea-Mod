import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

// Update Allocations in blend
export async function PUT(req: Request) {
    const data = await req.json();

    try {
        console.log(data.data);
        // const response = await apiClient({
        //     url: `/tea/package/allocate`,
        //     method: 'POST',
        //     data: data
        // });

        // return NextResponse.json(response.data);
    } catch (err) {
        console.log(err);
        
        return NextResponse.json({ error: 'An error occurred while updating the Allocations.' }, { status: 500 });
    }
}
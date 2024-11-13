import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

// Allocate Package
export async function POST(req: Request) {
    const data = await req.json();

    try {
        const response = await apiClient({
            url: '/tea/package/allocate',
            method: 'POST',
            data: data
        });

        return NextResponse.json(response.data);
    } catch (err: any) {
        return NextResponse.json({ error: err.response.data.results[0].error || 'An error occurred while Adding Allocations.' }, { status: 500 });
    }
}
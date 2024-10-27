import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

// Split Package
export async function POST(req: Request) {
    const data = await req.json();

    try {
        const response = await apiClient({
            url: '/tea/package/split',
            method: 'POST',
            data: data
        });

        return NextResponse.json(response.data);
    } catch (err: any) {
        return NextResponse.json({ error: err.response.data.error || 'An error occurred while Adding Allocations.' }, { status: 500 });
    }
}
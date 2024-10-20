import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

// Get Blends
export async function GET() {
    try {
        const response = await apiClient({
            url: '/contract_details',
            method: 'GET',
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'Error fetching confirmed sale orders. Please try again.' }, { status: 500 });
    }
}
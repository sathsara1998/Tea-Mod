import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

// Get All Auction data
export async function GET() {
    try {
        const response = await apiClient({
            url: '/tea/auction_data',
            method: 'GET',
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred while fetching data.' }, { status: 500 });
    }
}
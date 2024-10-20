import { apiClient } from '@/lib/utils';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

// Get Customers
export async function GET() {
    try {
        const response = await apiClient({
            url: '/customers',
            method: 'GET',
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred while fetching Customers.' }, { status: 500 });
    }
}
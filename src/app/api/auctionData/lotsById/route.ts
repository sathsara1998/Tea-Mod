import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

// Get All Auction data
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = []
    id.push(searchParams.get('id'));


    console.log("id", id);

    try {
        const response = await apiClient({
            url: `/tea/lot/packages/${id}`,
            method: 'GET',
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred while fetching data.' }, { status: 500 });
    }
}
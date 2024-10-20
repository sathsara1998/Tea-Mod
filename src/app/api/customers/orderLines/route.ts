import { apiClient } from '@/lib/utils';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

// Get Customer order lines
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    try {
        const response = await apiClient({
            url: `tea_blend_sales?partner_id=${id}`,
            method: 'GET',
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred while fetching Customers.' }, { status: 500 });
    }
}
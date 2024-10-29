import { apiClient } from '@/lib/utils';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";


// Get Blend data by id
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    try {
        const response = await apiClient({
            url: `/tea_blends?blend_number=${id}`,
            method: 'GET'
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred while getting blend data.' }, { status: 500 });
    }
}
import { apiClient } from '@/lib/utils';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

// Get Blends
export async function GET() {
    try {
        const response = await apiClient({
            url: '/get_blends',
            method: 'GET',
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred while fetching blends.' }, { status: 500 });
    }
}


// Create Blends
export async function POST(req: Request) {
    const data = await req.json();
    
    try {
        const response = await apiClient({
            url: '/create_blend',
            method: 'POST',
            data: data
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred while Creating blends.' }, { status: 500 });
    }
}


// Update Blends
export async function PUT(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const data = await req.json();
    
    try {
        const response = await apiClient({
            url: `/update_blend/${id}`,
            method: 'PUT',
            data: data
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred while updating the blend.' }, { status: 500 });
    }
}


// Delete Blends
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    try {
        const response = await apiClient({
            url: `/delete_blend/${id}`,
            method: 'DELETE'
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred while updating the blend.' }, { status: 500 });
    }
}
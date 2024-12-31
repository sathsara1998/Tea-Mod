import { apiClientForReports } from '@/lib/utils';
import { NextResponse } from 'next/server';


export const dynamic = "force-dynamic";
// Get All Auction data
export async function GET() {
    try {
        const response = await apiClientForReports({
            url: '/Auctions/get-auction-for-reports',
            method: 'GET',
        });
        const list = response.data;
        const groupedByCatelog = Object.groupBy(list, (item: any) => item.CatalogId);
        return NextResponse.json(groupedByCatelog);
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred while fetching data.' }, { status: 500 });
    }
}
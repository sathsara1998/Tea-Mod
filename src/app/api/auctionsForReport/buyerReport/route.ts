import { apiClientForReports } from '@/lib/utils';
import { NextResponse } from 'next/server';


export const dynamic = "force-dynamic";
// Get All Auction data
export async function POST(req: Request) {
    const data = await req.json()

    let requestObj = {
        pageNumber: 1,
        pageSize: 50,
        ignorePaging: true,
        sortDesc: true,
        totalItems: 0,
        companyId: 0,
        buyerId: 0,
        lotNumber: 0,
        brokerId: 0,
        gradeId: 0,
        sellerId: 0,
        sold: false,
        outLotSell: false,
        isGroupByGrade: false,
        isGroupByStandard: false,
        isGroupByBroker: false,
        categoryId: 0,
        companyCertificationsId: 0,
        rePrint: false,
        rainforest: false
    }

    requestObj = { ...requestObj, ...data }

    try {
        const response = await apiClientForReports({
            url: '/Reports/buyer-report',
            method: 'POST',
            data: requestObj,
        });
        const list = response.data;
        return NextResponse.json(list);
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred while fetching data.' }, { status: 500 });
    }
}
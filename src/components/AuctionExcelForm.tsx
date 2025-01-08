import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from './ui/use-toast'
import { useApiMethods } from '@/hooks/useApiMethods'
import { AuctionItemDetail, AuctionReportDetail, BuyerExcelColumns } from './types'
import { Key, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function AuctionExcelForm() {
    const { auctionsForReport, buyerReport } = useApiMethods()
    const { toast } = useToast()
    const [catelogs, setCatelogs] = useState<Record<string, Array<AuctionReportDetail>>>({})
    const [loading, showLoading] = useState(true)
    const [exportLoading, setExportLoading] = useState(false)
    const selectedCatelog = useRef<string | number>("")
    const selectedCatelogItems = useRef<Array<AuctionReportDetail>>([]);
    const reportList = useRef<Array<AuctionItemDetail>>([])

    useEffect(() => {
        showLoading(true)
        auctionsForReport().then((res: Record<string, Array<AuctionReportDetail>>) => {
            setCatelogs(res);
        }).catch(error => {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch auctions',
                variant: 'destructive',
            })
        }).finally(() => {
            showLoading(false)
        })
    }, [])

    const getName = (obj: AuctionReportDetail) => {
        const namesplit = obj.Name.split(" - ");
        if (namesplit && namesplit.length > 0) {
            return namesplit[0];
        }
        return obj.Name;
    }

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        reportList.current = [];
        selectedCatelog.current = selectedValue;
        selectedCatelogItems.current = catelogs[selectedValue]
    };

    const getReportItems = (e: any) => {
        e.preventDefault();
        setExportLoading(true);
        if (selectedCatelog.current) {
            Promise.all(selectedCatelogItems.current.map(item => getItemsForReport(item.Id))).then(() => {
                exportExcel()
            }).catch(error => {
                toast({
                    title: 'Error',
                    description:
                        error instanceof Error
                            ? error.message
                            : 'Failed to generate excel file',
                    variant: 'destructive',
                })
                setExportLoading(false);
            })
        }
    }

    const getItemsForReport = (auctionId: number) => {
        return new Promise<void>((resolve, reject) => {
            buyerReport({
                auctionId: auctionId,
                catalogId: selectedCatelog.current.toString(),
            }).then((res: any) => {
                reportList.current = [...reportList.current, ...res.data]
                resolve();
            }).catch(error => {
                reject(error);
            })
        })
    }

    const exportExcel = () => {
        const formattedData = reportList.current.map((item: AuctionItemDetail) => {
            const newItem: { [key: string]: any } = {};
            Object.entries(BuyerExcelColumns).forEach(([key, value]) => {
                newItem[value] = item[key as keyof AuctionItemDetail];
            })
            return newItem;
        });

        // Create a worksheet with formatted data
        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Write the file and download it
        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        });

        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'data.xlsx');
        setExportLoading(false);
    }

    const Selection = () => {
        return (
            <select id="catelogs" onChange={handleSelectChange} defaultValue="" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-auto">
                <option value="" disabled>Select an option</option>
                {Object.entries(catelogs).map(([key, value]) => {
                    return <option key={key} value={key}>{getName(value[0])}</option>
                })}
            </select>
        )
    }

    const LoadingArea = () => {
        return (
            <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Select Catelog</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="max-w-md mx-auto flex justify-center items-center">
                    <label id="catelogs" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white w-[100%]">Select an option</label>
                    {loading ? <LoadingArea /> : <Selection />}

                    <Button className="bg-green-600 mx-10 text-white" disabled={loading || exportLoading} onClick={getReportItems}>
                        {exportLoading && <Loader2 className="animate-spin" />}
                        Export Excel
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
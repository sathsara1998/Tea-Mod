import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface TotalDemand {
  blendName: string;
  totalQuantity: number;
}

interface TotalDemandCardProps {
  totalDemand: TotalDemand[];
}

const TotalDemandCard: React.FC<TotalDemandCardProps> = ({ totalDemand }) => {
  return (
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>Total Demand</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Blend</TableHead>
                <TableHead>Total Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {totalDemand.map((demand) => (
                <TableRow key={demand.blendName}>
                  <TableCell>{demand.blendName}</TableCell>
                  <TableCell>{demand.totalQuantity.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );
};

export default TotalDemandCard;

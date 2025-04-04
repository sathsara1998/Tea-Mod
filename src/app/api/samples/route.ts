import { NextResponse } from 'next/server';
import { Sample, ApiResponse } from '@/app/types/sample';
import { samples } from '@/app/data/sample';

const generateId = (): number => {
  return samples.length > 0 ? Math.max(...samples.map(s => s.id)) + 1 : 1;
};

const generateTrackingNumber = (): string => {
  return `Tra${String(samples.length + 1).padStart(3, '0')}`;
};

export async function GET(): Promise<NextResponse<ApiResponse<Sample[]>>> {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    return NextResponse.json({ data: samples });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch samples' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<Sample>>> {
  try {
    const body: Omit<Sample, 'id' | 'reference' | 'creationdate' | 'tracking_number'> = await request.json();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newSample: Sample = {
      ...body,
      id: generateId(),
      reference: `SI-ERM-${String(generateId()).padStart(3, '0')}`,
      creationdate: new Date().toISOString().split('T')[0],
      tracking_number: generateTrackingNumber(),
      tracking_stages: {
        handover_to_courier: { date: "", completed: false },
        package_to_collection: { date: "", completed: false },
        package_shipped: { date: "", completed: false },
        package_arrived: { date: "", completed: false },
        picked_by_clearance: { date: "", completed: false }
      }
    };
    
    samples.unshift(newSample);
    
    return NextResponse.json({ data: newSample }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create sample' },
      { status: 500 }
    );
  }
}
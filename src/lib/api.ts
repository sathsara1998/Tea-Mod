import { Sample } from '@/app/types/sample';

export const api = {
  getSamples: async (): Promise<Sample[]> => {
    const response = await fetch('/api/samples');
    if (!response.ok) throw new Error('Failed to fetch samples');
    const data = await response.json();
    return data.data || [];
  },
  
  createSample: async (
    sampleData: Omit<Sample, 'id' | 'reference' | 'creationdate' | 'tracking_number'>
  ): Promise<Sample> => {
    const response = await fetch('/api/samples', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sampleData)
    });
    if (!response.ok) throw new Error('Failed to create sample');
    const data = await response.json();
    return data.data;
  }
};
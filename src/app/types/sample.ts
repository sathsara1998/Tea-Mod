export interface TrackingStage {
    date: string;
    completed: boolean;
  }
  
  export interface TrackingStages {
    handover_to_courier: TrackingStage;
    package_to_collection: TrackingStage;
    package_shipped: TrackingStage;
    package_arrived: TrackingStage;
    picked_by_clearance: TrackingStage;
  }
  
  export interface RequestedSample {
    name: string;
    standerd_code: string;
    net_weight: number;
    reference: string;
    store_stat: string;
  }
  
  export interface CourierService {
    name: string;
    charges: number;
  }
  
  export interface Customer {
    name: string;
    address: string;
    country: string;
  }
  
  export interface Sample {
    id: string;
    reference: string;
    creationdate: string;
    ed: string;
    customer: Customer;
    status: string;
    requested_samples: RequestedSample[];
    courier_service: CourierService;
    sample_storing_area: string;
    trader: string;
    tracking_number: string;
    tracking_stages: TrackingStages;
  }
  
  export interface ApiResponse<T> {
    data?: T;
    error?: string;
  }
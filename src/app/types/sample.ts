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
  creation_date: string;
  expected_delivery: string;
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

export interface StatusType {
  status: "sent" | "draft" | "done" | "cancel" | string | null | undefined
}


interface Sample1 {
  id: string;
  reference: string;
  creationdate: string;
  ed: string;
  customer: {
    name: string;
    address: string;
    country: string;
  };
  status: string;
  requested_samples: {
    name: string;
    standerd_code: string;
    net_weight: number;
    reference: string;
    store_stat: string;
  }[];
  courier_service: {
    name: string;
    charges: number;
  };
  sample_storing_area: string;
  trader: string;
  tracking_number: string;
  tracking_stages: {
    handover_to_courier: {
      date: string;
      completed: boolean;
    };
    package_to_collection: {
      date: string;
      completed: boolean;
    };
    package_shipped: {
      date: string;
      completed: boolean;
    };
    package_arrived: {
      date: string;
      completed: boolean;
    };
    picked_by_clearance: {
      date: string;
      completed: boolean;
    };
  };
}
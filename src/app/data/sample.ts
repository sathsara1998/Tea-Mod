// app/data/samples.ts

// Define types for the requested sample and courier service
type RequestedSample = {
  name: string;
  standerd_code: string;
  net_weight: number;
  reference: string;
  store_stat: string;
};

type CourierService = {
  name: string;
  charges: number;
};

type TrackingStage = {
  date: string;
  completed: boolean;
};

type TrackingStages = {
  handover_to_courier: TrackingStage;
  package_to_collection: TrackingStage;
  package_shipped: TrackingStage;
  package_arrived: TrackingStage;
  picked_by_clearance: TrackingStage;
};

type Customer = {
  name: string;
  address: string;
  country: string;
};

type Sample = {
  id: number;
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
};

// Define the requested samples array
const requested_samples: RequestedSample[] = [
  {
    name: "Chai Tea Srilanka",
    standerd_code: "ahj_jk_005_al",
    net_weight: 200,
    reference: "Get A packing Most Important Sheet",
    store_stat: "Pending"
  },
  {
    name: "Herbal Tea Standard",
    standerd_code: "Sdl_Al_0114A_lk",
    net_weight: 100,
    reference: "Get A packing Most Important Sheet",
    store_stat: "Pending"
  },
  {
    name: "White Tea Standard",
    standerd_code: "Sdl_Al_0114A_lk",
    net_weight: 300,
    reference: "Get A packing Most Important Sheet",
    store_stat: "Pending"
  }
];

// Define the tracking stages object
const tracking_stages: TrackingStages = {
  handover_to_courier: { 
    date: "2025-04-01", 
    completed: true 
  },
  package_to_collection: { 
    date: "2025-04-02", 
    completed: true 
  },
  package_shipped: { 
    date: "2025-04-03", 
    completed: true 
  },
  package_arrived: { 
    date: "2025-04-04", 
    completed: false 
  },
  picked_by_clearance: { 
    date: "2025-04-05", 
    completed: false 
  }
};

// Define the samples array
export const samples: Sample[] = [
  {
    id: 1,
    reference: "SI-ERM-001",
    creationdate: "2024/12/01",
    ed: "2025/01/02",
    customer: {
      name: "Sigath",
      address: "No 1 , Colombo",
      country: "Sri Lanka",
    },
    status: "Draft",
    requested_samples:  [
      {
        name: "Chai Tea Srilanka",
        standerd_code: "ahj_jk_005_al",
        net_weight: 200,
        reference: "Get A packing Most Important Sheet",
        store_stat: "Pending"
      },
      {
        name: "Herbal Tea Standard",
        standerd_code: "Sdl_Al_0114A_lk",
        net_weight: 100,
        reference: "Get A packing Most Important Sheet",
        store_stat: "Pending"
      },
      {
        name: "White Tea Standard",
        standerd_code: "Sdl_Al_0114A_lk",
        net_weight: 300,
        reference: "Get A packing Most Important Sheet",
        store_stat: "Pending"
      }
    ],
    courier_service: {
      name: "FedEx",
      charges: 2500
    },
    sample_storing_area: "Tea Room",
    trader: "Jhonethon",
    tracking_number: "Tra001",
    tracking_stages: {
      handover_to_courier: { 
        date: "2025-04-01", 
        completed: true 
      },
      package_to_collection: { 
        date: "2025-04-02", 
        completed: true 
      },
      package_shipped: { 
        date: "2025-04-03", 
        completed: true 
      },
      package_arrived: { 
        date: "2025-04-04", 
        completed: false 
      },
      picked_by_clearance: { 
        date: "2025-04-05", 
        completed: false 
      }
  },
}
]

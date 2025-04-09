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

// Tea Tang brand colors
export const BRAND_COLORS = {
  primary: "#B91C1C", // Tea Tang red
  secondary: "#FFFFFF", // White
  accent: "#8B0000", // Darker red for hover states
  text: "#333333",
  background: "#FFFFFF",
}

// Mock client data - in a real app, this would come from your API or database
export const clients = [
  {
    id: "client1",
    name: "Acme Corporation",
    address: "123 Business Ave, Suite 100, Business District",
    country: "United States",
  },
  {
    id: "client2",
    name: "Global Enterprises",
    address: "456 Commerce St, Tower B, Financial Center",
    country: "United Kingdom",
  },
  {
    id: "client3",
    name: "Pacific Trading Co.",
    address: "789 Harbor Blvd, Warehouse 5, Port Area",
    country: "Japan",
  },
]

// Mock trader data
export const traders = [
  { id: "trader1", name: "John Smith" },
  { id: "trader2", name: "Emma Johnson" },
  { id: "trader3", name: "Michael Wong" },
  { id: "trader4", name: "Sarah Davis" },
]

// Mock tea standards
export const teaStandards = [
  {
    id: "1",
    name: "Chai Tea Srilanka",
    standerd_code: "ahj_jk_005_al",
    net_weight: 200,
    reference: "Get A packing Most Important Sheet",
    store_stat: "Pending",
  },
  {
    id: "2",
    name: "Herbal Tea Standard",
    standerd_code: "Sdl_Al_0114A_lk",
    net_weight: 100,
    reference: "Get A packing Most Important Sheet",
    store_stat: "Pending",
  },
  {
    id: "3",
    name: "White Tea Standard",
    standerd_code: "Sdl_Al_0114A_lk",
    net_weight: 300,
    reference: "Get A packing Most Important Sheet",
    store_stat: "Pending",
  },
  {
    id: "4",
    name: "Oolong Tea Premium",
    standerd_code: "ool_tea_0123_lk",
    net_weight: 250,
    reference: "Premium Quality Oolong",
    store_stat: "Pending",
  },
  {
    id: "5",
    name: "Black Tea Classic",
    standerd_code: "blk_tea_0789_lk",
    net_weight: 150,
    reference: "Fine Blend Black Tea",
    store_stat: "Pending",
  },
  {
    id: "6",
    name: "Chamomile Herbal Tea",
    standerd_code: "chm_te_0912_lk",
    net_weight: 180,
    reference: "Relaxing Herbal Chamomile",
    store_stat: "Pending",
  },
  {
    id: "7",
    name: "Peppermint Tea",
    standerd_code: "pep_te_0345_lk",
    net_weight: 220,
    reference: "Minty Fresh Peppermint",
    store_stat: "Pending",
  },
  {
    id: "8",
    name: "Golden Tip Tea",
    standerd_code: "gold_tea_0567_lk",
    net_weight: 275,
    reference: "Luxury Golden Tip Tea",
    store_stat: "Pending",
  },
  {
    id: "9",
    name: "Organic Green Tea",
    standerd_code: "org_tea_0678_lk",
    net_weight: 320,
    reference: "100% Organic Green Tea",
    store_stat: "Pending",
  },
  {
    id: "10",
    name: "Darjeeling First Flush",
    standerd_code: "dar_tea_0890_lk",
    net_weight: 350,
    reference: "Premium Darjeeling First Flush",
    store_stat: "Pending",
  },
]

// Mock courier services
export const courierServices = [
  { id: "courier1", name: "Express Delivery" },
  { id: "courier2", name: "Standard Shipping" },
  { id: "courier3", name: "Premium Logistics" },
  { id: "courier4", name: "Global Transport" },
  { id: "courier5", name: "FedEx" },
]

// Mock storage areas
export const storageAreas = ["Main Warehouse", "Temperature Controlled", "Secure Storage", "Quarantine Area", "Tea Room"]



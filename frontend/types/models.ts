export interface Service {
  id?: string;
  name: string;
  description: string;
  duration: string; // minutes
  price: string;
  options?: optionService[];
}

export interface optionService {
  id: string;
  name: string;
  price: string
}

export interface Customer {
  id: string;
  fullname: string;
  username: string;
  phone: string;
  email?: string;
  address?: string;
  pets: any[];
  membershipTier?: string;
  totalPoints?: number;
}

export interface Order {
  id: string;
  customerName: string;
  customer?: Customer;
  staff?: Staff;
  employee: string;
  totalPrice: number;
  totalDuration: number;
  createdAt: string;
  order:any;
  status: 'Pending' | 'Completed' | 'Cancelled';
}

export interface Staff {
  id: string;
  name: string;
  phone?: string;
  role: string;
  hiredDate?: string; // ISO date string
}

export interface Appointment {
  id: number;
  customerName: string;
  serviceName: string;
  employeeName: string;
  date: string; // ISO date string
  time: string; // e.g., "14:30"
  status: 'scheduled' | 'completed' | 'canceled';
}

export interface AuthResponse {
  token: string
  user: Customer
}

export interface Pet {
  id: string;
  customerId: string;
  customer?: Customer | null;
  name: string;
  species: string;
  breed: string;
  gender: "MALE" | "FEMALE" | string;
  age: string; // allow string as in example
  weight: string;
  healthNotes?: string;
}
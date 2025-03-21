export type VehicleCategory = 'Car' | 'Truck' | 'Bus' | 'Van';

export interface DriverLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface DriverAvailability {
  id: string;
  driverId: string;
  startTime: string;
  endTime: string;
  location: DriverLocation;
  isActive: boolean;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  profilePicture?: string;
  rating: number;
  totalRides: number;
  recentHires?: number;
  vehicleCategories?: VehicleCategory[];
  skills?: string[];
  isAvailable: boolean;
  isOnline?: boolean;
  distance?: number;
  allowCalls: boolean;
  governmentIdVerified: boolean;
  isIndianGovernment: boolean;
  currentAvailability?: DriverAvailability;
}
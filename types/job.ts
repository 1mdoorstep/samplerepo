import { VehicleCategory } from './driver';

export type JobType = 'Personal' | 'Commercial' | 'Government';
export type JobStatus = 'Open' | 'Assigned' | 'Completed' | 'Cancelled';
export type JobCategory = 
  | 'Rideshare' 
  | 'Delivery' 
  | 'Logistics' 
  | 'Personal' 
  | 'Commercial' 
  | 'Shopping'
  | 'Electrician'
  | 'Plumbing'
  | 'Security'
  | 'Food'
  | 'Construction'
  | 'Carpentry'
  | 'Painting'
  | 'IT'
  | 'Networking'
  | 'Gardening'
  | 'Healthcare'
  | 'Caregiving';

export interface JobLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  driverId: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  appliedAt: string;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  description: string;
  vehicleRequired: VehicleCategory;
  jobType: JobType;
  category?: JobCategory;
  companyId?: string;
  companyName?: string;
  location: JobLocation;
  fare?: number;
  duration?: string;
  status: JobStatus;
  postedAt: string;
  expiresAt: string;
  assignedDriverId?: string;
  applications?: JobApplication[];
  applicationsCount?: number;
  isSurging?: boolean;
}
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job, JobType } from '@/types/job';
import { VehicleCategory } from '@/types/driver';

interface JobState {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
}

interface JobStore extends JobState {
  fetchJobs: () => Promise<void>;
  postJob: (job: Omit<Job, 'id' | 'postedAt' | 'status'>) => Promise<void>;
  applyForJob: (jobId: string, driverId: string) => Promise<void>;
  cancelJob: (jobId: string) => Promise<void>;
  completeJob: (jobId: string) => Promise<void>;
  clearError: () => void;
}

// Mock jobs data
const MOCK_JOBS: Job[] = [
  {
    id: "job-1",
    userId: "user-2",
    title: "Airport Transfer",
    description: "Need a driver to take me to the airport tomorrow morning.",
    vehicleRequired: "Car",
    jobType: "Personal",
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: "San Francisco, CA"
    },
    fare: 50,
    duration: "2 hours",
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "Open"
  },
  {
    id: "job-2",
    userId: "user-3",
    title: "Office Commute",
    description: "Looking for a regular driver for daily office commute.",
    vehicleRequired: "Car",
    jobType: "Personal",
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
      address: "Downtown, San Francisco"
    },
    fare: 30,
    duration: "1 hour",
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: "Open"
  },
  {
    id: "job-3",
    userId: "user-4",
    title: "Furniture Delivery",
    description: "Need a truck driver to help move furniture to a new apartment.",
    vehicleRequired: "Truck",
    jobType: "Personal",
    location: {
      latitude: 37.7694,
      longitude: -122.4862,
      address: "Golden Gate Park, SF"
    },
    fare: 100,
    duration: "4 hours",
    postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    status: "Open"
  },
  {
    id: "job-4",
    userId: "user-5",
    title: "Corporate Event Transportation",
    description: "Need multiple drivers for a corporate event transportation.",
    vehicleRequired: "Van",
    jobType: "Commercial",
    location: {
      latitude: 37.7835,
      longitude: -122.4096,
      address: "Moscone Center, SF"
    },
    fare: 200,
    duration: "8 hours",
    postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    status: "Open"
  },
  {
    id: "job-5",
    userId: "user-6",
    title: "Government Office Shuttle",
    description: "Regular shuttle service for government employees.",
    vehicleRequired: "Bus",
    jobType: "Government",
    location: {
      latitude: 37.7793,
      longitude: -122.4192,
      address: "City Hall, SF"
    },
    fare: 300,
    duration: "10 hours",
    postedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
    status: "Open"
  }
];

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      jobs: MOCK_JOBS,
      isLoading: false,
      error: null,

      fetchJobs: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would fetch from an API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ 
            jobs: MOCK_JOBS,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to fetch jobs" 
          });
        }
      },

      postJob: async (jobData) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would post to an API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newJob: Job = {
            id: `job-${Date.now()}`,
            postedAt: new Date().toISOString(),
            status: "Open",
            ...jobData
          };
          
          const { jobs } = get();
          
          set({ 
            jobs: [newJob, ...jobs],
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to post job" 
          });
        }
      },

      applyForJob: async (jobId, driverId) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would update via an API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { jobs } = get();
          const updatedJobs = jobs.map(job => {
            if (job.id === jobId) {
              return {
                ...job,
                status: "Assigned",
                assignedTo: driverId
              };
            }
            return job;
          });
          
          set({ 
            jobs: updatedJobs,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to apply for job" 
          });
        }
      },

      cancelJob: async (jobId) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would update via an API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { jobs } = get();
          const updatedJobs = jobs.map(job => {
            if (job.id === jobId) {
              return {
                ...job,
                status: "Cancelled"
              };
            }
            return job;
          });
          
          set({ 
            jobs: updatedJobs,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to cancel job" 
          });
        }
      },

      completeJob: async (jobId) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would update via an API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { jobs } = get();
          const updatedJobs = jobs.map(job => {
            if (job.id === jobId) {
              return {
                ...job,
                status: "Completed"
              };
            }
            return job;
          });
          
          set({ 
            jobs: updatedJobs,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to complete job" 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'job-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ jobs: state.jobs }),
    }
  )
);
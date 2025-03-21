import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Driver, DriverAvailability, VehicleCategory } from '@/types/driver';

interface DriverState {
  drivers: Driver[];
  availableDrivers: Driver[];
  isLoading: boolean;
  error: string | null;
}

interface DriverStore extends DriverState {
  fetchDrivers: () => Promise<void>;
  setAvailability: (driverId: string, available: boolean) => Promise<void>;
  updateDriverProfile: (driver: Partial<Driver>) => Promise<void>;
  toggleCallPermission: (driverId: string) => Promise<void>;
  clearError: () => void;
}

// Ensure we have consistent dummy data
const MOCK_DRIVERS: Driver[] = [
  {
    id: "driver-1",
    userId: "user-1",
    name: "John Doe",
    phone: "+1234567890",
    profilePicture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    rating: 4.8,
    totalRides: 156,
    recentHires: 5,
    vehicleCategories: ["Car", "Van"],
    isAvailable: true,
    isOnline: true,
    distance: 2.5,
    allowCalls: true,
    governmentIdVerified: true,
    isIndianGovernment: false,
    skills: ["English", "Hindi", "Safe Driver"],
    currentAvailability: {
      id: "avail-1",
      driverId: "driver-1",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: "San Francisco, CA"
      },
      isActive: true
    }
  },
  {
    id: "driver-2",
    userId: "user-2",
    name: "Jane Smith",
    phone: "+1987654321",
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    rating: 4.5,
    totalRides: 89,
    recentHires: 2,
    vehicleCategories: ["Car"],
    isAvailable: true,
    isOnline: true,
    distance: 4.2,
    allowCalls: false,
    governmentIdVerified: false,
    isIndianGovernment: false,
    skills: ["English", "Spanish", "City Knowledge"],
    currentAvailability: {
      id: "avail-2",
      driverId: "driver-2",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      location: {
        latitude: 37.7833,
        longitude: -122.4167,
        address: "Downtown, San Francisco"
      },
      isActive: true
    }
  },
  {
    id: "driver-3",
    userId: "user-3",
    name: "Robert Johnson",
    phone: "+1122334455",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    rating: 4.9,
    totalRides: 210,
    recentHires: 8,
    vehicleCategories: ["Truck", "Bus", "Van"],
    isAvailable: true,
    isOnline: true,
    distance: 1.8,
    allowCalls: true,
    governmentIdVerified: true,
    isIndianGovernment: true,
    skills: ["English", "Hindi", "Tamil", "Heavy Vehicles"],
    currentAvailability: {
      id: "avail-3",
      driverId: "driver-3",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      location: {
        latitude: 37.7694,
        longitude: -122.4862,
        address: "Golden Gate Park, SF"
      },
      isActive: true
    }
  },
  {
    id: "driver-4",
    userId: "user-4",
    name: "Emily Davis",
    phone: "+1567890123",
    profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    rating: 4.6,
    totalRides: 78,
    recentHires: 0,
    vehicleCategories: ["Car"],
    isAvailable: false,
    isOnline: false,
    distance: 5.7,
    allowCalls: true,
    governmentIdVerified: false,
    isIndianGovernment: false,
    skills: ["English", "French", "Airport Routes"]
  },
  {
    id: "driver-5",
    userId: "user-5",
    name: "Michael Wilson",
    phone: "+1654321098",
    profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    rating: 4.7,
    totalRides: 132,
    recentHires: 3,
    vehicleCategories: ["Bus", "Truck"],
    isAvailable: false,
    isOnline: true,
    distance: 3.4,
    allowCalls: false,
    governmentIdVerified: true,
    isIndianGovernment: false,
    skills: ["English", "German", "Long Distance"]
  },
  {
    id: "driver-6",
    userId: "user-6",
    name: "Sarah Johnson",
    phone: "+1234567891",
    profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    rating: 4.9,
    totalRides: 178,
    recentHires: 6,
    vehicleCategories: ["Car", "Van"],
    isAvailable: true,
    isOnline: true,
    distance: 2.1,
    allowCalls: true,
    governmentIdVerified: true,
    isIndianGovernment: false,
    skills: ["English", "Spanish", "Safe Driver", "City Knowledge"],
    currentAvailability: {
      id: "avail-6",
      driverId: "driver-6",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: "San Francisco, CA"
      },
      isActive: true
    }
  }
];

export const useDriverStore = create<DriverStore>()(
  persist(
    (set, get) => ({
      drivers: MOCK_DRIVERS,
      availableDrivers: MOCK_DRIVERS.filter(driver => driver.isAvailable),
      isLoading: false,
      error: null,

      fetchDrivers: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would fetch from an API
          // For now, we'll use mock data
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const availableDrivers = MOCK_DRIVERS.filter(driver => driver.isAvailable);
          
          set({ 
            drivers: MOCK_DRIVERS,
            availableDrivers,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to fetch drivers" 
          });
        }
      },

      setAvailability: async (driverId: string, available: boolean) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would update via an API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { drivers } = get();
          const updatedDrivers = drivers.map(driver => {
            if (driver.id === driverId) {
              const now = new Date();
              const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);
              
              return {
                ...driver,
                isAvailable: available,
                currentAvailability: available ? {
                  id: `avail-${Date.now()}`,
                  driverId,
                  startTime: now.toISOString(),
                  endTime: fourHoursLater.toISOString(),
                  location: {
                    latitude: 37.7749,
                    longitude: -122.4194,
                    address: "Current Location"
                  },
                  isActive: true
                } : undefined
              };
            }
            return driver;
          });
          
          const availableDrivers = updatedDrivers.filter(driver => driver.isAvailable);
          
          set({ 
            drivers: updatedDrivers,
            availableDrivers,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to update availability" 
          });
        }
      },

      updateDriverProfile: async (driverData: Partial<Driver>) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would update via an API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { drivers } = get();
          const updatedDrivers = drivers.map(driver => {
            if (driver.id === driverData.id) {
              return { ...driver, ...driverData };
            }
            return driver;
          });
          
          const availableDrivers = updatedDrivers.filter(driver => driver.isAvailable);
          
          set({ 
            drivers: updatedDrivers,
            availableDrivers,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to update profile" 
          });
        }
      },

      toggleCallPermission: async (driverId: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would update via an API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { drivers } = get();
          const updatedDrivers = drivers.map(driver => {
            if (driver.id === driverId) {
              return { ...driver, allowCalls: !driver.allowCalls };
            }
            return driver;
          });
          
          const availableDrivers = updatedDrivers.filter(driver => driver.isAvailable);
          
          set({ 
            drivers: updatedDrivers,
            availableDrivers,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to toggle call permission" 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'driver-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ drivers: state.drivers }),
    }
  )
);
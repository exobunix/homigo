import * as Location from 'expo-location';
import { store } from '@/store';
import { setCurrentLocation, setLocationEnabled, setTracking } from '@/store/slices/locationSlice';
import { Location as LocationType } from '@/types';

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private isTracking = false;

  async initialize() {
    console.log('LocationService initialized');
    await this.requestPermissions();
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.log('❌ Foreground location permission denied');
        store.dispatch(setLocationEnabled(false));
        return false;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.log('⚠️ Background location permission denied');
      }

      store.dispatch(setLocationEnabled(true));
      console.log('✅ Location permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting location permissions:', error);
      store.dispatch(setLocationEnabled(false));
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationType | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocoding to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = reverseGeocode[0];
      const locationData: LocationType = {
        latitude,
        longitude,
        address: `${address?.name || ''} ${address?.street || ''} ${address?.district || ''}`.trim(),
        city: address?.city || '',
        state: address?.region || '',
        pincode: address?.postalCode || '',
      };

      store.dispatch(setCurrentLocation(locationData));
      return locationData;
    } catch (error) {
      console.error('❌ Error getting current location:', error);
      return null;
    }
  }

  async startTracking(): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      if (this.isTracking) {
        console.log('⚠️ Location tracking already started');
        return true;
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        async (location) => {
          const { latitude, longitude } = location.coords;

          // Reverse geocoding for address
          try {
            const reverseGeocode = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });

            const address = reverseGeocode[0];
            const locationData: LocationType = {
              latitude,
              longitude,
              address: `${address?.name || ''} ${address?.street || ''} ${address?.district || ''}`.trim(),
              city: address?.city || '',
              state: address?.region || '',
              pincode: address?.postalCode || '',
            };

            store.dispatch(setCurrentLocation(locationData));
          } catch (error) {
            // If reverse geocoding fails, still update coordinates
            const locationData: LocationType = {
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              city: '',
              state: '',
              pincode: '',
            };

            store.dispatch(setCurrentLocation(locationData));
          }
        }
      );

      this.isTracking = true;
      store.dispatch(setTracking(true));
      console.log('✅ Location tracking started');
      return true;
    } catch (error) {
      console.error('❌ Error starting location tracking:', error);
      store.dispatch(setTracking(false));
      return false;
    }
  }

  stopTracking() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
      this.isTracking = false;
      store.dispatch(setTracking(false));
      console.log('🛑 Location tracking stopped');
    }
  }

  async getDistanceBetween(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
  ): Promise<number> {
    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) * Math.cos(this.toRadians(to.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  isLocationTracking(): boolean {
    return this.isTracking;
  }

  cleanup() {
    this.stopTracking();
    console.log('🧹 LocationService cleaned up');
  }
}

export default new LocationService();

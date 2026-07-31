import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      // Use new banner/list flags instead of deprecated shouldShowAlert
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    } as any),
});

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  async initialize(): Promise<void> {
    console.log('NotificationService initialized');
    await this.registerForPushNotificationsAsync();
    this.setupNotificationListeners();
  }

  async registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token: string | undefined;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Expo Go (store client) on SDK 53+ no longer supports push token registration.
    // Avoid calling getExpoPushTokenAsync there to prevent runtime warnings.
    if (Constants.appOwnership === 'expo') {
      console.log('Skipping push token registration inside Expo Go');
      this.expoPushToken = null;
      return;
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        token = tokenData.data;
        console.log('Expo Push Token:', token);
      } catch (e) {
        token = `${Device.osName}-${Device.modelName}`;
        console.log('Using device-based token:', token);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    this.expoPushToken = token || null;
    return token;
  }

  setupNotificationListeners(navigationRef?: any): void {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      
      // Handle notification tap - navigate to appropriate screen
      if (navigationRef?.current) {
        const data = response.notification.request.content.data;
        
        if (data?.screen) {
          // Navigate to specific screen first
          navigationRef.current.navigate(data.screen);
          
          // If action is to show notifications, open modal after navigation
          if (data.action === 'showNotifications') {
            setTimeout(() => {
              this.showNotificationModal?.();
            }, 800);
          }
        } else {
          // Default: navigate to Home tab and show notifications modal if provided
          navigationRef.current.navigate('Home');
          setTimeout(() => {
            this.showNotificationModal?.();
          }, 800);
        }
      }
    });
  }

  async scheduleLocalNotification(title: string, body: string, data: any = {}): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: 'default' as any,
      },
      trigger: { seconds: 1 } as any,
    });
  }

  async scheduleDemoNotifications(): Promise<void> {
    // Schedule some demo notifications for Yogesh
    const notifications = [
      {
        title: "Welcome Yogesh! 🎉",
        body: "Your UrbanVendor dashboard is ready to use",
        delay: 5,
        data: { screen: 'Dashboard', action: 'showNotifications' }
      },
      {
        title: "New Order Alert 📦",
        body: "You have a new order from John Doe worth ₹1,299",
        delay: 15,
        data: { screen: 'Orders', orderId: 'ORD-001' }
      },
      {
        title: "Stock Alert ⚠️",
        body: "Cotton T-Shirt is running low on stock",
        delay: 30,
        data: { screen: 'Products', action: 'lowStock' }
      }
    ];

    for (const notification of notifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: 'default' as any,
        },
        trigger: notification.delay as any,
      });
    }
  }

  async sendTestNotification(): Promise<void> {
    await this.scheduleLocalNotification(
      "Test Notification ",
      "Hello Yogesh! Tap to open notifications.",
      { screen: 'Dashboard', action: 'showNotifications', type: 'test' }
    );
  }

  // Method to set notification modal callback
  showNotificationModal?: () => void;

  setNotificationModalCallback(callback: () => void): void {
    this.showNotificationModal = callback;
  }

  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }
}

export default new NotificationService();

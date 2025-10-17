import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_ORDER: 'new_order',
  ORDER_UPDATE: 'order_update',
  NEW_USER: 'new_user',
  LOW_STOCK: 'low_stock',
  SYSTEM_ALERT: 'system_alert'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Create a new notification
export const createNotification = async (notificationData) => {
  try {
    console.log('🔔 Creating notification:', notificationData);
    
    const notification = {
      ...notificationData,
      createdAt: serverTimestamp(),
      isRead: false,
      id: null // Will be set by Firestore
    };

    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, notification);
    
    console.log('✅ Notification created with ID:', docRef.id);
    return { ...notification, id: docRef.id };
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

// Get all notifications
export const getNotifications = async (limitCount = 50) => {
  try {
    console.log('🔔 Fetching notifications...');
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const notifications = [];
    
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('✅ Notifications fetched:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    throw error;
  }
};

// Listen to real-time notifications
export const subscribeToNotifications = (callback, limitCount = 20) => {
  try {
    console.log('🔔 Subscribing to real-time notifications...');
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('🔔 Real-time notifications update:', notifications.length);
      callback(notifications);
    }, (error) => {
      console.error('❌ Error in notifications subscription:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up notifications subscription:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    console.log('🔔 Marking notification as read:', notificationId);
    
    const { doc, updateDoc } = await import('firebase/firestore');
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: serverTimestamp()
    });
    
    console.log('✅ Notification marked as read');
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    console.log('🔔 Marking all notifications as read...');
    
    const notifications = await getNotifications(100);
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    const { writeBatch, doc } = await import('firebase/firestore');
    const batch = writeBatch(db);
    
    unreadNotifications.forEach((notification) => {
      const notificationRef = doc(db, 'notifications', notification.id);
      batch.update(notificationRef, {
        isRead: true,
        readAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log('✅ All notifications marked as read');
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
};

// Create order notification
export const createOrderNotification = async (orderData) => {
  try {
    console.log('🔔 Creating order notification for:', orderData.OrderID);
    
    const notification = {
      type: NOTIFICATION_TYPES.NEW_ORDER,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: 'New Order Received',
      message: `New order #${orderData.OrderID} from ${orderData.FullName}`,
      details: {
        orderId: orderData.OrderID,
        customerName: orderData.FullName,
        customerEmail: orderData.Email,
        totalAmount: orderData.TotalPrice,
        productName: orderData.productname,
        quantity: orderData.Quantity,
        shippingAddress: orderData.Address,
        orderDocId: orderData.id // Include the Firestore document ID
      },
      actionUrl: `/orders?orderId=${orderData.id || orderData.OrderID}`,
      icon: '🛒',
      color: '#10B981' // Green for new orders
    };
    
    return await createNotification(notification);
  } catch (error) {
    console.error('❌ Error creating order notification:', error);
    throw error;
  }
};

// Create user signup notification
export const createUserSignupNotification = async (userData) => {
  try {
    console.log('🔔 Creating user signup notification for:', userData.email);
    
    const notification = {
      type: NOTIFICATION_TYPES.NEW_USER,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'New User Registration',
      message: `New user registered: ${userData.displayName || userData.email}`,
      details: {
        userId: userData.uid,
        userName: userData.displayName,
        userEmail: userData.email,
        signupTime: new Date().toISOString()
      },
      actionUrl: `/customers`,
      icon: '👤',
      color: '#3B82F6' // Blue for new users
    };
    
    return await createNotification(notification);
  } catch (error) {
    console.error('❌ Error creating user signup notification:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async () => {
  try {
    const notifications = await getNotifications(100);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return unreadCount;
  } catch (error) {
    console.error('❌ Error getting unread notification count:', error);
    return 0;
  }
};

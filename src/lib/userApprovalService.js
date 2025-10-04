// AuraDashboard/Auradashboard/src/lib/userApprovalService.js
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

// Create a new user approval request
export const createUserApprovalRequest = async (userData) => {
  try {
    console.log('👤 Creating user approval request:', userData);
    
    const requestsRef = collection(db, 'userApprovalRequests');
    const request = {
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role || 'admin',
      reason: userData.reason || '',
      status: 'pending', // pending, approved, rejected
      requestedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      notes: ''
    };
    
    const docRef = await addDoc(requestsRef, request);
    console.log('✅ User approval request created successfully:', docRef.id);
    return { id: docRef.id, ...request };
  } catch (error) {
    console.error('❌ Error creating user approval request:', error);
    throw error;
  }
};

// Get all pending approval requests
export const getPendingApprovalRequests = async () => {
  try {
    console.log('👤 Fetching pending approval requests...');
    
    const requestsRef = collection(db, 'userApprovalRequests');
    const q = query(
      requestsRef, 
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const requests = [];
    snapshot.forEach((doc) => {
      const requestData = { id: doc.id, ...doc.data() };
      requests.push(requestData);
    });
    
    console.log(`✅ Found ${requests.length} pending approval requests`);
    return requests;
  } catch (error) {
    console.error('❌ Error fetching pending approval requests:', error);
    throw error;
  }
};

// Get all approval requests (for admin view)
export const getAllApprovalRequests = async () => {
  try {
    console.log('👤 Fetching all approval requests...');
    
    const requestsRef = collection(db, 'userApprovalRequests');
    const q = query(requestsRef, orderBy('requestedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const requests = [];
    snapshot.forEach((doc) => {
      const requestData = { id: doc.id, ...doc.data() };
      requests.push(requestData);
    });
    
    console.log(`✅ Found ${requests.length} approval requests`);
    return requests;
  } catch (error) {
    console.error('❌ Error fetching approval requests:', error);
    throw error;
  }
};

// Approve a user request
export const approveUserRequest = async (requestId, approvedBy, notes = '') => {
  try {
    console.log('👤 Approving user request:', requestId);
    
    const requestRef = doc(db, 'userApprovalRequests', requestId);
    await updateDoc(requestRef, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: approvedBy,
      notes: notes
    });
    
    console.log('✅ User request approved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error approving user request:', error);
    throw error;
  }
};

// Reject a user request
export const rejectUserRequest = async (requestId, rejectedBy, notes = '') => {
  try {
    console.log('👤 Rejecting user request:', requestId);
    
    const requestRef = doc(db, 'userApprovalRequests', requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: rejectedBy,
      notes: notes
    });
    
    console.log('✅ User request rejected successfully');
    return true;
  } catch (error) {
    console.error('❌ Error rejecting user request:', error);
    throw error;
  }
};

// Check if user has pending approval request
export const checkUserApprovalStatus = async (email) => {
  try {
    console.log('👤 Checking approval status for user:', email);
    
    const requestsRef = collection(db, 'userApprovalRequests');
    const q = query(requestsRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('❌ No approval request found for user');
      return null;
    }
    
    const request = snapshot.docs[0].data();
    console.log('✅ Found approval request:', request.status);
    return { id: snapshot.docs[0].id, ...request };
  } catch (error) {
    console.error('❌ Error checking user approval status:', error);
    throw error;
  }
};

// Get approval request by ID
export const getApprovalRequestById = async (requestId) => {
  try {
    console.log('👤 Fetching approval request by ID:', requestId);
    
    const requestRef = doc(db, 'userApprovalRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (requestSnap.exists()) {
      const requestData = { id: requestSnap.id, ...requestSnap.data() };
      console.log('✅ Approval request found:', requestData);
      return requestData;
    } else {
      console.log('❌ Approval request not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching approval request:', error);
    throw error;
  }
};

// Delete approval request
export const deleteApprovalRequest = async (requestId) => {
  try {
    console.log('👤 Deleting approval request:', requestId);
    
    const requestRef = doc(db, 'userApprovalRequests', requestId);
    await deleteDoc(requestRef);
    
    console.log('✅ Approval request deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting approval request:', error);
    throw error;
  }
};

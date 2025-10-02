'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, Plus, Edit, Trash2, User, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import SimpleNav from '../../components/SimpleNav';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    Contact: '',
    Address: '',
    OrderID: ''
  });
  const [emailError, setEmailError] = useState('');

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    fetchCustomers();
  }, [isAuthenticated, router]);

  const fetchCustomers = async () => {
    try {
      console.log('🔄 Fetching customers...');
      const querySnapshot = await getDocs(collection(db, 'customers'));
      const customersList = [];
      querySnapshot.forEach((doc) => {
        customersList.push({ id: doc.id, ...doc.data() });
      });
      setCustomers(customersList);
      console.log('✅ Customers fetched:', customersList.length);
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEmailExists = async (email, excludeId = null) => {
    if (!email.trim()) return false;
    
    try {
      const q = query(collection(db, 'customers'), where('Email', '==', email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      // If editing, exclude the current customer from the check
      if (excludeId) {
        return querySnapshot.docs.some(doc => doc.id !== excludeId);
      }
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.FullName.trim()) {
      alert('Full name is required');
      return;
    }

    // Check for duplicate email
    if (formData.Email.trim()) {
      const emailExists = await checkEmailExists(
        formData.Email, 
        editingCustomer?.id
      );
      
      if (emailExists) {
        alert('A customer with this email already exists. Please use a different email address.');
        return;
      }
    }

    try {
      const customerData = {
        ...formData,
        Email: formData.Email.trim().toLowerCase(), // Normalize email
        FullName: formData.FullName.trim(),
        Contact: formData.Contact.trim(),
        Address: formData.Address.trim(),
        OrderID: formData.OrderID.trim(),
        createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingCustomer) {
        await updateDoc(doc(db, 'customers', editingCustomer.id), customerData);
        console.log('✅ Customer updated');
      } else {
        await addDoc(collection(db, 'customers'), customerData);
        console.log('✅ Customer created');
      }

      setShowForm(false);
      setEditingCustomer(null);
      setEmailError('');
      setFormData({
        FullName: '',
        Email: '',
        Contact: '',
        Address: '',
        OrderID: ''
      });
      fetchCustomers();
    } catch (error) {
      console.error('❌ Error saving customer:', error);
      alert('Error saving customer: ' + error.message);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowForm(true);
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteDoc(doc(db, 'customers', customerId));
        console.log('✅ Customer deleted');
        fetchCustomers();
      } catch (error) {
        console.error('❌ Error deleting customer:', error);
        alert('Error deleting customer: ' + error.message);
      }
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.Contact.includes(searchTerm) ||
    customer.OrderID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Customer Management
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {user?.displayName}! Manage your customer database.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(customer => customer.Email).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(customer => customer.OrderID).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search customers by name, email, contact, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>
        </div>

        {/* Customers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading customers...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Customer Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{customer.FullName}</h3>
                        <p className="text-blue-100 text-sm">
                          {customer.OrderID ? `Order: ${customer.OrderID}` : 'No orders yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{customer.Email || 'Not provided'}</p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Contact</p>
                        <p className="font-medium text-gray-900">{customer.Contact || 'Not provided'}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-gray-900">{customer.Address || 'Not provided'}</p>
                      </div>
                    </div>

                    {/* Order ID */}
                    {customer.OrderID && (
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Order ID</p>
                          <p className="font-medium text-gray-900">{customer.OrderID}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-6">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCustomers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'Get started by adding your first customer.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Customer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCustomer(null);
                  setEmailError('');
                  setFormData({
                    FullName: '',
                    Email: '',
                    Contact: '',
                    Address: '',
                    OrderID: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.FullName}
                  onChange={(e) => setFormData({...formData, FullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer's full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.Email}
                    onChange={async (e) => {
                      const email = e.target.value;
                      setFormData({...formData, Email: email});
                      
                      // Clear previous error
                      setEmailError('');
                      
                      // Check for duplicate email if email is provided
                      if (email.trim()) {
                        const emailExists = await checkEmailExists(email, editingCustomer?.id);
                        if (emailExists) {
                          setEmailError('This email is already registered');
                        }
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      emailError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="customer@example.com"
                  />
                  {emailError && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.Contact}
                    onChange={(e) => setFormData({...formData, Contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  rows={3}
                  value={formData.Address}
                  onChange={(e) => setFormData({...formData, Address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer's full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  value={formData.OrderID}
                  onChange={(e) => setFormData({...formData, OrderID: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ORD-001 (optional)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCustomer(null);
                    setEmailError('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!emailError}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                    emailError 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



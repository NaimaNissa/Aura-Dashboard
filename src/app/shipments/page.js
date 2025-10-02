'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Truck, Plus, Edit, Trash2, MapPin, DollarSign, Package } from 'lucide-react';
import SimpleNav from '../../components/SimpleNav';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    ShipmentID: '',
    Address: '',
    ShippingCost: ''
  });

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    fetchShipments();
  }, [isAuthenticated, router]);

  const fetchShipments = async () => {
    try {
      console.log('🔄 Fetching shipments...');
      const querySnapshot = await getDocs(collection(db, 'shipments'));
      const shipmentsList = [];
      querySnapshot.forEach((doc) => {
        shipmentsList.push({ id: doc.id, ...doc.data() });
      });
      setShipments(shipmentsList);
      console.log('✅ Shipments fetched:', shipmentsList.length);
    } catch (error) {
      console.error('❌ Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('🔄 Attempting to save shipment...');
      console.log('👤 Current user:', user);
      console.log('🔐 Is authenticated:', isAuthenticated);
      
      const shipmentData = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🚚 Shipment data to save:', shipmentData);

      if (editingShipment) {
        console.log('✏️ Updating existing shipment:', editingShipment.id);
        await updateDoc(doc(db, 'shipments', editingShipment.id), shipmentData);
        console.log('✅ Shipment updated successfully');
      } else {
        console.log('➕ Creating new shipment...');
        const docRef = await addDoc(collection(db, 'shipments'), shipmentData);
        console.log('✅ Shipment created successfully with ID:', docRef.id);
      }

      setShowForm(false);
      setEditingShipment(null);
      setFormData({
        ShipmentID: '',
        Address: '',
        ShippingCost: ''
      });
      fetchShipments();
    } catch (error) {
      console.error('❌ Error saving shipment:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error details:', error);
      
      let errorMessage = error.message;
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your Firebase security rules.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'You are not authenticated. Please log in again.';
      }
      
      alert('Error saving shipment: ' + errorMessage);
    }
  };

  const handleEdit = (shipment) => {
    setEditingShipment(shipment);
    setFormData(shipment);
    setShowForm(true);
  };

  const handleDelete = async (shipmentId) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      try {
        await deleteDoc(doc(db, 'shipments', shipmentId));
        console.log('✅ Shipment deleted');
        fetchShipments();
      } catch (error) {
        console.error('❌ Error deleting shipment:', error);
        alert('Error deleting shipment: ' + error.message);
      }
    }
  };

  // Filter shipments based on search term
  const filteredShipments = shipments.filter(shipment =>
    shipment.ShipmentID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.Address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.ShippingCost.includes(searchTerm)
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
                <Truck className="w-6 h-6" />
                Shipment Management
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {user?.displayName}! Manage shipping and delivery information.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Shipment
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
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{shipments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shipping Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${shipments.reduce((sum, shipment) => sum + parseFloat(shipment.ShippingCost || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {shipments.filter(shipment => shipment.Address).length}
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
                placeholder="Search shipments by ID, address, or shipping cost..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredShipments.length} of {shipments.length} shipments
            </div>
          </div>
        </div>

        {/* Shipments Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading shipments...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShipments.map((shipment) => (
              <div key={shipment.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Shipment Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{shipment.ShipmentID}</h3>
                        <p className="text-green-100 text-sm">
                          {shipment.ShippingCost ? `$${shipment.ShippingCost}` : 'No cost set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipment Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Delivery Address</p>
                        <p className="font-medium text-gray-900">{shipment.Address || 'Not provided'}</p>
                      </div>
                    </div>

                    {/* Shipping Cost */}
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Shipping Cost</p>
                        <p className="font-medium text-gray-900">
                          {shipment.ShippingCost ? `$${shipment.ShippingCost}` : 'Not set'}
                        </p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">
                          {shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-6">
                    <button
                      onClick={() => handleEdit(shipment)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(shipment.id)}
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

        {filteredShipments.length === 0 && !loading && (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No shipments found' : 'No shipments yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'Get started by adding your first shipment.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Shipment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Shipment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingShipment ? 'Edit Shipment' : 'Add New Shipment'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingShipment(null);
                  setFormData({
                    ShipmentID: '',
                    Address: '',
                    ShippingCost: ''
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
                  Shipment ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ShipmentID}
                  onChange={(e) => setFormData({...formData, ShipmentID: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SHIP-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.Address}
                  onChange={(e) => setFormData({...formData, Address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter complete delivery address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ShippingCost}
                  onChange={(e) => setFormData({...formData, ShippingCost: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingShipment(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {editingShipment ? 'Update Shipment' : 'Create Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



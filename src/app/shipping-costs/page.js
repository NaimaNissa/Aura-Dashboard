'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Truck, Plus, Edit3, Save, X, Trash2, MapPin, DollarSign, Clock } from 'lucide-react';
import SimpleNav from '../../components/SimpleNav';

export default function ShippingCostsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useSelector((state) => state.auth);
  const [shippingCosts, setShippingCosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCountry, setEditingCountry] = useState(null);
  const [newCountry, setNewCountry] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [newEstimatedDays, setNewEstimatedDays] = useState('5-7');
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    if (isInitialized && isAuthenticated) {
      fetchShippingCosts();
    }
  }, [isAuthenticated, isInitialized, router]);

  const fetchShippingCosts = async () => {
    try {
      setLoading(true);
      console.log('🚚 Fetching shipping costs...');
      
      // Import Firebase functions dynamically
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const shippingRef = collection(db, 'shippingCosts');
      const q = query(shippingRef, orderBy('country', 'asc'));
      const snapshot = await getDocs(q);
      
      const costs = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        costs[data.country] = {
          id: doc.id,
          country: data.country,
          cost: data.cost,
          currency: data.currency || 'USD',
          estimatedDays: data.estimatedDays || '5-7',
          updatedAt: data.updatedAt
        };
      });
      
      console.log(`✅ Found ${Object.keys(costs).length} shipping costs`);
      setShippingCosts(costs);
    } catch (error) {
      console.error('❌ Error fetching shipping costs:', error);
      setError('Failed to load shipping costs. Please check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const saveShippingCost = async (country, cost, currency, estimatedDays) => {
    try {
      setIsSaving(true);
      console.log('💾 Saving shipping cost for:', country);
      
      const { addDoc, updateDoc, doc, collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const shippingRef = collection(db, 'shippingCosts');
      
      // Check if country already exists
      const q = query(shippingRef, where('country', '==', country));
      const snapshot = await getDocs(q);
      
      const costData = {
        country,
        cost: parseFloat(cost),
        currency,
        estimatedDays,
        updatedAt: new Date().toISOString()
      };
      
      if (!snapshot.empty) {
        // Update existing
        const docRef = doc(db, 'shippingCosts', snapshot.docs[0].id);
        await updateDoc(docRef, costData);
        console.log('✅ Shipping cost updated');
      } else {
        // Add new
        await addDoc(shippingRef, {
          ...costData,
          createdAt: new Date().toISOString()
        });
        console.log('✅ Shipping cost added');
      }
      
      // Refresh the list
      await fetchShippingCosts();
      
      // Reset form
      setNewCountry('');
      setNewCost('');
      setNewCurrency('USD');
      setNewEstimatedDays('5-7');
      setEditingCountry(null);
      setError(null);
    } catch (error) {
      console.error('❌ Error saving shipping cost:', error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteShippingCost = async (country) => {
    if (!confirm(`Are you sure you want to delete shipping cost for ${country}?`)) {
      return;
    }
    
    try {
      console.log('🗑️ Deleting shipping cost for:', country);
      
      const { deleteDoc, doc, getDocs, query, where, collection } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const shippingRef = collection(db, 'shippingCosts');
      const q = query(shippingRef, where('country', '==', country));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = doc(db, 'shippingCosts', snapshot.docs[0].id);
        await deleteDoc(docRef);
        console.log('✅ Shipping cost deleted');
        
        // Refresh the list
        await fetchShippingCosts();
      }
    } catch (error) {
      console.error('❌ Error deleting shipping cost:', error);
      setError(error.message);
    }
  };

  const filteredCosts = Object.values(shippingCosts).filter(cost =>
    cost.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!isInitialized ? 'Initializing authentication...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-6 h-6" />
              Shipping Costs Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage shipping costs for different countries
            </p>
          </div>
          <button
            onClick={() => setEditingCountry('new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Country
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {editingCountry && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCountry === 'new' ? 'Add New Country' : 'Edit Shipping Cost'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={editingCountry === 'new' ? newCountry : editingCountry}
                  onChange={(e) => editingCountry === 'new' ? setNewCountry(e.target.value) : null}
                  disabled={editingCountry !== 'new'}
                  placeholder="Enter country name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost (USD)
                </label>
                <input
                  type="number"
                  value={editingCountry === 'new' ? newCost : shippingCosts[editingCountry]?.cost || ''}
                  onChange={(e) => editingCountry === 'new' ? setNewCost(e.target.value) : null}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={editingCountry === 'new' ? newCurrency : shippingCosts[editingCountry]?.currency || 'USD'}
                  onChange={(e) => editingCountry === 'new' ? setNewCurrency(e.target.value) : null}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Days
                </label>
                <input
                  type="text"
                  value={editingCountry === 'new' ? newEstimatedDays : shippingCosts[editingCountry]?.estimatedDays || ''}
                  onChange={(e) => editingCountry === 'new' ? setNewEstimatedDays(e.target.value) : null}
                  placeholder="5-7"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (editingCountry === 'new') {
                    saveShippingCost(newCountry, newCost, newCurrency, newEstimatedDays);
                  }
                }}
                disabled={isSaving || !newCountry || !newCost}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditingCountry(null);
                  setNewCountry('');
                  setNewCost('');
                  setNewCurrency('USD');
                  setNewEstimatedDays('5-7');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
        </div>

        {/* Shipping Costs List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading shipping costs...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Delivery Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCosts.map((cost) => (
                    <tr key={cost.country} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {cost.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cost.cost === 0 ? (
                            <span className="text-green-600 font-medium">Free</span>
                          ) : (
                            `${cost.currency} ${cost.cost.toFixed(2)}`
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cost.estimatedDays} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingCountry(cost.country)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteShippingCost(cost.country)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredCosts.length === 0 && (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No countries found' : 'No shipping costs configured'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Add your first shipping cost to get started'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

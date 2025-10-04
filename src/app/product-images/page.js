'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Image, Package, Plus, Trash2, Upload, Eye, Edit3, Save, X, ArrowUp, ArrowDown, Move } from 'lucide-react';
import SimpleNav from '../../components/SimpleNav';

export default function ProductImagesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingColor, setEditingColor] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    fetchProducts();
  }, [isAuthenticated, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching products for image management...');
      
      // Import Firebase functions dynamically
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('productname', 'asc'));
      const snapshot = await getDocs(q);
      
      const productsData = [];
      snapshot.forEach((doc) => {
        const productData = { id: doc.id, ...doc.data() };
        productsData.push(productData);
      });
      
      console.log(`✅ Found ${productsData.length} products`);
      setProducts(productsData);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setError('Failed to load products. Please check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const getColorImages = (product) => {
    if (product.colorImages && typeof product.colorImages === 'object') {
      return product.colorImages;
    }
    
    // Create default structure from colors
    const colors = product.Colors ? product.Colors.split(',').map(c => c.trim()).filter(c => c) : [];
    const colorImages = {};
    
    colors.forEach(color => {
      const colorKey = color.toLowerCase().replace(/\s+/g, '');
      colorImages[colorKey] = {
        name: color,
        images: [product.productImg || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'],
        price: parseFloat(product.Price) || 0
      };
    });
    
    return colorImages;
  };

  const validateImageUrl = (url) => {
    try {
      new URL(url);
      return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url) || url.includes('unsplash.com') || url.includes('placeholder');
    } catch {
      return false;
    }
  };

  const addImageToColor = async (productId, colorName, imageUrl) => {
    try {
      setIsAddingImage(true);
      console.log('📸 Adding image to color:', colorName);
      
      // Validate image URL
      if (!imageUrl.trim()) {
        throw new Error('Please enter an image URL');
      }
      
      if (!validateImageUrl(imageUrl)) {
        throw new Error('Please enter a valid image URL (jpg, png, gif, webp, svg)');
      }
      
      const { updateDoc, doc, getDocs, query, where, collection } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      // Find the product document
      const productsRef = collection(db, 'products');
      let q = query(productsRef, where('productID', '==', productId));
      let snapshot = await getDocs(q);
      
      let docRef;
      if (!snapshot.empty) {
        docRef = doc(db, 'products', snapshot.docs[0].id);
      } else {
        // Try by document ID
        docRef = doc(db, 'products', productId);
      }
      
      // Get current product data
      const product = products.find(p => p.productID === productId || p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      const colorImages = getColorImages(product);
      const colorKey = colorName.toLowerCase().replace(/\s+/g, '');
      
      // Initialize color if it doesn't exist
      if (!colorImages[colorKey]) {
        colorImages[colorKey] = {
          name: colorName,
          images: [],
          price: parseFloat(product.Price) || 0
        };
      }
      
      // Check if we already have 10 images (max limit)
      if (colorImages[colorKey].images.length >= 10) {
        throw new Error('Maximum 10 images allowed per color');
      }
      
      // Check for duplicate images
      if (colorImages[colorKey].images.includes(imageUrl)) {
        throw new Error('This image is already added to this color');
      }
      
      // Add new image
      colorImages[colorKey].images.push(imageUrl);
      
      // Update in Firebase
      await updateDoc(docRef, {
        colorImages: colorImages,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.productID === productId || p.id === productId 
            ? { ...p, colorImages }
            : p
        )
      );
      
      setNewImageUrl('');
      setEditingColor(null);
      setError(null); // Clear any previous errors
      console.log('✅ Image added successfully');
    } catch (error) {
      console.error('❌ Error adding image:', error);
      setError(error.message);
    } finally {
      setIsAddingImage(false);
    }
  };

  const removeImageFromColor = async (productId, colorName, imageIndex) => {
    try {
      console.log('🗑️ Removing image from color:', colorName);
      
      const { updateDoc, doc, getDocs, query, where, collection } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      // Find the product document
      const productsRef = collection(db, 'products');
      let q = query(productsRef, where('productID', '==', productId));
      let snapshot = await getDocs(q);
      
      let docRef;
      if (!snapshot.empty) {
        docRef = doc(db, 'products', snapshot.docs[0].id);
      } else {
        docRef = doc(db, 'products', productId);
      }
      
      // Get current product data
      const product = products.find(p => p.productID === productId || p.id === productId);
      const colorImages = getColorImages(product);
      const colorKey = colorName.toLowerCase().replace(/\s+/g, '');
      
      if (!colorImages[colorKey] || !colorImages[colorKey].images[imageIndex]) {
        throw new Error('Image not found');
      }
      
      // Remove image
      colorImages[colorKey].images.splice(imageIndex, 1);
      
      // Update in Firebase
      await updateDoc(docRef, {
        colorImages: colorImages,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.productID === productId || p.id === productId 
            ? { ...p, colorImages }
            : p
        )
      );
      
      setError(null); // Clear any previous errors
      console.log('✅ Image removed successfully');
    } catch (error) {
      console.error('❌ Error removing image:', error);
      setError(error.message);
    }
  };

  const reorderImages = async (productId, colorName, fromIndex, toIndex) => {
    try {
      console.log('🔄 Reordering images for color:', colorName);
      
      const { updateDoc, doc, getDocs, query, where, collection } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      // Find the product document
      const productsRef = collection(db, 'products');
      let q = query(productsRef, where('productID', '==', productId));
      let snapshot = await getDocs(q);
      
      let docRef;
      if (!snapshot.empty) {
        docRef = doc(db, 'products', snapshot.docs[0].id);
      } else {
        docRef = doc(db, 'products', productId);
      }
      
      // Get current product data
      const product = products.find(p => p.productID === productId || p.id === productId);
      const colorImages = getColorImages(product);
      const colorKey = colorName.toLowerCase().replace(/\s+/g, '');
      
      if (!colorImages[colorKey] || !colorImages[colorKey].images[fromIndex] || !colorImages[colorKey].images[toIndex]) {
        throw new Error('Invalid image indices');
      }
      
      // Reorder images
      const images = [...colorImages[colorKey].images];
      const [movedImage] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, movedImage);
      
      colorImages[colorKey].images = images;
      
      // Update in Firebase
      await updateDoc(docRef, {
        colorImages: colorImages,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.productID === productId || p.id === productId 
            ? { ...p, colorImages }
            : p
        )
      );
      
      console.log('✅ Images reordered successfully');
    } catch (error) {
      console.error('❌ Error reordering images:', error);
      setError(error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
              <Image className="w-6 h-6" />
              Product Image Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage color-based images for your products (max 10 images per color)
            </p>
          </div>
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

        {/* Products List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Products List */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Select Product
              </h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {products.map((product) => {
                  const colorImages = getColorImages(product);
                  const totalImages = Object.values(colorImages).reduce((sum, color) => sum + color.images.length, 0);
                  
                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedProduct?.id === product.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {product.productname || 'Unnamed Product'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {Object.keys(colorImages).length} colors • {totalImages} images
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${parseFloat(product.Price) || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Color Images Management */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {selectedProduct ? (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    {selectedProduct.productname}
                  </h2>
                  
                  <div className="space-y-6">
                    {Object.entries(getColorImages(selectedProduct)).map(([colorKey, colorData]) => (
                      <div key={colorKey} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900 capitalize">
                            {colorData.name} ({colorData.images.length}/10 images)
                          </h3>
                          <button
                            onClick={() => setEditingColor(editingColor === colorKey ? null : colorKey)}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add Image
                          </button>
                        </div>
                        
                        {/* Add Image Form */}
                        {editingColor === colorKey && (
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Image URL
                                </label>
                                <input
                                  type="url"
                                  value={newImageUrl}
                                  onChange={(e) => setNewImageUrl(e.target.value)}
                                  placeholder="https://example.com/image.jpg"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Supported formats: JPG, PNG, GIF, WebP, SVG
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => addImageToColor(selectedProduct.productID || selectedProduct.id, colorData.name, newImageUrl)}
                                  disabled={!newImageUrl || isAddingImage}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                                >
                                  <Upload className="w-4 h-4" />
                                  {isAddingImage ? 'Adding...' : 'Add Image'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingColor(null);
                                    setNewImageUrl('');
                                  }}
                                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Images Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {colorData.images.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`${colorData.name} ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop';
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                  <button
                                    onClick={() => window.open(imageUrl, '_blank')}
                                    className="bg-white text-gray-700 p-1 rounded hover:bg-gray-100"
                                    title="View full size"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                  {index > 0 && (
                                    <button
                                      onClick={() => reorderImages(selectedProduct.productID || selectedProduct.id, colorData.name, index, index - 1)}
                                      className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                                      title="Move up"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                  )}
                                  {index < colorData.images.length - 1 && (
                                    <button
                                      onClick={() => reorderImages(selectedProduct.productID || selectedProduct.id, colorData.name, index, index + 1)}
                                      className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                                      title="Move down"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => removeImageFromColor(selectedProduct.productID || selectedProduct.id, colorData.name, index)}
                                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                                    title="Remove image"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                {index + 1}
                              </div>
                              <div className="absolute top-1 right-1 bg-blue-500 bg-opacity-50 text-white text-xs px-1 rounded">
                                <Move className="w-3 h-3" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Product</h3>
                  <p className="text-gray-600">
                    Choose a product from the list to manage its color images
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

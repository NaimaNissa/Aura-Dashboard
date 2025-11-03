import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Async thunks
export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      // Initialize colorImages structure from Colors field
      let colorImages = {};
      if (productData.Colors) {
        const colors = productData.Colors.split(',')
          .map(c => c.trim())
          .filter(c => c);
        
        colors.forEach(color => {
          const colorKey = color.toLowerCase().replace(/\s+/g, '');
          colorImages[colorKey] = {
            name: color,
            displayName: color,
            images: productData.productImg 
              ? [productData.productImg] 
              : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'],
            price: parseFloat(productData.Price || 0)
          };
        });
      }
      
      const newProduct = {
        ...productData,
        colorImages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      
      return {
        id: docRef.id,
        ...newProduct
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching products from Firebase...');
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const products = [];
      
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Products fetched successfully:', products.length);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const productRef = doc(db, 'products', id);
      
      // Get current product data to sync colorImages
      const currentProduct = await getDoc(productRef);
      const currentData = currentProduct.data();
      
      // If Colors field is being updated, synchronize colorImages
      let syncedColorImages = currentData?.colorImages || {};
      if (updates.Colors !== undefined && updates.Colors !== currentData?.Colors) {
        // If Colors is empty or not provided, clear colorImages
        if (!updates.Colors || updates.Colors.trim() === '') {
          syncedColorImages = {};
        } else {
          const newColors = updates.Colors.split(',')
            .map(c => c.trim())
            .filter(c => c);
          
          // Create a new colorImages structure based on the new Colors
          const updatedColorImages = {};
          
          newColors.forEach(color => {
            const colorKey = color.toLowerCase().replace(/\s+/g, '');
            
            // If this color already exists in colorImages, keep its images and data
            if (syncedColorImages[colorKey]) {
              updatedColorImages[colorKey] = {
                ...syncedColorImages[colorKey],
                name: color,
                displayName: color
              };
            } else {
              // Create new color entry with default image
              updatedColorImages[colorKey] = {
                name: color,
                displayName: color,
                images: updates.productImg || currentData?.productImg 
                  ? [updates.productImg || currentData.productImg] 
                  : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'],
                price: parseFloat(updates.Price || currentData?.Price || 0)
              };
            }
          });
          
          syncedColorImages = updatedColorImages;
        }
      }
      
      const updatedData = {
        ...updates,
        colorImages: syncedColorImages,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(productRef, updatedData);
      
      return { id, ...updatedData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const bulkUploadProducts = createAsyncThunk(
  'product/bulkUploadProducts',
  async (productsData, { rejectWithValue }) => {
    try {
      const batch = [];
      const timestamp = new Date().toISOString();
      
      productsData.forEach((product) => {
        const newProduct = {
          ...product,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        batch.push(addDoc(collection(db, 'products'), newProduct));
      });
      
      const results = await Promise.all(batch);
      const uploadedProducts = results.map((docRef, index) => ({
        id: docRef.id,
        ...productsData[index],
        createdAt: timestamp,
        updatedAt: timestamp
      }));
      
      return uploadedProducts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  products: [],
  filteredProducts: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    priceRange: '',
    inStock: ''
  },
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredProducts = filterProducts(state.products, state.filters);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.filteredProducts = filterProducts(state.products, state.filters);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
        state.filteredProducts = filterProducts(action.payload, state.filters);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...action.payload };
        }
        state.filteredProducts = filterProducts(state.products, state.filters);
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
        state.filteredProducts = filterProducts(state.products, state.filters);
      })
      // Bulk upload
      .addCase(bulkUploadProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkUploadProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = [...action.payload, ...state.products];
        state.filteredProducts = filterProducts(state.products, state.filters);
      })
      .addCase(bulkUploadProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset state on logout
      .addMatcher(
        (action) => action.type === 'RESET_STATE',
        () => initialState
      );
  },
});

// Helper function to filter products
function filterProducts(products, filters) {
  return products.filter(product => {
    const matchesSearch = !filters.search || 
      product.productname.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.Description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesInStock = !filters.inStock || 
      (filters.inStock === 'in-stock' && parseInt(product.Quantity) > 0) ||
      (filters.inStock === 'out-of-stock' && parseInt(product.Quantity) === 0);
    
    return matchesSearch && matchesCategory && matchesInStock;
  });
}

export const { setFilters, clearError } = productSlice.actions;
export default productSlice.reducer;

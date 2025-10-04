// AuraDashboard/Auradashboard/src/lib/categoryService.js
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
  orderBy,
  where
} from 'firebase/firestore';

// Create a new category
export const createCategory = async (categoryData) => {
  try {
    console.log('📁 Creating category:', categoryData);
    
    const categoriesRef = collection(db, 'categories');
    const category = {
      name: categoryData.name,
      description: categoryData.description || '',
      icon: categoryData.icon || '📦',
      color: categoryData.color || '#3B82F6',
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productCount: 0 // Will be updated when products are added
    };
    
    const docRef = await addDoc(categoriesRef, category);
    console.log('✅ Category created successfully:', docRef.id);
    return { id: docRef.id, ...category };
  } catch (error) {
    console.error('❌ Error creating category:', error);
    throw error;
  }
};

// Get all categories
export const getAllCategories = async () => {
  try {
    console.log('📁 Fetching all categories...');
    
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    
    const categories = [];
    snapshot.forEach((doc) => {
      const categoryData = { id: doc.id, ...doc.data() };
      categories.push(categoryData);
    });
    
    console.log(`✅ Found ${categories.length} categories`);
    return categories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    throw error;
  }
};

// Get active categories only
export const getActiveCategories = async () => {
  try {
    console.log('📁 Fetching active categories...');
    
    const categoriesRef = collection(db, 'categories');
    // Remove orderBy to avoid index requirement, we'll sort in JavaScript
    const q = query(
      categoriesRef, 
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    
    const categories = [];
    snapshot.forEach((doc) => {
      const categoryData = { id: doc.id, ...doc.data() };
      categories.push(categoryData);
    });
    
    // Sort categories by name in JavaScript
    categories.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`✅ Found ${categories.length} active categories`);
    return categories;
  } catch (error) {
    console.error('❌ Error fetching active categories:', error);
    // Return empty array instead of throwing to not break the UI
    return [];
  }
};

// Update a category
export const updateCategory = async (categoryId, updateData) => {
  try {
    console.log('📁 Updating category:', categoryId, updateData);
    
    const categoryRef = doc(db, 'categories', categoryId);
    const updateFields = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(categoryRef, updateFields);
    console.log('✅ Category updated successfully');
    return { id: categoryId, ...updateFields };
  } catch (error) {
    console.error('❌ Error updating category:', error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (categoryId) => {
  try {
    console.log('📁 Deleting category:', categoryId);
    
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
    console.log('✅ Category deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    throw error;
  }
};

// Get category by ID
export const getCategoryById = async (categoryId) => {
  try {
    console.log('📁 Fetching category by ID:', categoryId);
    
    const categoryRef = doc(db, 'categories', categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (categorySnap.exists()) {
      const categoryData = { id: categorySnap.id, ...categorySnap.data() };
      console.log('✅ Category found:', categoryData);
      return categoryData;
    } else {
      console.log('❌ Category not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    throw error;
  }
};

// Update product count for a category
export const updateCategoryProductCount = async (categoryId) => {
  try {
    console.log('📁 Updating product count for category:', categoryId);
    
    // Get products in this category
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('category', '==', categoryId));
    const snapshot = await getDocs(q);
    
    const productCount = snapshot.size;
    
    // Update category with new product count
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, {
      productCount: productCount,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ Updated product count for category ${categoryId}: ${productCount}`);
    return productCount;
  } catch (error) {
    console.error('❌ Error updating category product count:', error);
    throw error;
  }
};

// Get categories with product counts
export const getCategoriesWithProductCounts = async () => {
  try {
    console.log('📁 Fetching categories with product counts...');
    
    const categories = await getActiveCategories();
    
    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        try {
          const productsRef = collection(db, 'products');
          const q = query(productsRef, where('category', '==', category.id));
          const snapshot = await getDocs(q);
          
          return {
            ...category,
            count: snapshot.size
          };
        } catch (error) {
          console.error(`Error getting product count for category ${category.id}:`, error);
          return {
            ...category,
            count: 0
          };
        }
      })
    );
    
    console.log(`✅ Found ${categoriesWithCounts.length} categories with product counts`);
    return categoriesWithCounts;
  } catch (error) {
    console.error('❌ Error fetching categories with product counts:', error);
    return [];
  }
};

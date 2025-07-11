import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Product, User } from '@/types';

const PRODUCTS_COLLECTION = 'products';
const USERS_COLLECTION = 'users';

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Convert Product data from Firestore
const convertProductData = (doc: any): Product => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    price: data.price,
    images: data.images || [],
    category: data.category,
    sellerId: data.sellerId,
    seller: data.seller,
    location: data.location,
    isAvailable: data.isAvailable,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    tags: data.tags || [],
    servings: data.servings,
    notes: data.notes,
  };
};

export const productService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('isAvailable', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertProductData);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertProductData(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get products by seller
  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertProductData);
    } catch (error) {
      console.error('Error fetching seller products:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - consider using Algolia for better search
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('isAvailable', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const allProducts = querySnapshot.docs.map(convertProductData);
      
      // Client-side filtering
      return allProducts.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Upload image to Firebase Storage
  async uploadImage(uri: string, path: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const imageRef = ref(storage, `products/${path}`);
      await uploadBytes(imageRef, blob);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Create new product
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, imageUris: string[]): Promise<string> {
    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (let i = 0; i < imageUris.length; i++) {
        const imagePath = `${Date.now()}_${i}.jpg`;
        const imageUrl = await this.uploadImage(imageUris[i], imagePath);
        imageUrls.push(imageUrl);
      }

      // Create product document
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...productData,
        images: imageUrls,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      // Get product to delete associated images
      const product = await this.getProductById(id);
      if (product) {
        // Delete images from storage
        for (const imageUrl of product.images) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (imageError) {
            console.warn('Error deleting image:', imageError);
          }
        }
      }

      // Delete product document
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Listen to products in real-time
  subscribeToProducts(callback: (products: Product[]) => void): () => void {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('isAvailable', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const products = querySnapshot.docs.map(convertProductData);
      callback(products);
    }, (error) => {
      console.error('Error in products subscription:', error);
    });
  },

  // Toggle product availability
  async toggleAvailability(id: string, isAvailable: boolean): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, {
        isAvailable,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
      throw error;
    }
  },
};
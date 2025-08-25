import { db } from '@/config/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
  getDoc,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';

// Service to handle all order and sales-related database operations
export const orderService = {
  /**
   * Marks a product as sold and creates an order confirmation.
   * This is done using a Firestore transaction to ensure data integrity.
   * @param buyerId The ID of the buyer.
   * @param sellerId The ID of the seller.
   * @param productId The ID of the product being sold.
   * @param price The price of the product.
   * @param quantity The quantity of servings sold.
   * @returns A promise that resolves when the transaction is complete.
   */
  async markProductAsSold(
    buyerId: string,
    sellerId: string,
    productId: string,
    price: number,
    quantity: number
  ): Promise<void> {
    const productRef = doc(db, 'products', productId);

    try {
      await runTransaction(db, async (transaction) => {
        // Fetch the product document to get its current servings
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
          throw new Error('Product does not exist!');
        }

        const productData = productDoc.data();
        const currentServings = productData.servings || 0;

        if (currentServings < quantity) {
          throw new Error('Not enough servings available to complete the sale.');
        }

        // Calculate the new servings and availability status
        const newServings = currentServings - quantity;
        const isAvailable = newServings > 0;

        // Update the product's servings and availability in the transaction
        transaction.update(productRef, {
          servings: newServings,
          isAvailable: isAvailable,
          updatedAt: Timestamp.now(),
        });

        // Create a new order confirmation document
        const orderId = `${productId}-${buyerId}-${Date.now()}`;
        const newOrderRef = doc(collection(db, 'orders'), orderId);

        transaction.set(newOrderRef, {
          productId,
          sellerId,
          buyerId,
          price,
          quantity,
          status: 'completed',
          createdAt: serverTimestamp(),
        });

        console.log(`✅ Product ${productId} marked as sold and order created for ${buyerId}.`);
      });
    } catch (error) {
      console.error('Error in markProductAsSold transaction:', error);
      throw error;
    }
  },
};
import { Product } from './firebase';

export type PageRoute = 'home' | 'product-details' | 'checkout' | 'admin' | 'wishlist' | 'bag';

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  pincode: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  addressType: 'home' | 'office';
}

export interface StagedProduct {
  id: string;
  imagePreview: string;
  mimeType: string;
  title: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  sizes: string;
  shopName: string;
  category: string;
  description: string;
  status: 'pending' | 'analyzing' | 'ready' | 'error';
}

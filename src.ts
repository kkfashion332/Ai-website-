import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBEp2fwJmNajreNUcXqGTY_sYhzWryxAUY",
  authDomain: "fully-ai-website.firebaseapp.com",
  projectId: "fully-ai-website",
  storageBucket: "fully-ai-website.firebasestorage.app",
  messagingSenderId: "494758463985",
  appId: "1:494758463985:web:fce9c3b0a25280ba999c50"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface Product {
  id: string;
  title: string;
  mrp: number;
  sellingPrice: number;
  discountPercent?: number;
  sizes: string;
  shopName: string;
  imageUrl: string;
  category: string;
  rating: number;
  ratingCount: number;
  inStock: boolean;
  description?: string;
  createdAt?: number;
}

export const DEFAULT_FASHION_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    title: "Classic Navy Slim Fit Cotton Polo T-Shirt",
    mrp: 1499,
    sellingPrice: 599,
    discountPercent: 60,
    sizes: "S, M, L, XL",
    shopName: "WOW COLLECTION",
    imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    category: "Polo T-Shirts",
    rating: 4.8,
    ratingCount: 342,
    inStock: true,
    description: "Premium combed cotton pique knit polo t-shirt with ribbed collar."
  },
  {
    title: "Embroidered Chanderi Silk Festive Kurta Set",
    mrp: 2999,
    sellingPrice: 1199,
    discountPercent: 60,
    sizes: "M, L, XL, XXL",
    shopName: "WOW COLLECTION",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    category: "Festive Wear",
    rating: 4.9,
    ratingCount: 512,
    inStock: true,
    description: "Graceful Chanderi silk kurta with intricate zari thread work."
  },
  {
    title: "Authentic Vintage Wash Relaxed Fit Denim",
    mrp: 2499,
    sellingPrice: 899,
    discountPercent: 64,
    sizes: "30, 32, 34, 36",
    shopName: "WOW COLLECTION",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
    category: "Denim",
    rating: 4.7,
    ratingCount: 189,
    inStock: true,
    description: "Mid-rise, 5-pocket denim jeans in durable 12.5oz cotton denim."
  },
  {
    title: "Banarasi Art Silk Zari Woven Saree with Blouse",
    mrp: 3999,
    sellingPrice: 1499,
    discountPercent: 62,
    sizes: "Free Size",
    shopName: "WOW COLLECTION",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
    category: "Saree Fest",
    rating: 5.0,
    ratingCount: 421,
    inStock: true,
    description: "Rich emerald green Banarasi silk saree woven with golden floral motifs."
  }
];

const LOCAL_STORAGE_KEY = 'kkfashion_products_cache';

export function getLocalCachedProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const initial = DEFAULT_FASHION_PRODUCTS.map((item, idx) => ({
    ...item,
    id: `kk-default-${idx + 1}`,
    createdAt: Date.now() - idx * 100000
  }));
  try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial)); } catch {}
  return initial;
}

export function saveLocalCachedProducts(products: Product[]): void {
  try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products)); } catch {}
}

export function subscribeToProducts(onUpdate: (products: Product[], source: 'firestore' | 'fallback') => void): () => void {
  const colRef = collection(db, 'products');
  try {
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items: Product[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const mrp = Number(data.mrp) || 999;
          const sellingPrice = Number(data.sellingPrice) || 499;
          return {
            id: docSnap.id,
            title: data.title || 'Fashion Item',
            mrp,
            sellingPrice,
            discountPercent: data.discountPercent ? Number(data.discountPercent) : Math.round(((mrp - sellingPrice) / mrp) * 100),
            sizes: data.sizes || 'S, M, L',
            shopName: data.shopName || 'WOW COLLECTION',
            imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
            category: data.category || 'Trending',
            rating: Number(data.rating) || 5.0,
            ratingCount: Number(data.ratingCount) || 0,
            inStock: data.inStock !== false,
            description: data.description || '',
            createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
          };
        });
        saveLocalCachedProducts(items);
        onUpdate(items, 'firestore');
      } else {
        onUpdate(getLocalCachedProducts(), 'firestore');
      }
    }, () => {
      onUpdate(getLocalCachedProducts(), 'fallback');
    });
    return unsubscribe;
  } catch {
    onUpdate(getLocalCachedProducts(), 'fallback');
    return () => {};
  }
}

export async function addProductToFirestore(product: Omit<Product, 'id'>): Promise<string> {
  try {
    const colRef = collection(db, 'products');
    const docRef = await addDoc(colRef, { ...product, createdAt: serverTimestamp() });
    const current = getLocalCachedProducts();
    saveLocalCachedProducts([{ ...product, id: docRef.id, createdAt: Date.now() }, ...current]);
    return docRef.id;
  } catch {
    const id = `local-${Date.now()}`;
    const current = getLocalCachedProducts();
    saveLocalCachedProducts([{ ...product, id, createdAt: Date.now() }, ...current]);
    return id;
  }
}

export async function bulkPublishToFirestore(products: Omit<Product, 'id'>[]) {
  let successCount = 0;
  for (const item of products) {
    try {
      await addProductToFirestore(item);
      successCount++;
    } catch {}
  }
  return { successCount };
}

export async function deleteProductFromFirestore(id: string) {
  try {
    if (!id.startsWith('kk-default-') && !id.startsWith('local-')) {
      await deleteDoc(doc(db, 'products', id));
    }
  } catch {}
  const current = getLocalCachedProducts().filter((p) => p.id !== id);
  saveLocalCachedProducts(current);
}

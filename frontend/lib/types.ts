export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  provider?: 'local' | 'google' | 'facebook';
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  clothQuality?: 'normal' | 'medium' | 'premium';
  qty: number;
  /** Stock cap at time of add — used to limit quantity in cart UI */
  maxStock?: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

export interface WishlistState {
  items: string[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: 'men' | 'women' | 'children';
  images: { url: string; public_id: string }[];
  sizes: string[];
  colors: string[];
  stock: number;
  sold: number;
  ratings: number;
  numReviews: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface ShippingAddress {
  name: string;
  phones: string[];
  phone?: string;
  landmark: string;
  street: string;
  city: string;
  state: string;
  postal: string;
  country: string;
}

export interface Order {
  _id: string;
  user: string | User;
  items: {
    product: string;
    name: string;
    image: string;
    price: number;
    size: string;
    color: string;
    clothQuality?: 'normal' | 'medium' | 'premium';
    qty: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'cod' | 'bank';
  bankPaymentProof?: { url: string; public_id?: string };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingFee: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductsResponse extends PaginatedResponse<Product> {
  products: Product[];
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minRating?: number;
  maxStock?: number;
  ids?: string;
}

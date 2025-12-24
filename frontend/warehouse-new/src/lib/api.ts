import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

export interface User {
  id: number;
  username: string;
}

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

API.interceptors.request.use((config) => {
  const user = getStoredUser();
  if (user?.id) {
    config.params = {
      ...(config.params || {}),
      userId: user.id,
    };
  }
  return config;
});

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  user?: User;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  orderDate: string;
  status: "PENDING" | "SHIPPED" | "DELIVERED";
  user?: User;
}

export const productApi = {
  getAll: () => API.get<Product[]>("/products"),
  create: (product: Omit<Product, "id">) => API.post<Product>("/products", product),
  update: (id: number, product: Omit<Product, "id">) => API.put<Product>(`/products/${id}`, product),
  delete: (id: number) => API.delete(`/products/${id}`),
};

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrder {
  items: CreateOrderItem[];
}

export const orderApi = {
  getAll: () => API.get<Order[]>("/orders"),
  getItems: (orderId: number) => API.get<OrderItem[]>(`/orders/${orderId}/items`),
  create: (order: CreateOrder) => API.post<Order>("/orders", order),
  update: (id: number, order: CreateOrder) => API.put<Order>(`/orders/${id}`, order),
  delete: (id: number) => API.delete(`/orders/${id}`),
  updateStatus: (id: number, status: string) => 
    API.put(`/orders/${id}/status`, null, { params: { status } }),
};

export default API;

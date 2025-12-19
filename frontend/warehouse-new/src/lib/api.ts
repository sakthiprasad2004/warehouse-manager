import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api"
});

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
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

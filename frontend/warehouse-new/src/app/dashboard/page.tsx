"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { productApi, orderApi, Product, Order } from "@/lib/api";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


const COLORS = ["#10b981", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔐 AUTH GUARD
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  // 📦 LOAD DATA
  useEffect(() => {
    if (!authChecked) return;

    Promise.all([productApi.getAll(), orderApi.getAll()])
      .then(([productsRes, ordersRes]) => {
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authChecked]);

  // ⏳ BLOCK RENDER UNTIL AUTH CHECK
  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const stockData = products.slice(0, 5).map((p) => ({
    name: p.name,
    value: p.quantity,
  }));

  const statusCount = ["PENDING", "SHIPPED", "DELIVERED"].map((s) => ({
    status: s,
    count: orders.filter((o) => o.status === s).length,
  }));

  const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockItems = products.filter((p) => p.quantity < 5).length;
  const totalValue = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Total Stock",
      value: totalStock,
      icon: TrendingUp,
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Low Stock Alert",
      value: lowStockItems,
      icon: AlertTriangle,
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Overview of your warehouse operations
            </p>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : (
            <>
              {/* STATS */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <Card
                    key={stat.title}
                    className="border-white/10 bg-slate-900/50 backdrop-blur"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">{stat.title}</p>
                          <p className="mt-2 text-3xl font-bold text-white">
                            {stat.value}
                          </p>
                        </div>
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}
                        >
                          <stat.icon className="h-6 w-6 text-emerald-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CHARTS */}
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Stock Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stockData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={stockData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={100}
                          >
                            {stockData.map((_, i) => (
                              <Cell
                                key={i}
                                fill={COLORS[i % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-slate-400">
                        No products available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white">Order Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={statusCount}>
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* INVENTORY VALUE */}
              <Card className="mt-8 border-white/10 bg-slate-900/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">
                    Inventory Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-emerald-400">
                    ₹{totalValue.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Total value of all products in stock
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

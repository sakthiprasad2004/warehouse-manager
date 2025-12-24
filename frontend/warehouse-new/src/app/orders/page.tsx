"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { orderApi, productApi, Order, OrderItem, Product, CreateOrderItem, getStoredUser } from "@/lib/api";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, ShoppingCart, Package, Truck, CheckCircle, Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [formItems, setFormItems] = useState<CreateOrderItem[]>([{ productId: 0, quantity: 1 }]);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getAll();
      setOrders(res.data);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await productApi.getAll();
      setProducts(res.data);
    } catch (error) {
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored?.id) {
      router.replace("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    loadOrders();
    loadProducts();
  }, [authChecked]);

  const viewItems = async (order: Order) => {
    setSelectedOrder(order);
    setItemsDialogOpen(true);
    setLoadingItems(true);

    try {
      const res = await orderApi.getItems(order.id);
      setOrderItems(res.data);
    } catch (error) {
      toast.error("Failed to load order items");
    } finally {
      setLoadingItems(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await orderApi.updateStatus(id, status);
      toast.success(`Order status updated to ${status}`);
      loadOrders();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openCreateDialog = () => {
    setFormItems([{ productId: 0, quantity: 1 }]);
    setCreateDialogOpen(true);
  };

  const openEditDialog = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingItems(true);
    try {
      const res = await orderApi.getItems(order.id);
      const items = res.data.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      setFormItems(items.length > 0 ? items : [{ productId: 0, quantity: 1 }]);
      setEditDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load order items");
    } finally {
      setLoadingItems(false);
    }
  };

  const openDeleteDialog = (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const addItem = () => {
    setFormItems([...formItems, { productId: 0, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: "productId" | "quantity", value: number) => {
    const updated = [...formItems];
    updated[index][field] = value;
    setFormItems(updated);
  };

  const handleCreateOrder = async () => {
    const validItems = formItems.filter((item) => item.productId > 0 && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid item");
      return;
    }

    setSaving(true);
    try {
      await orderApi.create({ items: validItems });
      toast.success("Order created successfully");
      setCreateDialogOpen(false);
      loadOrders();
    } catch (error) {
      toast.error("Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    const validItems = formItems.filter((item) => item.productId > 0 && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid item");
      return;
    }

    setSaving(true);
    try {
      await orderApi.update(selectedOrder.id, { items: validItems });
      toast.success("Order updated successfully");
      setEditDialogOpen(false);
      loadOrders();
    } catch (error) {
      toast.error("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    setSaving(true);
    try {
      await orderApi.delete(orderToDelete.id);
      toast.success("Order deleted successfully");
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      loadOrders();
    } catch (error) {
      toast.error("Failed to delete order");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
            <Package className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
            <Truck className="mr-1 h-3 w-3" />
            Shipped
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
            <CheckCircle className="mr-1 h-3 w-3" />
            Delivered
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const OrderItemsForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-slate-300">Order Items</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Item
        </Button>
      </div>
      <div className="max-h-64 space-y-3 overflow-y-auto">
        {formItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
            <div className="flex-1">
              <Select
                value={item.productId.toString()}
                onValueChange={(val) => updateItem(index, "productId", parseInt(val))}
              >
                <SelectTrigger className="border-white/10 bg-slate-800 text-white">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-800">
                  {products.map((product) => (
                    <SelectItem
                      key={product.id}
                      value={product.id.toString()}
                      className="text-white hover:bg-white/10"
                    >
                      {product.name} (₹{product.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                className="border-white/10 bg-slate-800 text-white"
                placeholder="Qty"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              disabled={formItems.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
          <div className="flex items-center justify-between px-8 py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Orders</h1>
              <p className="mt-1 text-sm text-slate-400">
                Track and manage customer orders
              </p>
            </div>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                  <ShoppingCart className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-white">No orders yet</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Create your first order to get started
                </p>
                <Button
                  onClick={openCreateDialog}
                  className="mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Order
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">
                  All Orders ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-slate-400">Order ID</TableHead>
                      <TableHead className="text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Items</TableHead>
                      <TableHead className="text-slate-400">Change Status</TableHead>
                      <TableHead className="text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="font-mono text-slate-300">
                          #{order.id}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(order.orderDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewItems(order)}
                            className="text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Items
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-36 border-white/10 bg-slate-800 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-slate-800">
                              <SelectItem value="PENDING" className="text-white hover:bg-white/10">
                                Pending
                              </SelectItem>
                              <SelectItem value="SHIPPED" className="text-white hover:bg-white/10">
                                Shipped
                              </SelectItem>
                              <SelectItem value="DELIVERED" className="text-white hover:bg-white/10">
                                Delivered
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(order)}
                              className="text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(order)}
                              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* View Items Dialog */}
      <Dialog open={itemsDialogOpen} onOpenChange={setItemsDialogOpen}>
        <DialogContent className="border-white/10 bg-slate-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              Order #{selectedOrder?.id} Items
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {loadingItems ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              </div>
            ) : orderItems.length === 0 ? (
              <p className="text-center text-slate-400">No items in this order</p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-slate-400">
                        ₹{item.product.price.toLocaleString()} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg text-emerald-400">
                        x{item.quantity}
                      </p>
                      <p className="text-sm text-slate-400">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-400">Total</span>
                    <span className="text-xl font-bold text-emerald-400">
                      ₹
                      {orderItems
                        .reduce(
                          (acc, item) => acc + item.product.price * item.quantity,
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="border-white/10 bg-slate-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Order</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <OrderItemsForm />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
            >
              {saving ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="border-white/10 bg-slate-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <OrderItemsForm />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateOrder}
              disabled={saving}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
            >
              {saving ? "Updating..." : "Update Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-white/10 bg-slate-900 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Order</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-300">
              Are you sure you want to delete order{" "}
              <span className="font-mono font-bold text-red-400">#{orderToDelete?.id}</span>?
            </p>
            <p className="mt-2 text-sm text-slate-400">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteOrder}
              disabled={saving}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {saving ? "Deleting..." : "Delete Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

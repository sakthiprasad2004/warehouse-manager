"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { productApi, Product, getStoredUser } from "@/lib/api";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const router = useRouter();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll();
      setProducts(res.data);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
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
    loadProducts();
  }, [authChecked]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setQuantity("");
    setEditProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setQuantity(product.quantity.toString());
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !price || !quantity) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      if (editProduct) {
        await productApi.update(editProduct.id, {
          name,
          price: parseFloat(price),
          quantity: parseInt(quantity),
        });
        toast.success("Product updated successfully");
      } else {
        await productApi.create({
          name,
          price: parseFloat(price),
          quantity: parseInt(quantity),
        });
        toast.success("Product added successfully");
      }
      resetForm();
      setDialogOpen(false);
      loadProducts();
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;

    try {
      await productApi.delete(id);
      toast.success("Product deleted");
      loadProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const getStockBadge = (qty: number) => {
    if (qty === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (qty < 5) {
      return <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">Low Stock</Badge>;
    }
    return <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">In Stock</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
          <div className="flex items-center justify-between px-8 py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Inventory</h1>
              <p className="mt-1 text-sm text-slate-400">
                Manage your warehouse products
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/10 bg-slate-900">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Product Name</Label>
                    <Input
                      placeholder="Enter product name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Quantity</Label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                  >
                    {editProduct ? "Update Product" : "Add Product"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-white">No products yet</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Add your first product to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">
                  All Products ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-slate-400">ID</TableHead>
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400">Price</TableHead>
                      <TableHead className="text-slate-400">Quantity</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-right text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow
                        key={product.id}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="font-mono text-slate-300">
                          #{product.id}
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-emerald-400">
                          ₹{product.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {product.quantity}
                        </TableCell>
                        <TableCell>{getStockBadge(product.quantity)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                            className="text-slate-400 hover:bg-white/10 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </div>
  );
}

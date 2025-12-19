"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingCart, Warehouse } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Inventory", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
          <Warehouse className="h-5 w-5 text-slate-950" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">
          WareFlow
        </span>
      </div>

      <nav className="mt-6 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-emerald-400")} />
              {item.label}
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-3 right-3">
        <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4 backdrop-blur">
          <p className="text-xs text-slate-400">Connected to</p>
          <p className="mt-1 text-sm font-medium text-white">Spring Boot API</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs text-emerald-400">localhost:8080</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

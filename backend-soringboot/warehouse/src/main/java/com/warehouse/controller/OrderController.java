package com.warehouse.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.warehouse.entity.Order;
import com.warehouse.entity.OrderItem;
import com.warehouse.entity.Product;
import com.warehouse.entity.User;
import com.warehouse.repository.OrderItemRepository;
import com.warehouse.repository.OrderRepository;
import com.warehouse.repository.ProductRepository;
import com.warehouse.repository.UserRepository;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private OrderItemRepository orderItemRepo;

    @Autowired
    private UserRepository userRepo;

    // =========================
    // CREATE ORDER + ITEMS
    // =========================
    @PostMapping
    public Order createOrder(
            @RequestBody(required = false) CreateOrderRequest request,
            @RequestParam Long userId) {

        User user = getUser(userId);

        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setUser(user);
        Order savedOrder = orderRepo.save(order);

        // Save order items (NO stock reduction here)
        if (request != null && request.getItems() != null) {
            for (CreateOrderItem item : request.getItems()) {
                Product product = productRepo.findById(item.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));

                validateProductOwnership(product, userId);

                if (product.getQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Not enough stock for " + product.getName());
                }

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setProduct(product);
                orderItem.setQuantity(item.getQuantity());
                orderItemRepo.save(orderItem);
            }
        }

        return savedOrder;
    }

    // =========================
    // GET ALL ORDERS
    // =========================
    @GetMapping
    public List<Order> getOrders(@RequestParam Long userId) {
        return orderRepo.findByUserId(userId);
    }

    // =========================
    // GET ORDER ITEMS
    // =========================
    @GetMapping("/{orderId}/items")
    public List<OrderItem> getOrderItems(
            @PathVariable Long orderId,
            @RequestParam Long userId) {

        Order order = orderRepo.findById(orderId).orElseThrow();
        validateOrderOwnership(order, userId);
        return orderItemRepo.findByOrderId(orderId);
    }

    // =========================
    // UPDATE ORDER STATUS
    // (REDUCE STOCK ON SHIPPED)
    // =========================
    @PutMapping("/{id}/status")
    public Order updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam Long userId) {

        Order order = orderRepo.findById(id).orElseThrow();
        validateOrderOwnership(order, userId);
        String oldStatus = order.getStatus();

        // Reduce inventory ONLY when moving to SHIPPED
        if ("SHIPPED".equals(status) && "PENDING".equals(oldStatus)) {
            List<OrderItem> items = orderItemRepo.findByOrderId(id);

            for (OrderItem item : items) {
                Product product = item.getProduct();

                if (product.getQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Not enough stock for " + product.getName());
                }

                product.setQuantity(product.getQuantity() - item.getQuantity());
                productRepo.save(product);
            }
        }

        order.setStatus(status);
        return orderRepo.save(order);
    }

    // =========================
    // UPDATE ORDER (SAFE)
    // =========================
    @PutMapping("/{id}")
    public Order updateOrder(
            @PathVariable Long id,
            @RequestBody(required = false) CreateOrderRequest updatedOrder,
            @RequestParam Long userId) {

        Order order = orderRepo.findById(id).orElseThrow();
        validateOrderOwnership(order, userId);

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Only pending orders can be edited");
        }

        if (updatedOrder != null && updatedOrder.getItems() != null) {
            List<OrderItem> existingItems = orderItemRepo.findByOrderId(id);
            orderItemRepo.deleteAll(existingItems);
            for (CreateOrderItem item : updatedOrder.getItems()) {
                Product product = productRepo.findById(item.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));

                validateProductOwnership(product, userId);

                if (product.getQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Not enough stock for " + product.getName());
                }

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(item.getQuantity());
                orderItemRepo.save(orderItem);
            }
        }

        return orderRepo.save(order);
    }

    // =========================
    // DELETE ORDER
    // (RESTORE STOCK IF SHIPPED)
    // =========================
    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id, @RequestParam Long userId) {

        Order order = orderRepo.findById(id).orElseThrow();
        validateOrderOwnership(order, userId);
        List<OrderItem> items = orderItemRepo.findByOrderId(id);

        if ("SHIPPED".equals(order.getStatus()) || "DELIVERED".equals(order.getStatus())) {
            for (OrderItem item : items) {
                Product product = item.getProduct();
                product.setQuantity(product.getQuantity() + item.getQuantity());
                productRepo.save(product);
            }
        }

        orderItemRepo.deleteAll(items);
        orderRepo.deleteById(id);
    }

    private User getUser(Long userId) {
        return userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void validateOrderOwnership(Order order, Long userId) {
        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }
    }

    private void validateProductOwnership(Product product, Long userId) {
        if (product.getUser() == null || !product.getUser().getId().equals(userId)) {
            throw new RuntimeException("Product does not belong to this user");
        }
    }
}

/* =========================
   DTO CLASSES
   ========================= */

class CreateOrderRequest {
    private List<CreateOrderItem> items;

    public List<CreateOrderItem> getItems() {
        return items;
    }

    public void setItems(List<CreateOrderItem> items) {
        this.items = items;
    }
}

class CreateOrderItem {
    private Long productId;
    private int quantity;

    public Long getProductId() {
        return productId;
    }

    public int getQuantity() {
        return quantity;
    }
}

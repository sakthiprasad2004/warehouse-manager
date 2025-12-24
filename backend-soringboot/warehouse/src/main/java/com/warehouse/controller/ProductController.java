package com.warehouse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.warehouse.repository.ProductRepository;
import com.warehouse.repository.UserRepository;
import com.warehouse.entity.Product;
import com.warehouse.entity.User;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*")
public class ProductController {

    @Autowired
    private ProductRepository repo;

    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public List<Product> getAllProducts(@RequestParam Long userId) {
        return repo.findByUserId(userId);
    }

    @PostMapping
    public Product addProduct(@RequestBody Product p, @RequestParam Long userId) {
        User user = getUser(userId);
        p.setUser(user);
        return repo.save(p);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id, @RequestParam Long userId) {
        Product existing = repo.findById(id).orElseThrow();
        validateOwnership(existing, userId);
        repo.deleteById(id);
    }
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product p, @RequestParam Long userId) {
        Product existing = repo.findById(id).orElseThrow();
        validateOwnership(existing, userId);
        existing.setName(p.getName());
        existing.setPrice(p.getPrice());
        existing.setQuantity(p.getQuantity());
        return repo.save(existing);
    }

    private User getUser(Long userId) {
        return userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void validateOwnership(Product product, Long userId) {
        if (product.getUser() == null || !product.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to product");
        }
    }
}

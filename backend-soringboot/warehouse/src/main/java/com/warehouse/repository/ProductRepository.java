package com.warehouse.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.warehouse.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
	List<Product> findByUserId(Long userId);
}

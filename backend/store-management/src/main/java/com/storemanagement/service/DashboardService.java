package com.storemanagement.service;

import com.storemanagement.dto.DashboardStats;
import com.storemanagement.entity.Order;
import com.storemanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final OrderRepository orderRepository;
    
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        DashboardStats stats = new DashboardStats();
        
        stats.setTotalProducts(productRepository.count());
        stats.setTotalCustomers(customerRepository.count());
        stats.setTotalEmployees(employeeRepository.count());
        stats.setTotalOrders(orderRepository.count());
        
        stats.setPendingOrders(
            orderRepository.findByStatus(Order.OrderStatus.PENDING).stream().count()
        );
        
        stats.setCompletedOrders(
            orderRepository.findByStatus(Order.OrderStatus.COMPLETED).stream().count()
        );
        
        List<Order> completedOrders = orderRepository.findByStatus(Order.OrderStatus.COMPLETED);
        BigDecimal totalRevenue = completedOrders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalRevenue(totalRevenue);
        
        stats.setLowStockProducts(
            productRepository.findByStockQuantityLessThan(10).stream().count()
        );
        
        return stats;
    }
}

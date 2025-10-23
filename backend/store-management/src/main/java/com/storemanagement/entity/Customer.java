package com.storemanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_customer")
    private Integer idCustomer;
    
    @OneToOne
    @JoinColumn(name = "id_user", unique = true)
    private User user;
    
    @Column(name = "customer_name", nullable = false, length = 255)
    private String customerName;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type")
    private CustomerType customerType = CustomerType.REGULAR;
    
    public enum CustomerType {
        VIP, REGULAR
    }
}

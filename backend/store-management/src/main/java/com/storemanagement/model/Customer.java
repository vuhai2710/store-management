package com.storemanagement.model;

import com.storemanagement.utility.CustomerType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_customer")
    private Integer idCustomer;

    @OneToOne
    @JoinColumn(name = "id_user", unique = true)
    private User user;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "address")
    private String address;

    @Column(name = "phone_number", nullable = false, unique = true)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type")
    private CustomerType customerType = CustomerType.REGULAR;
}

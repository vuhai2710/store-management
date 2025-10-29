package com.storemanagement.model;

import com.storemanagement.utils.CustomerType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customers")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_customer")
    private Integer idCustomer;

    @OneToOne(fetch = FetchType.EAGER)
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

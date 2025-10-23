package com.storemanagement.service;

import com.storemanagement.dto.SupplierRequest;
import com.storemanagement.dto.SupplierResponse;
import com.storemanagement.entity.Supplier;
import com.storemanagement.exception.ResourceNotFoundException;
import com.storemanagement.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {
    
    private final SupplierRepository supplierRepository;
    
    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return convertToResponse(supplier);
    }
    
    @Transactional(readOnly = true)
    public List<SupplierResponse> searchSuppliers(String keyword) {
        return supplierRepository.findBySupplierNameContainingIgnoreCase(keyword).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        Supplier supplier = new Supplier();
        supplier.setSupplierName(request.getSupplierName());
        supplier.setAddress(request.getAddress());
        supplier.setPhoneNumber(request.getPhoneNumber());
        supplier.setEmail(request.getEmail());
        
        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToResponse(savedSupplier);
    }
    
    @Transactional
    public SupplierResponse updateSupplier(Integer id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        
        supplier.setSupplierName(request.getSupplierName());
        supplier.setAddress(request.getAddress());
        supplier.setPhoneNumber(request.getPhoneNumber());
        supplier.setEmail(request.getEmail());
        
        Supplier updatedSupplier = supplierRepository.save(supplier);
        return convertToResponse(updatedSupplier);
    }
    
    @Transactional
    public void deleteSupplier(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        supplierRepository.delete(supplier);
    }
    
    private SupplierResponse convertToResponse(Supplier supplier) {
        SupplierResponse response = new SupplierResponse();
        response.setIdSupplier(supplier.getIdSupplier());
        response.setSupplierName(supplier.getSupplierName());
        response.setAddress(supplier.getAddress());
        response.setPhoneNumber(supplier.getPhoneNumber());
        response.setEmail(supplier.getEmail());
        response.setCreatedAt(supplier.getCreatedAt());
        return response;
    }
}

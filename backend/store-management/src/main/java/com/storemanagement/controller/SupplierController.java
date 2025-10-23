package com.storemanagement.controller;

import com.storemanagement.dto.SupplierRequest;
import com.storemanagement.dto.SupplierResponse;
import com.storemanagement.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupplierController {
    
    private final SupplierService supplierService;
    
    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        List<SupplierResponse> suppliers = supplierService.getAllSuppliers();
        return ResponseEntity.ok(suppliers);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable Integer id) {
        SupplierResponse supplier = supplierService.getSupplierById(id);
        return ResponseEntity.ok(supplier);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<SupplierResponse>> searchSuppliers(@RequestParam String keyword) {
        List<SupplierResponse> suppliers = supplierService.searchSuppliers(keyword);
        return ResponseEntity.ok(suppliers);
    }
    
    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse supplier = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(supplier);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @PathVariable Integer id,
            @Valid @RequestBody SupplierRequest request) {
        SupplierResponse supplier = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(supplier);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteSupplier(@PathVariable Integer id) {
        supplierService.deleteSupplier(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa nhà cung cấp thành công");
        return ResponseEntity.ok(response);
    }
}

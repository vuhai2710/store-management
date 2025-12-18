package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.supplier.SupplierDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SupplierService {

    SupplierDTO createSupplier(SupplierDTO supplierDTO);

    SupplierDTO updateSupplier(Integer id, SupplierDTO supplierDTO);

    void deleteSupplier(Integer id);

    SupplierDTO getSupplierById(Integer id);

    List<SupplierDTO> getAllSuppliers();

    PageResponse<SupplierDTO> getAllSuppliersPaginated(Pageable pageable);

    PageResponse<SupplierDTO> searchSuppliersByName(String name, Pageable pageable);
}

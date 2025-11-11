package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.supplier.SupplierDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SupplierService {

    // Tạo nhà cung cấp mới
    SupplierDTO createSupplier(SupplierDTO supplierDTO);

    // Cập nhật nhà cung cấp
    SupplierDTO updateSupplier(Integer id, SupplierDTO supplierDTO);

    // Xóa nhà cung cấp
    void deleteSupplier(Integer id);

    // Lấy thông tin nhà cung cấp theo ID
    SupplierDTO getSupplierById(Integer id);

    // Lấy danh sách tất cả nhà cung cấp (không phân trang)
    List<SupplierDTO> getAllSuppliers();

    // Lấy danh sách nhà cung cấp có phân trang
    PageResponse<SupplierDTO> getAllSuppliersPaginated(Pageable pageable);

    // Tìm kiếm nhà cung cấp theo tên (gần đúng)
    PageResponse<SupplierDTO> searchSuppliersByName(String name, Pageable pageable);
}





































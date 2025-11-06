package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.response.SupplierDto;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SupplierService {

    // Tạo nhà cung cấp mới
    SupplierDto createSupplier(SupplierDto supplierDto);

    // Cập nhật nhà cung cấp
    SupplierDto updateSupplier(Integer id, SupplierDto supplierDto);

    // Xóa nhà cung cấp
    void deleteSupplier(Integer id);

    // Lấy thông tin nhà cung cấp theo ID
    SupplierDto getSupplierById(Integer id);

    // Lấy danh sách tất cả nhà cung cấp (không phân trang)
    List<SupplierDto> getAllSuppliers();

    // Lấy danh sách nhà cung cấp có phân trang
    PageResponse<SupplierDto> getAllSuppliersPaginated(Pageable pageable);

    // Tìm kiếm nhà cung cấp theo tên (gần đúng)
    PageResponse<SupplierDto> searchSuppliersByName(String name, Pageable pageable);
}





































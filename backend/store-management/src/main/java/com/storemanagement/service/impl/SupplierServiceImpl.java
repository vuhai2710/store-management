package com.storemanagement.service.impl;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.supplier.SupplierDTO;
import com.storemanagement.mapper.SupplierMapper;
import com.storemanagement.model.Supplier;
import com.storemanagement.repository.SupplierRepository;
import com.storemanagement.service.SupplierService;
import com.storemanagement.utils.PageUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    public SupplierDTO createSupplier(SupplierDTO supplierDTO) {
        log.info("Creating supplier: {}", supplierDTO.getSupplierName());

        if (supplierDTO.getEmail() != null && !supplierDTO.getEmail().trim().isEmpty()) {
            if (supplierRepository.findByEmail(supplierDTO.getEmail()).isPresent()) {
                throw new RuntimeException("Email đã được sử dụng: " + supplierDTO.getEmail());
            }
        }

        // Map DTO sang Entity
        Supplier supplier = supplierMapper.toEntity(supplierDTO);
        supplier.setCreatedAt(LocalDateTime.now());

        // Lưu vào DB
        Supplier savedSupplier = supplierRepository.save(supplier);
        log.info("Supplier created successfully with ID: {}", savedSupplier.getIdSupplier());

        return supplierMapper.toDTO(savedSupplier);
    }

    @Override
    public SupplierDTO updateSupplier(Integer id, SupplierDTO supplierDTO) {
        log.info("Updating supplier ID: {}", id);

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + id));

        if (supplierDTO.getEmail() != null && !supplierDTO.getEmail().equals(supplier.getEmail())) {
            if (supplierRepository.findByEmail(supplierDTO.getEmail()).isPresent()) {
                throw new RuntimeException("Email đã được sử dụng: " + supplierDTO.getEmail());
            }
            supplier.setEmail(supplierDTO.getEmail());
        }

        // Cập nhật các trường khác
        if (supplierDTO.getSupplierName() != null) {
            supplier.setSupplierName(supplierDTO.getSupplierName());
        }
        if (supplierDTO.getAddress() != null) {
            supplier.setAddress(supplierDTO.getAddress());
        }
        if (supplierDTO.getPhoneNumber() != null) {
            supplier.setPhoneNumber(supplierDTO.getPhoneNumber());
        }

        // Lưu lại
        Supplier updatedSupplier = supplierRepository.save(supplier);
        log.info("Supplier updated successfully: {}", updatedSupplier.getIdSupplier());

        return supplierMapper.toDTO(updatedSupplier);
    }

    @Override
    public void deleteSupplier(Integer id) {
        log.info("Deleting supplier ID: {}", id);

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + id));

        supplierRepository.delete(supplier);
        log.info("Supplier deleted successfully: {}", id);
    }

    @Override
    public SupplierDTO getSupplierById(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + id));
        return supplierMapper.toDTO(supplier);
    }

    @Override
    public List<SupplierDTO> getAllSuppliers() {
        List<Supplier> suppliers = supplierRepository.findAll();
        return supplierMapper.toDTOList(suppliers);
    }

    @Override
    public PageResponse<SupplierDTO> getAllSuppliersPaginated(Pageable pageable) {
        Page<Supplier> supplierPage = supplierRepository.findAll(pageable);
        List<SupplierDTO> supplierDTOs = supplierMapper.toDTOList(supplierPage.getContent());
        return PageUtils.toPageResponse(supplierPage, supplierDTOs);
    }

    @Override
    public PageResponse<SupplierDTO> searchSuppliersByName(String name, Pageable pageable) {
        Page<Supplier> supplierPage = supplierRepository.findBySupplierNameContainingIgnoreCase(name, pageable);
        List<SupplierDTO> supplierDTOs = supplierMapper.toDTOList(supplierPage.getContent());
        return PageUtils.toPageResponse(supplierPage, supplierDTOs);
    }
}





































package com.storemanagement.service.impl;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.response.SupplierDto;
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
    public SupplierDto createSupplier(SupplierDto supplierDto) {
        log.info("Creating supplier: {}", supplierDto.getSupplierName());

        if (supplierDto.getEmail() != null && !supplierDto.getEmail().trim().isEmpty()) {
            if (supplierRepository.findByEmail(supplierDto.getEmail()).isPresent()) {
                throw new RuntimeException("Email đã được sử dụng: " + supplierDto.getEmail());
            }
        }

        // Map DTO sang Entity
        Supplier supplier = supplierMapper.toEntity(supplierDto);
        supplier.setCreatedAt(LocalDateTime.now());

        // Lưu vào DB
        Supplier savedSupplier = supplierRepository.save(supplier);
        log.info("Supplier created successfully with ID: {}", savedSupplier.getIdSupplier());

        return supplierMapper.toDto(savedSupplier);
    }

    @Override
    public SupplierDto updateSupplier(Integer id, SupplierDto supplierDto) {
        log.info("Updating supplier ID: {}", id);

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + id));

        if (supplierDto.getEmail() != null && !supplierDto.getEmail().equals(supplier.getEmail())) {
            if (supplierRepository.findByEmail(supplierDto.getEmail()).isPresent()) {
                throw new RuntimeException("Email đã được sử dụng: " + supplierDto.getEmail());
            }
            supplier.setEmail(supplierDto.getEmail());
        }

        // Cập nhật các trường khác
        if (supplierDto.getSupplierName() != null) {
            supplier.setSupplierName(supplierDto.getSupplierName());
        }
        if (supplierDto.getAddress() != null) {
            supplier.setAddress(supplierDto.getAddress());
        }
        if (supplierDto.getPhoneNumber() != null) {
            supplier.setPhoneNumber(supplierDto.getPhoneNumber());
        }

        // Lưu lại
        Supplier updatedSupplier = supplierRepository.save(supplier);
        log.info("Supplier updated successfully: {}", updatedSupplier.getIdSupplier());

        return supplierMapper.toDto(updatedSupplier);
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
    public SupplierDto getSupplierById(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + id));
        return supplierMapper.toDto(supplier);
    }

    @Override
    public List<SupplierDto> getAllSuppliers() {
        List<Supplier> suppliers = supplierRepository.findAll();
        return supplierMapper.toDtoList(suppliers);
    }

    @Override
    public PageResponse<SupplierDto> getAllSuppliersPaginated(Pageable pageable) {
        Page<Supplier> supplierPage = supplierRepository.findAll(pageable);
        List<SupplierDto> supplierDtos = supplierMapper.toDtoList(supplierPage.getContent());
        return PageUtils.toPageResponse(supplierPage, supplierDtos);
    }

    @Override
    public PageResponse<SupplierDto> searchSuppliersByName(String name, Pageable pageable) {
        Page<Supplier> supplierPage = supplierRepository.findBySupplierNameContainingIgnoreCase(name, pageable);
        List<SupplierDto> supplierDtos = supplierMapper.toDtoList(supplierPage.getContent());
        return PageUtils.toPageResponse(supplierPage, supplierDtos);
    }
}





































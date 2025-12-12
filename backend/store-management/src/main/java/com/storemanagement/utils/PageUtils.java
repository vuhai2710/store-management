package com.storemanagement.utils;

import com.storemanagement.dto.PageResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public class PageUtils {
    /**
     * Convert Spring Data Page to PageResponse with 1-based pageNo for frontend compatibility
     * Spring Data uses 0-based page index, but frontend typically uses 1-based
     */
    public static <T> PageResponse<T> toPageResponse(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNo(page.getNumber() + 1)  // Convert 0-based to 1-based for FE
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .isEmpty(page.isEmpty())
                .build();
    }

    /**
     * Convert Spring Data Page to PageResponse with mapped content
     * Uses 1-based pageNo for frontend compatibility
     */
    public static <T> PageResponse<T> toPageResponse(Page<?> page, List<T> mappedContent) {
        return PageResponse.<T>builder()
                .content(mappedContent)
                .pageNo(page.getNumber() + 1)  // Convert 0-based to 1-based for FE
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .isEmpty(page.isEmpty())
                .build();
    }
}


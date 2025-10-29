package com.storemanagement.utils;

import com.storemanagement.dto.PageResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public class PageUtils {
    public static <T> PageResponse<T> toPageResponse(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNo(page.getNumber())
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

    public static <T> PageResponse<T> toPageResponse(Page<?> page, List<T> mappedContent) {
        return PageResponse.<T>builder()
                .content(mappedContent)
                .pageNo(page.getNumber())
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


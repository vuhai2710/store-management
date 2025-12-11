package com.storemanagement.service.impl;

import com.storemanagement.model.SystemSetting;
import com.storemanagement.repository.SystemSettingRepository;
import com.storemanagement.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SystemSettingServiceImpl implements SystemSettingService {

    private static final String RETURN_WINDOW_DAYS_KEY = "RETURN_WINDOW_DAYS";
    private static final int DEFAULT_RETURN_WINDOW_DAYS = 7;
    
    private static final String REVIEW_EDIT_WINDOW_HOURS_KEY = "REVIEW_EDIT_WINDOW_HOURS";
    private static final int DEFAULT_REVIEW_EDIT_WINDOW_HOURS = 24;

    private final SystemSettingRepository systemSettingRepository;

    @Override
    @Transactional(readOnly = true)
    public int getReturnWindowDays() {
        return systemSettingRepository.findByKey(RETURN_WINDOW_DAYS_KEY)
                .map(setting -> {
                    try {
                        return Integer.parseInt(setting.getValue());
                    } catch (NumberFormatException e) {
                        log.warn("Invalid RETURN_WINDOW_DAYS value: {}, using default: {}",
                                setting.getValue(), DEFAULT_RETURN_WINDOW_DAYS);
                        return DEFAULT_RETURN_WINDOW_DAYS;
                    }
                })
                .orElse(DEFAULT_RETURN_WINDOW_DAYS);
    }


    @Override
    public void updateReturnWindow(int days) {
        if (days <= 0) {
            throw new IllegalArgumentException("Số ngày đổi trả phải lớn hơn 0");
        }

        SystemSetting setting = systemSettingRepository.findByKey(RETURN_WINDOW_DAYS_KEY)
                .orElseGet(() -> SystemSetting.builder()
                        .key(RETURN_WINDOW_DAYS_KEY)
                        .description("Số ngày cho phép khách hàng yêu cầu đổi/trả hàng sau khi nhận hàng")
                        .build());

        setting.setValue(String.valueOf(days));
        setting.setUpdatedAt(LocalDateTime.now());

        systemSettingRepository.save(setting);
        log.info("Updated RETURN_WINDOW_DAYS to {} days", days);
    }

    @Override
    @Transactional(readOnly = true)
    public int getReviewEditWindowHours() {
        return systemSettingRepository.findByKey(REVIEW_EDIT_WINDOW_HOURS_KEY)
                .map(setting -> {
                    try {
                        return Integer.parseInt(setting.getValue());
                    } catch (NumberFormatException e) {
                        log.warn("Invalid REVIEW_EDIT_WINDOW_HOURS value: {}, using default: {}",
                                setting.getValue(), DEFAULT_REVIEW_EDIT_WINDOW_HOURS);
                        return DEFAULT_REVIEW_EDIT_WINDOW_HOURS;
                    }
                })
                .orElse(DEFAULT_REVIEW_EDIT_WINDOW_HOURS);
    }

    @Override
    public void updateReviewEditWindow(int hours) {
        if (hours <= 0) {
            throw new IllegalArgumentException("Số giờ sửa đánh giá phải lớn hơn 0");
        }

        SystemSetting setting = systemSettingRepository.findByKey(REVIEW_EDIT_WINDOW_HOURS_KEY)
                .orElseGet(() -> SystemSetting.builder()
                        .key(REVIEW_EDIT_WINDOW_HOURS_KEY)
                        .description("Số giờ cho phép khách hàng chỉnh sửa đánh giá sau khi tạo")
                        .build());

        setting.setValue(String.valueOf(hours));
        setting.setUpdatedAt(LocalDateTime.now());

        systemSettingRepository.save(setting);
        log.info("Updated REVIEW_EDIT_WINDOW_HOURS to {} hours", hours);
    }
}

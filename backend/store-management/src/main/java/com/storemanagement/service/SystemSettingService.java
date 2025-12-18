package com.storemanagement.service;

public interface SystemSettingService {

    int getReturnWindowDays();

    void updateReturnWindow(int days);

    String getAutoFreeShippingPromotion();

    void updateAutoFreeShippingPromotion(String code);

    int getReviewEditWindowHours();

    void updateReviewEditWindow(int hours);
}

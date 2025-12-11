package com.storemanagement.service;

public interface SystemSettingService {

    int getReturnWindowDays();

    void updateReturnWindow(int days);

    int getReviewEditWindowHours();

    void updateReviewEditWindow(int hours);
}

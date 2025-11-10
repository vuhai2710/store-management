package com.storemanagement.service;

/**
 * Service interface để gửi email
 * 
 * Hỗ trợ:
 * - Gửi email đơn giản (text)
 * - Gửi email HTML
 * - Gửi email quên mật khẩu
 * - Gửi email thông báo
 */
public interface EmailService {
    
    /**
     * Gửi email đơn giản (plain text)
     * 
     * @param to Email người nhận
     * @param subject Tiêu đề email
     * @param text Nội dung email (plain text)
     */
    void sendSimpleEmail(String to, String subject, String text);
    
    /**
     * Gửi email HTML
     * 
     * @param to Email người nhận
     * @param subject Tiêu đề email
     * @param htmlContent Nội dung email (HTML)
     */
    void sendHtmlEmail(String to, String subject, String htmlContent);
    
    /**
     * Gửi email quên mật khẩu với mật khẩu mới
     * 
     * @param to Email người nhận
     * @param username Username của tài khoản
     * @param newPassword Mật khẩu mới (chưa mã hóa)
     */
    void sendForgotPasswordEmail(String to, String username, String newPassword);
    
    /**
     * Gửi email thông báo chung
     * 
     * @param to Email người nhận
     * @param title Tiêu đề thông báo
     * @param message Nội dung thông báo
     */
    void sendNotificationEmail(String to, String title, String message);
}












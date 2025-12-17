package com.storemanagement.service;

public interface EmailService {

    void sendSimpleEmail(String to, String subject, String text);

    void sendHtmlEmail(String to, String subject, String htmlContent);

    void sendForgotPasswordEmail(String to, String username, String newPassword);

    void sendPasswordResetEmail(String to, String username, String resetLink, int expiryMinutes);

    void sendNotificationEmail(String to, String title, String message);
}

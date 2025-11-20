package com.storemanagement.service.impl;

import com.storemanagement.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    
    @Override
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            log.info("Simple email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Error sending simple email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email: " + e.getMessage());
        }
    }
    
    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML
            
            mailSender.send(mimeMessage);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Error sending HTML email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email: " + e.getMessage());
        }
    }
    
    @Override
    public void sendForgotPasswordEmail(String to, String username, String newPassword) {
        String subject = "Khôi phục mật khẩu - Store Management System";
        String htmlContent = buildForgotPasswordHtml(username, newPassword);
        sendHtmlEmail(to, subject, htmlContent);
    }
    
    @Override
    public void sendNotificationEmail(String to, String title, String message) {
        String subject = "Thông báo - Store Management System";
        String htmlContent = buildNotificationHtml(title, message);
        sendHtmlEmail(to, subject, htmlContent);
    }
    
    /**
     * Tạo HTML template cho email quên mật khẩu
     */
    private String buildForgotPasswordHtml(String username, String newPassword) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                        border-radius: 10px;
                    }
                    .header {
                        background-color: #4CAF50;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background-color: white;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .password-box {
                        background-color: #f0f0f0;
                        border-left: 4px solid #4CAF50;
                        padding: 15px;
                        margin: 20px 0;
                        font-size: 18px;
                        font-weight: bold;
                        letter-spacing: 2px;
                    }
                    .warning {
                        color: #f44336;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        font-size: 12px;
                        color: #888;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Khôi phục mật khẩu</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.</p>
                        <p>Mật khẩu mới của bạn là:</p>
                        <div class="password-box">%s</div>
                        <p class="warning">⚠️ Vui lòng đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản!</p>
                        <p>Để đổi mật khẩu:</p>
                        <ol>
                            <li>Đăng nhập bằng mật khẩu mới</li>
                            <li>Vào phần "Thông tin tài khoản"</li>
                            <li>Chọn "Đổi mật khẩu"</li>
                        </ol>
                        <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này và liên hệ với chúng tôi ngay.</p>
                        <p>Trân trọng,<br><strong>Store Management Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                        <p>&copy; 2025 Store Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, username, newPassword);
    }
    
    /**
     * Tạo HTML template cho email thông báo
     */
    private String buildNotificationHtml(String title, String message) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                        border-radius: 10px;
                    }
                    .header {
                        background-color: #2196F3;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background-color: white;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .message-box {
                        background-color: #e3f2fd;
                        border-left: 4px solid #2196F3;
                        padding: 15px;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        font-size: 12px;
                        color: #888;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Thông báo</h1>
                    </div>
                    <div class="content">
                        <h2>%s</h2>
                        <div class="message-box">
                            <p>%s</p>
                        </div>
                        <p>Trân trọng,<br><strong>Store Management Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                        <p>&copy; 2025 Store Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, title, message.replace("\n", "<br>"));
    }
}
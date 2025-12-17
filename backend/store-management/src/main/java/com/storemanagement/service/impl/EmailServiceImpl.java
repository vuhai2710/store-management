package com.storemanagement.service.impl;

import com.storemanagement.service.EmailService;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    private boolean emailConfigured = false;

    @PostConstruct
    public void init() {
        emailConfigured = mailUsername != null && !mailUsername.isEmpty();
        if (!emailConfigured) {
            log.warn("⚠️ Email is NOT configured! Set EMAIL_USERNAME and EMAIL_PASSWORD environment variables.");
            log.warn(
                    "⚠️ In development mode, reset password links will be logged to console instead of sent via email.");
        } else {
            log.info("✅ Email configured with username: {}", mailUsername);
        }
    }

    @Override
    public void sendSimpleEmail(String to, String subject, String text) {
        if (!emailConfigured) {
            log.warn("📧 [DEV MODE] Would send email to: {}", to);
            log.warn("📧 [DEV MODE] Subject: {}", subject);
            log.warn("📧 [DEV MODE] Content: {}", text);
            return;
        }

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
        if (!emailConfigured) {
            log.warn("📧 [DEV MODE] Would send HTML email to: {}", to);
            log.warn("📧 [DEV MODE] Subject: {}", subject);
            // Don't log full HTML content, too verbose
            return;
        }

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
    public void sendPasswordResetEmail(String to, String username, String resetLink, int expiryMinutes) {
        if (!emailConfigured) {
            log.warn("📧 ════════════════════════════════════════════════════════════════");
            log.warn("📧 [DEV MODE] Password Reset Email for: {}", to);
            log.warn("📧 [DEV MODE] Username: {}", username);
            log.warn("📧 [DEV MODE] 🔗 RESET LINK: {}", resetLink);
            log.warn("📧 [DEV MODE] ⏱️ Expires in: {} minutes", expiryMinutes);
            log.warn("📧 ════════════════════════════════════════════════════════════════");
            return;
        }

        String subject = "Đặt lại mật khẩu - Electronic Store";
        String htmlContent = buildPasswordResetHtml(username, resetLink, expiryMinutes);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Tạo HTML template cho email quên mật khẩu
     */
    private String buildForgotPasswordHtml(String username, String newPassword) {
        return String.format(
                """
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
                        """,
                username, newPassword);
    }

    /**
     * Tạo HTML template cho email đặt lại mật khẩu với link
     */
    private String buildPasswordResetHtml(String username, String resetLink, int expiryMinutes) {
        return String.format(
                """
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <meta charset="UTF-8">
                                    <style>
                                        body {
                                            font-family: 'Segoe UI', Arial, sans-serif;
                                            line-height: 1.6;
                                            color: #333;
                                            margin: 0;
                                            padding: 0;
                                        }
                                        .container {
                                            max-width: 600px;
                                            margin: 0 auto;
                                            padding: 20px;
                                            background-color: #f5f7fa;
                                        }
                                        .header {
                                            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                                            color: white;
                                            padding: 30px;
                                            text-align: center;
                                            border-radius: 12px 12px 0 0;
                                        }
                                        .header h1 {
                                            margin: 0;
                                            font-size: 24px;
                                        }
                                        .content {
                                            background-color: white;
                                            padding: 40px 30px;
                                            border-radius: 0 0 12px 12px;
                                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                        }
                                        .greeting {
                                            font-size: 18px;
                                            margin-bottom: 20px;
                                        }
                                        .message {
                                            color: #555;
                                            margin-bottom: 30px;
                                        }
                                        .btn-reset {
                                            display: inline-block;
                                            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                                            color: white !important;
                                            text-decoration: none;
                                            padding: 15px 40px;
                                            border-radius: 8px;
                                            font-weight: bold;
                                            font-size: 16px;
                                            text-align: center;
                                        }
                                        .btn-container {
                                            text-align: center;
                                            margin: 30px 0;
                                        }
                                        .warning {
                                            background-color: #fff3cd;
                                            border-left: 4px solid #ffc107;
                                            padding: 15px;
                                            margin: 25px 0;
                                            border-radius: 4px;
                                            font-size: 14px;
                                        }
                                        .link-text {
                                            word-break: break-all;
                                            color: #667eea;
                                            font-size: 12px;
                                            background-color: #f0f0f0;
                                            padding: 10px;
                                            border-radius: 4px;
                                            margin-top: 20px;
                                        }
                                        .footer {
                                            text-align: center;
                                            margin-top: 30px;
                                            font-size: 12px;
                                            color: #888;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <h1>🔐 Đặt lại mật khẩu</h1>
                                        </div>
                                        <div class="content">
                                            <p class="greeting">Xin chào <strong>%s</strong>,</p>
                                            <p class="message">
                                                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại Electronic Store.
                                                Nhấn vào nút bên dưới để đặt lại mật khẩu của bạn.
                                            </p>

                                            <div class="btn-container">
                                                <a href="%s" class="btn-reset">Đặt lại mật khẩu</a>
                                            </div>

                                            <div class="warning">
                                                ⏱️ <strong>Lưu ý:</strong> Link này sẽ hết hạn sau <strong>%d phút</strong>.
                                                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                                            </div>

                                            <p style="font-size: 14px; color: #666;">
                                                Nếu nút không hoạt động, sao chép và dán link dưới đây vào trình duyệt:
                                            </p>
                                            <div class="link-text">%s</div>

                                            <p style="margin-top: 30px;">
                                                Trân trọng,<br><strong>Electronic Store Team</strong>
                                            </p>
                                        </div>
                                        <div class="footer">
                                            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                                            <p>&copy; 2025 Electronic Store. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                username, resetLink, expiryMinutes, resetLink);
    }
}

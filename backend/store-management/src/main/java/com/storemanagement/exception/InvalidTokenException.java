package com.storemanagement.exception;

public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(String message) {
        super(message);
    }

    public static InvalidTokenException expired() {
        return new InvalidTokenException("Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.");
    }

    public static InvalidTokenException alreadyUsed() {
        return new InvalidTokenException("Token đã được sử dụng. Vui lòng yêu cầu đặt lại mật khẩu mới.");
    }

    public static InvalidTokenException invalid() {
        return new InvalidTokenException("Token không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.");
    }
}

package com.storemanagement.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidPhoneValidator implements ConstraintValidator<ValidPhone, String> {

    private static final int PHONE_LENGTH = 10;
    private static final String PHONE_REGEX = "^0\\d{9}$";

    @Override
    public void initialize(ValidPhone constraintAnnotation) {
    }

    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }

        if (phoneNumber.length() != PHONE_LENGTH) {
            return false;
        }

        return phoneNumber.matches(PHONE_REGEX);
    }
}


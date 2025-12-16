package com.storemanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when attempting to print an invoice that has already been
 * printed.
 * Returns HTTP 409 Conflict.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class InvoiceAlreadyPrintedException extends RuntimeException {

    public InvoiceAlreadyPrintedException(String message) {
        super(message);
    }

    public InvoiceAlreadyPrintedException(String message, Throwable cause) {
        super(message, cause);
    }
}

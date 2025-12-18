package com.storemanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class InvoiceAlreadyPrintedException extends RuntimeException {

    public InvoiceAlreadyPrintedException(String message) {
        super(message);
    }

    public InvoiceAlreadyPrintedException(String message, Throwable cause) {
        super(message, cause);
    }
}

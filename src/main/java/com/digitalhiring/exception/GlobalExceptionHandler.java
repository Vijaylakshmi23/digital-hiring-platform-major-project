
package com.digitalhiring.exception;

import com.digitalhiring.dto.ApiErrorResponse;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.digitalhiring.exception.DuplicateResourceException;
import org.springframework.dao.DataIntegrityViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger logger =
        LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getField() + ": "
                        + error.getDefaultMessage())
                .orElse("Request validation failed");

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                message,
                request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidJson(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Invalid JSON or invalid request field value",
                request);
    }

    @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleUnexpectedError(
                Exception ex,
                HttpServletRequest request) {

        logger.error(
                "Unexpected error for {} {}",
                request.getMethod(),
                request.getRequestURI(),
                ex);

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected server error occurred",
                request);
        }

    private ResponseEntity<ApiErrorResponse> buildResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI());

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiErrorResponse> handleBadRequest(
                IllegalArgumentException ex,
                HttpServletRequest request) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                request);
     }

     @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiErrorResponse> handleAccessDenied(
                AccessDeniedException ex,
                HttpServletRequest request) {

        return buildResponse(
                HttpStatus.FORBIDDEN,
                ex.getMessage(),
                request);
     }

     @ExceptionHandler(DuplicateResourceException.class)
        public ResponseEntity<ApiErrorResponse> handleDuplicateResource(
                DuplicateResourceException ex,
                HttpServletRequest request) {

        return buildResponse(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                request);
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ApiErrorResponse> handleDatabaseConflict(
                DataIntegrityViolationException ex,
                HttpServletRequest request) {

        return buildResponse(
                HttpStatus.CONFLICT,
                "Email or mobile number is already registered",
                request);
        }

        @ExceptionHandler(BookingConflictException.class)
                public ResponseEntity<ApiErrorResponse> handleBookingConflict(
                        BookingConflictException ex,
                        HttpServletRequest request) {

                return buildResponse(
                        HttpStatus.CONFLICT,
                        ex.getMessage(),
                        request);
        }
}

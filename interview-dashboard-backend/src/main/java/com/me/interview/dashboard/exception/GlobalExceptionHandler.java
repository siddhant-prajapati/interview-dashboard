package com.me.interview.dashboard.exception;


import com.me.interview.dashboard.dto.ErrorResponseDTO;
import com.me.interview.dashboard.util.CustomLogger;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final CustomLogger logger = CustomLogger.getInstance();

    // ── 404 NOT FOUND HANDLERS ──────────────────────────────────────────────

    /**
     * Handles custom ResourceNotFoundException (e.g. Entity with ID not found)
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {

        logger.warn("Resource Not Found: " + ex.getMessage() + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles JPA / Hibernate EntityNotFoundException
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleEntityNotFoundException(
            EntityNotFoundException ex, HttpServletRequest request) {

        String message = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "The requested entity was not found.";

        logger.warn("Entity Not Found: " + message + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles java.util.NoSuchElementException (e.g. empty Optional.get())
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponseDTO> handleNoSuchElementException(
            NoSuchElementException ex, HttpServletRequest request) {

        String message = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "No matching record or element was found.";

        logger.warn("No Such Element: " + message + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles Spring 6 NoResourceFoundException (missing static assets / unmapped URLs)
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNoResourceFound(
            NoResourceFoundException ex, HttpServletRequest request) {

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message("The requested resource was not found: " + request.getRequestURI())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    // ── 400 BAD REQUEST HANDLERS ────────────────────────────────────────────

    /**
     * Handles custom business logic InvalidDataException
     */
    @ExceptionHandler(InvalidDataException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidDataException(
            InvalidDataException ex, HttpServletRequest request) {

        logger.warn("Invalid Data: " + ex.getMessage() + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles Spring validation errors (@Valid on RequestDTO)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        String errorMessages = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + (err.getDefaultMessage() != null ? err.getDefaultMessage() : "invalid value"))
                .collect(Collectors.joining("; "));

        if (errorMessages.isBlank()) {
            errorMessages = "Validation failed for incoming request data.";
        }

        logger.warn("Validation failed for path [" + request.getRequestURI() + "]: " + errorMessages);

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Validation failed: " + errorMessages)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles Bean Validation ConstraintViolationException (e.g., parameter constraints)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {

        String violations = ex.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining("; "));

        String message = !violations.isBlank() ? violations : "Constraint validation failed for request parameters.";

        logger.warn("Constraint Violation: " + message + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles Spring TransactionSystemException (which often wraps a ConstraintViolationException on commit)
     */
    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<ErrorResponseDTO> handleTransactionSystemException(
            TransactionSystemException ex, HttpServletRequest request) {

        Throwable cause = ex.getRootCause();
        if (cause instanceof ConstraintViolationException cve) {
            return handleConstraintViolationException(cve, request);
        }

        String msg = cause != null && cause.getMessage() != null ? cause.getMessage() : ex.getMessage();
        logger.warn("Transaction System Exception: " + msg + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Data transaction failed: " + (msg != null ? msg : "invalid transaction state"))
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles Database constraint violations (duplicate keys, foreign key violations)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, HttpServletRequest request) {

        String rootMsg = ex.getRootCause() != null && ex.getRootCause().getMessage() != null
                ? ex.getRootCause().getMessage()
                : ex.getMessage();

        String userFriendlyMsg = "Database constraint violation.";
        if (rootMsg != null) {
            String lower = rootMsg.toLowerCase();
            if (lower.contains("duplicate") || lower.contains("unique")) {
                userFriendlyMsg = "A record with this information already exists (duplicate key).";
            } else if (lower.contains("foreign key") || lower.contains("cannot delete or update a parent row")) {
                userFriendlyMsg = "Cannot complete action because related records exist or referenced entity is missing.";
            } else if (lower.contains("cannot be null") || lower.contains("null")) {
                userFriendlyMsg = "A required database field cannot be null.";
            }
        }

        logger.warn("Data Integrity Violation: " + rootMsg + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(userFriendlyMsg)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles IllegalArgumentExceptions (e.g., passing null IDs to repository methods or bad enum values)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(
            IllegalArgumentException ex, HttpServletRequest request) {

        String message = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "Invalid argument provided.";

        logger.warn("Illegal Argument: " + message + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles IllegalStateException (e.g. invalid state transition)
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalStateException(
            IllegalStateException ex, HttpServletRequest request) {

        String message = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "Action cannot be performed in current state.";

        logger.warn("Illegal State: " + message + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles NullPointerExceptions in request processing as a 400 Bad Request
     * (missing expected payload property or entity relation) rather than crashing with 500.
     */
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ErrorResponseDTO> handleNullPointerException(
            NullPointerException ex, HttpServletRequest request) {

        String originInfo = "unknown location";
        StackTraceElement[] stackTrace = ex.getStackTrace();
        if (stackTrace != null && stackTrace.length > 0) {
            for (StackTraceElement element : stackTrace) {
                if (element.getClassName().startsWith("com.me.interview.dashboard")) {
                    originInfo = String.format("%s.%s (%s:%d)",
                            element.getClassName().substring(element.getClassName().lastIndexOf('.') + 1),
                            element.getMethodName(),
                            element.getFileName(),
                            element.getLineNumber());
                    break;
                }
            }
            if ("unknown location".equals(originInfo) && stackTrace.length > 0) {
                StackTraceElement top = stackTrace[0];
                originInfo = String.format("%s.%s (%s:%d)",
                        top.getClassName().substring(top.getClassName().lastIndexOf('.') + 1),
                        top.getMethodName(),
                        top.getFileName(),
                        top.getLineNumber());
            }
        }

        String npeMessage = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "Required property or object reference was null at " + originInfo;

        logger.warn("Null Pointer encountered during request at [" + originInfo + "]: " + npeMessage + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("A required value or property reference was missing (null). Please check request payload.")
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles missing or malformed request bodies
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponseDTO> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        logger.warn("Malformed or missing HTTP request body: [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Request body is missing, invalid, or could not be parsed.")
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles type mismatches in request parameters or path variables (e.g. passing text for Long ID)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {

        String paramName = ex.getName();
        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "valid type";
        String message = String.format("Parameter '%s' must be of type '%s'.", paramName, requiredType);

        logger.warn("Parameter Type Mismatch: " + message + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles missing required query parameters (@RequestParam)
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponseDTO> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex, HttpServletRequest request) {

        String message = String.format("Required request parameter '%s' of type '%s' is missing.",
                ex.getParameterName(), ex.getParameterType());

        logger.warn("Missing Request Parameter: " + message + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles missing path variables (@PathVariable)
     */
    @ExceptionHandler(MissingPathVariableException.class)
    public ResponseEntity<ErrorResponseDTO> handleMissingPathVariable(
            MissingPathVariableException ex, HttpServletRequest request) {

        String message = String.format("Required path variable '%s' is missing.", ex.getVariableName());

        logger.warn("Missing Path Variable: " + message + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles missing required HTTP headers (@RequestHeader)
     */
    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponseDTO> handleMissingRequestHeader(
            MissingRequestHeaderException ex, HttpServletRequest request) {

        String message = String.format("Required request header '%s' is missing.", ex.getHeaderName());

        logger.warn("Missing Header: " + message + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles Spring BindException
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponseDTO> handleBindException(
            BindException ex, HttpServletRequest request) {

        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + (err.getDefaultMessage() != null ? err.getDefaultMessage() : "invalid"))
                .collect(Collectors.joining("; "));

        logger.warn("Bind Exception on [" + request.getRequestURI() + "]: " + errors);

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Request binding failed: " + errors)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // ── HTTP PROTOCOL METHOD & MEDIA TYPE HANDLERS ──────────────────────────

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponseDTO> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {

        String message = String.format("HTTP method '%s' is not supported for this URL. Supported methods: %s",
                ex.getMethod(), ex.getSupportedHttpMethods());

        logger.warn("Method Not Allowed: " + message + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.METHOD_NOT_ALLOWED.value())
                .error(HttpStatus.METHOD_NOT_ALLOWED.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponseDTO> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {

        String message = String.format("Media type '%s' is not supported. Supported media types: %s",
                ex.getContentType(), ex.getSupportedMediaTypes());

        logger.warn("Unsupported Media Type: " + message + " [Path: " + request.getRequestURI() + "]");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE.value())
                .error(HttpStatus.UNSUPPORTED_MEDIA_TYPE.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    // ── TIMEOUT & EXTERNAL SERVICE HANDLERS ─────────────────────────────────

    @ExceptionHandler(AsyncRequestTimeoutException.class)
    public ResponseEntity<ErrorResponseDTO> handleAsyncRequestTimeoutException(
            AsyncRequestTimeoutException ex, HttpServletRequest request) {

        logger.warn("Async Request Timeout on path: " + request.getRequestURI() + ". AI processing took longer than allowed timeout.");

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error(HttpStatus.SERVICE_UNAVAILABLE.getReasonPhrase())
                .message("The AI generation request took too long to complete. Please try again.")
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(TimeoutException.class)
    public ResponseEntity<ErrorResponseDTO> handleTimeoutException(
            TimeoutException ex, HttpServletRequest request) {

        logger.warn("Processing timed out on path: " + request.getRequestURI());

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.GATEWAY_TIMEOUT.value())
                .error(HttpStatus.GATEWAY_TIMEOUT.getReasonPhrase())
                .message("Request processing timed out. Please try again.")
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.GATEWAY_TIMEOUT);
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ErrorResponseDTO> handleResourceAccessException(
            ResourceAccessException ex, HttpServletRequest request) {

        logger.warn("External service unreachable or timed out on path: " + request.getRequestURI() + " - " + ex.getMessage());

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error(HttpStatus.SERVICE_UNAVAILABLE.getReasonPhrase())
                .message("External service is temporarily unreachable or timed out. Please try again.")
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.SERVICE_UNAVAILABLE);
    }

    // ── ASYNC WRAPPER & GENERIC FALLBACK ────────────────────────────────────

    /**
     * Unwraps CompletionException and ExecutionException to reach the real cause.
     */
    private Throwable unwrapException(Throwable ex) {
        Throwable cause = ex;
        while ((cause instanceof CompletionException || cause instanceof ExecutionException) && cause.getCause() != null) {
            cause = cause.getCause();
        }
        return cause;
    }

    /**
     * Intelligent fallback: Dispatches unwrapped exceptions and detects 404/400 patterns
     * from error messages before ever falling back to 500.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGlobalException(
            Exception ex, HttpServletRequest request) {

        Throwable root = unwrapException(ex);

        // Specific sub-handlers if unwrapped from CompletionException / ExecutionException
        if (root instanceof ResourceNotFoundException rnfe) {
            return handleResourceNotFoundException(rnfe, request);
        }
        if (root instanceof EntityNotFoundException enfe) {
            return handleEntityNotFoundException(enfe, request);
        }
        if (root instanceof NoSuchElementException nsee) {
            return handleNoSuchElementException(nsee, request);
        }
        if (root instanceof InvalidDataException ide) {
            return handleInvalidDataException(ide, request);
        }
        if (root instanceof IllegalArgumentException iae) {
            return handleIllegalArgumentException(iae, request);
        }
        if (root instanceof IllegalStateException ise) {
            return handleIllegalStateException(ise, request);
        }
        if (root instanceof NullPointerException npe) {
            return handleNullPointerException(npe, request);
        }
        if (root instanceof DataIntegrityViolationException dive) {
            return handleDataIntegrityViolationException(dive, request);
        }
        if (root instanceof AsyncRequestTimeoutException arte) {
            return handleAsyncRequestTimeoutException(arte, request);
        }
        if (root instanceof TimeoutException te) {
            return handleTimeoutException(te, request);
        }
        if (root instanceof ResourceAccessException rae) {
            return handleResourceAccessException(rae, request);
        }

        String safeMessage = root.getMessage() != null && !root.getMessage().isBlank()
                ? root.getMessage()
                : root.getClass().getSimpleName();

        String lowerMsg = safeMessage.toLowerCase();

        // 1. Detect 404 NOT FOUND from message
        if (lowerMsg.contains("not found") || lowerMsg.contains("does not exist")
                || lowerMsg.contains("could not find") || lowerMsg.contains("no such")) {
            logger.warn("Not Found (inferred): " + safeMessage + " [Path: " + request.getRequestURI() + "]");
            ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                    .timestamp(LocalDateTime.now())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                    .message(safeMessage)
                    .path(request.getRequestURI())
                    .build();
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }

        // 2. Detect 400 BAD REQUEST from message
        if (lowerMsg.contains("required") || lowerMsg.contains("invalid") || lowerMsg.contains("cannot be null")
                || lowerMsg.contains("must not be null") || lowerMsg.contains("duplicate") || lowerMsg.contains("already exists")
                || lowerMsg.contains("already taken") || lowerMsg.contains("bad request") || lowerMsg.contains("missing")
                || lowerMsg.contains("validation failed")) {
            logger.warn("Bad Request (inferred): " + safeMessage + " [Path: " + request.getRequestURI() + "]");
            ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                    .timestamp(LocalDateTime.now())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                    .message(safeMessage)
                    .path(request.getRequestURI())
                    .build();
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        // 3. True unexpected 500 internal server error
        logger.error("Unexpected Error Occurred (" + root.getClass().getSimpleName() + "): " + safeMessage);
        root.printStackTrace();

        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An unexpected error occurred. Please try again later.")
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
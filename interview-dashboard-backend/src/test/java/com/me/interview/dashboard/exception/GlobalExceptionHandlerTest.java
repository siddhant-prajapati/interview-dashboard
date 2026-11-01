package com.me.interview.dashboard.exception;

import com.me.interview.dashboard.dto.ErrorResponseDTO;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.RollbackException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/test");
    }

    // ── 404 NOT FOUND TESTS ─────────────────────────────────────────────────

    @Test
    @DisplayName("ResourceNotFoundException should return 404 NOT_FOUND")
    void testResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("User", "id", 99L);
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleResourceNotFoundException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(404);
        assertThat(response.getBody().getError()).isEqualTo("Not Found");
        assertThat(response.getBody().getMessage()).contains("User not found with id : '99'");
        assertThat(response.getBody().getPath()).isEqualTo("/api/test");
    }

    @Test
    @DisplayName("EntityNotFoundException should return 404 NOT_FOUND")
    void testEntityNotFoundException() {
        EntityNotFoundException ex = new EntityNotFoundException("Entity not found in database");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleEntityNotFoundException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(404);
        assertThat(response.getBody().getMessage()).isEqualTo("Entity not found in database");
    }

    @Test
    @DisplayName("NoSuchElementException should return 404 NOT_FOUND")
    void testNoSuchElementException() {
        NoSuchElementException ex = new NoSuchElementException("Element does not exist");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleNoSuchElementException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(404);
        assertThat(response.getBody().getMessage()).isEqualTo("Element does not exist");
    }

    @Test
    @DisplayName("NoResourceFoundException should return 404 NOT_FOUND")
    void testNoResourceFoundException() {
        NoResourceFoundException ex = new NoResourceFoundException(HttpMethod.GET, "/api/nonexistent", "The requested resource was not found");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleNoResourceFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(404);
        assertThat(response.getBody().getMessage()).contains("The requested resource was not found");
    }

    // ── 400 BAD REQUEST TESTS ───────────────────────────────────────────────

    @Test
    @DisplayName("InvalidDataException should return 400 BAD_REQUEST")
    void testInvalidDataException() {
        InvalidDataException ex = new InvalidDataException("Invalid status provided");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleInvalidDataException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).isEqualTo("Invalid status provided");
    }

    @Test
    @DisplayName("MethodArgumentNotValidException should return 400 BAD_REQUEST with field details")
    void testMethodArgumentNotValidException() {
        BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "jobApplication");
        bindingResult.addError(new FieldError("jobApplication", "role", "role cannot be blank"));
        bindingResult.addError(new FieldError("jobApplication", "companyName", "company is required"));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleValidationExceptions(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("role: role cannot be blank");
        assertThat(response.getBody().getMessage()).contains("companyName: company is required");
    }

    @Test
    @DisplayName("ConstraintViolationException should return 400 BAD_REQUEST")
    void testConstraintViolationException() {
        ConstraintViolation<?> violation = Mockito.mock(ConstraintViolation.class);
        when(violation.getMessage()).thenReturn("Must be a positive number");

        ConstraintViolationException ex = new ConstraintViolationException("Validation failed", Set.of(violation));
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleConstraintViolationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("Must be a positive number");
    }

    @Test
    @DisplayName("TransactionSystemException wrapping ConstraintViolationException should return 400 BAD_REQUEST")
    void testTransactionSystemExceptionWithConstraintViolation() {
        ConstraintViolation<?> violation = Mockito.mock(ConstraintViolation.class);
        when(violation.getMessage()).thenReturn("Field length cannot exceed 50 characters");

        RollbackException rollbackEx = new RollbackException("Rollback", new ConstraintViolationException(Set.of(violation)));
        TransactionSystemException ex = new TransactionSystemException("Commit failed", rollbackEx);

        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleTransactionSystemException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("Field length cannot exceed 50 characters");
    }

    @Test
    @DisplayName("TransactionSystemException without ConstraintViolation should return 400 BAD_REQUEST")
    void testTransactionSystemExceptionGeneric() {
        TransactionSystemException ex = new TransactionSystemException("Database transaction aborted");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleTransactionSystemException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("Data transaction failed");
    }

    @Test
    @DisplayName("DataIntegrityViolationException for duplicate key should return 400 BAD_REQUEST")
    void testDataIntegrityViolationExceptionDuplicate() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "Duplicate entry 'test_user' for key 'UK_username'",
                new RuntimeException("Duplicate entry 'test_user' for key 'UK_username'")
        );
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleDataIntegrityViolationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("already exists (duplicate key)");
    }

    @Test
    @DisplayName("DataIntegrityViolationException for foreign key should return 400 BAD_REQUEST")
    void testDataIntegrityViolationExceptionForeignKey() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "Cannot delete or update a parent row: a foreign key constraint fails",
                new RuntimeException("Cannot delete or update a parent row: a foreign key constraint fails")
        );
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleDataIntegrityViolationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("related records exist or referenced entity is missing");
    }

    @Test
    @DisplayName("IllegalArgumentException should return 400 BAD_REQUEST")
    void testIllegalArgumentException() {
        IllegalArgumentException ex = new IllegalArgumentException("The given id must not be null");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleIllegalArgumentException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).isEqualTo("The given id must not be null");
    }

    @Test
    @DisplayName("IllegalStateException should return 400 BAD_REQUEST")
    void testIllegalStateException() {
        IllegalStateException ex = new IllegalStateException("Application cannot transition from OFFER to APPLIED");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleIllegalStateException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("Application cannot transition");
    }

    @Test
    @DisplayName("NullPointerException should return 400 BAD_REQUEST instead of 500")
    void testNullPointerException() {
        NullPointerException ex = new NullPointerException("role cannot be null");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleNullPointerException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("missing (null)");
    }

    @Test
    @DisplayName("HttpMessageNotReadableException should return 400 BAD_REQUEST")
    void testHttpMessageNotReadableException() {
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException("Required request body is missing", (org.springframework.http.HttpInputMessage) null);
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleHttpMessageNotReadableException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("Request body is missing");
    }

    @Test
    @DisplayName("MethodArgumentTypeMismatchException should return 400 BAD_REQUEST")
    void testMethodArgumentTypeMismatchException() {
        MethodArgumentTypeMismatchException ex = new MethodArgumentTypeMismatchException("abc", Long.class, "id", null, null);
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleMethodArgumentTypeMismatch(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("Parameter 'id' must be of type 'Long'");
    }

    @Test
    @DisplayName("MissingServletRequestParameterException should return 400 BAD_REQUEST")
    void testMissingServletRequestParameterException() {
        MissingServletRequestParameterException ex = new MissingServletRequestParameterException("userId", "Long");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleMissingServletRequestParameter(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("Required request parameter 'userId' of type 'Long' is missing");
    }

    @Test
    @DisplayName("MissingPathVariableException should return 400 BAD_REQUEST")
    void testMissingPathVariableException() throws NoSuchMethodException {
        MethodParameter parameter = new MethodParameter(GlobalExceptionHandlerTest.class.getDeclaredMethod("setUp"), -1);
        MissingPathVariableException ex = new MissingPathVariableException("id", parameter);
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleMissingPathVariable(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("Required path variable 'id' is missing");
    }

    @Test
    @DisplayName("MissingRequestHeaderException should return 400 BAD_REQUEST")
    void testMissingRequestHeaderException() throws NoSuchMethodException {
        MethodParameter parameter = new MethodParameter(GlobalExceptionHandlerTest.class.getDeclaredMethod("setUp"), -1);
        MissingRequestHeaderException ex = new MissingRequestHeaderException("X-User-Id", parameter);
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleMissingRequestHeader(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("Required request header 'X-User-Id' is missing");
    }

    @Test
    @DisplayName("BindException should return 400 BAD_REQUEST")
    void testBindException() {
        BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "filter");
        bindingResult.addError(new FieldError("filter", "page", "must be greater than or equal to 0"));

        BindException ex = new BindException(bindingResult);
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleBindException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("page: must be greater than or equal to 0");
    }

    // ── 405 & 415 PROTOCOL TESTS ────────────────────────────────────────────

    @Test
    @DisplayName("HttpRequestMethodNotSupportedException should return 405 METHOD_NOT_ALLOWED")
    void testMethodNotSupported() {
        HttpRequestMethodNotSupportedException ex = new HttpRequestMethodNotSupportedException("DELETE", List.of("GET", "POST"));
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleMethodNotSupported(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(405);
        assertThat(response.getBody().getMessage()).contains("HTTP method 'DELETE' is not supported");
    }

    @Test
    @DisplayName("HttpMediaTypeNotSupportedException should return 415 UNSUPPORTED_MEDIA_TYPE")
    void testMediaTypeNotSupported() {
        HttpMediaTypeNotSupportedException ex = new HttpMediaTypeNotSupportedException(
                MediaType.APPLICATION_XML, List.of(MediaType.APPLICATION_JSON)
        );
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleMediaTypeNotSupported(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(415);
        assertThat(response.getBody().getMessage()).contains("Media type 'application/xml' is not supported");
    }

    // ── 503 & 504 TIMEOUT & GATEWAY TESTS ───────────────────────────────────

    @Test
    @DisplayName("AsyncRequestTimeoutException should return 503 SERVICE_UNAVAILABLE")
    void testAsyncRequestTimeoutException() {
        AsyncRequestTimeoutException ex = new AsyncRequestTimeoutException();
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleAsyncRequestTimeoutException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(503);
        assertThat(response.getBody().getMessage()).contains("took too long to complete");
    }

    @Test
    @DisplayName("TimeoutException should return 504 GATEWAY_TIMEOUT")
    void testTimeoutException() {
        TimeoutException ex = new TimeoutException("OpenRouter model generation timed out");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleTimeoutException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.GATEWAY_TIMEOUT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(504);
        assertThat(response.getBody().getMessage()).contains("Request processing timed out");
    }

    @Test
    @DisplayName("ResourceAccessException should return 503 SERVICE_UNAVAILABLE")
    void testResourceAccessException() {
        ResourceAccessException ex = new ResourceAccessException("Connection timed out to openrouter.ai");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleResourceAccessException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(503);
        assertThat(response.getBody().getMessage()).contains("External service is temporarily unreachable or timed out");
    }

    // ── ASYNC UNWRAPPING & INFERRED STATUS TESTS ─────────────────────────────

    @Test
    @DisplayName("CompletionException wrapping ResourceNotFoundException should unwrap and return 404")
    void testCompletionExceptionUnwrapping404() {
        CompletionException ex = new CompletionException(new ResourceNotFoundException("JobApplication", "id", 123L));
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleGlobalException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(404);
        assertThat(response.getBody().getMessage()).contains("JobApplication not found with id : '123'");
    }

    @Test
    @DisplayName("CompletionException wrapping InvalidDataException should unwrap and return 400")
    void testCompletionExceptionUnwrapping400() {
        CompletionException ex = new CompletionException(new InvalidDataException("Invalid parameters for AI parsing"));
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleGlobalException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).isEqualTo("Invalid parameters for AI parsing");
    }

    @Test
    @DisplayName("ExecutionException wrapping IllegalArgumentException should unwrap and return 400")
    void testExecutionExceptionUnwrapping() {
        ExecutionException ex = new ExecutionException(new IllegalArgumentException("Candidate name cannot be empty"));
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleGlobalException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).isEqualTo("Candidate name cannot be empty");
    }

    @Test
    @DisplayName("Generic Exception with 'not found' in message should return 404")
    void testGenericExceptionNotFound() {
        RuntimeException ex = new RuntimeException("Company with name Acme does not exist");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleGlobalException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(404);
    }

    @Test
    @DisplayName("Generic Exception with 'required' in message should return 400")
    void testGenericExceptionRequiredField() {
        RuntimeException ex = new RuntimeException("Role is required for job application");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleGlobalException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
    }

    @Test
    @DisplayName("Unrelated unexpected exception should return 500")
    void testUnexpectedInternalError() {
        RuntimeException ex = new RuntimeException("Fatal database hardware crash");
        ResponseEntity<ErrorResponseDTO> response = exceptionHandler.handleGlobalException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(500);
        assertThat(response.getBody().getMessage()).contains("An unexpected error occurred");
    }
}

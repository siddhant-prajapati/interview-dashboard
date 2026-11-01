package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.SendEmailRequestDTO;
import com.me.interview.dashboard.dto.SendEmailResponseDTO;
import com.me.interview.dashboard.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/email", "/api/emails"})
@RequiredArgsConstructor
@Tag(name = "Email Management", description = "APIs for sending recruiter outreach and job application emails")
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send")
    @Operation(summary = "Send an email to HR or Careers", description = "Dispatches a job application or outreach email to the recruiter/careers email address.")
    public ResponseEntity<SendEmailResponseDTO> sendEmail(@RequestBody SendEmailRequestDTO request) {
        SendEmailResponseDTO response = emailService.sendEmail(request);
        return ResponseEntity.ok(response);
    }
}

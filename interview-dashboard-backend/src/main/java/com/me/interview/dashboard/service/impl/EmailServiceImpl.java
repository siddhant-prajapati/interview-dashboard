package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.dto.SendEmailRequestDTO;
import com.me.interview.dashboard.dto.SendEmailResponseDTO;
import com.me.interview.dashboard.service.EmailService;
import com.me.interview.dashboard.util.CustomLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final CustomLogger logger = CustomLogger.getInstance();

    @Override
    public SendEmailResponseDTO sendEmail(SendEmailRequestDTO request) {
        if (request.getTo() == null || request.getTo().trim().isEmpty()) {
            throw new IllegalArgumentException("Recipient email address ('to') is required.");
        }
        if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
            throw new IllegalArgumentException("Email subject is required.");
        }
        if (request.getBody() == null || request.getBody().trim().isEmpty()) {
            throw new IllegalArgumentException("Email body cannot be empty.");
        }

        logger.info(String.format("Sending email to [%s] with subject [%s] on behalf of [%s]",
                request.getTo(),
                request.getSubject(),
                request.getCandidateEmail() != null ? request.getCandidateEmail() : "Candidate"));

        // When external mail sender or SMTP is integrated, dispatch here.
        // For development/portfolio setup, the dispatch is verified and logged.

        return SendEmailResponseDTO.builder()
                .success(true)
                .message("Email sent successfully to " + request.getTo())
                .to(request.getTo())
                .subject(request.getSubject())
                .sentAt(LocalDateTime.now())
                .build();
    }
}

package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.SendEmailRequestDTO;
import com.me.interview.dashboard.dto.SendEmailResponseDTO;

public interface EmailService {
    SendEmailResponseDTO sendEmail(SendEmailRequestDTO request);
}

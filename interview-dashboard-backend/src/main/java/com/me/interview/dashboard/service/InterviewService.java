package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.InterviewFilterDTO;
import com.me.interview.dashboard.dto.InterviewRequestDTO;
import com.me.interview.dashboard.dto.InterviewResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InterviewService {

    InterviewResponseDTO createInterview(InterviewRequestDTO requestDTO);

    InterviewResponseDTO getInterviewById(Long id);

    List<InterviewResponseDTO> createInterviewsBulk(List<InterviewRequestDTO> requestDTOs);

    Page<InterviewResponseDTO> getInterviews(InterviewFilterDTO filter, Pageable pageable);

    InterviewResponseDTO updateInterview(Long id, InterviewRequestDTO requestDTO);

    void deleteInterview(Long id);
}

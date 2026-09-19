package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.JobApplicationCompositeRequestDTO;
import com.me.interview.dashboard.dto.JobApplicationFilterDTO;
import com.me.interview.dashboard.dto.JobApplicationRequestDTO;
import com.me.interview.dashboard.dto.JobApplicationResponseDTO;
import com.me.interview.dashboard.model.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;


public interface JobApplicationService {

    JobApplicationResponseDTO createJobApplication(JobApplicationRequestDTO requestDTO);

    JobApplicationResponseDTO getJobApplicationById(Long id);

    Page<JobApplicationResponseDTO> getJobApplications(JobApplicationFilterDTO filter, Pageable pageable);

    JobApplicationResponseDTO createCompositeJobApplication(JobApplicationCompositeRequestDTO requestDTO);

    JobApplicationResponseDTO updateJobApplication(Long id, JobApplicationRequestDTO requestDTO);

    void deleteJobApplication(Long id);
}
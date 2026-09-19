package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.ResumeFilterDTO;
import com.me.interview.dashboard.dto.ResumeRequestDTO;
import com.me.interview.dashboard.dto.ResumeResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ResumeService {

    ResumeResponseDTO createResume(ResumeRequestDTO requestDTO);

    ResumeResponseDTO getResumeById(Long id);

    Page<ResumeResponseDTO> getResumes(ResumeFilterDTO filter, Pageable pageable);

    ResumeResponseDTO updateResume(Long id, ResumeRequestDTO requestDTO);

    void deleteResume(Long id);
}

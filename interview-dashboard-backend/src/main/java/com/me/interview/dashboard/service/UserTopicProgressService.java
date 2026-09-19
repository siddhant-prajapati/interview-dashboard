package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.UserTopicProgressFilterDTO;
import com.me.interview.dashboard.dto.UserTopicProgressRequestDTO;
import com.me.interview.dashboard.dto.UserTopicProgressResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserTopicProgressService {
    UserTopicProgressResponseDTO createProgress(UserTopicProgressRequestDTO requestDTO);
    UserTopicProgressResponseDTO getProgressById(Long id);
    Page<UserTopicProgressResponseDTO> getAllProgress(UserTopicProgressFilterDTO filter, Pageable pageable);
    UserTopicProgressResponseDTO updateProgress(Long id, UserTopicProgressRequestDTO requestDTO);
    void deleteProgress(Long id);
}
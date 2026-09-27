package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.PreparationTopicFilterDTO;
import com.me.interview.dashboard.dto.PreparationTopicRequestDTO;
import com.me.interview.dashboard.dto.PreparationTopicResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PreparationTopicService {
    PreparationTopicResponseDTO createTopic(PreparationTopicRequestDTO requestDTO);
    PreparationTopicResponseDTO getTopicById(Long id);
    List<PreparationTopicResponseDTO> createTopicsBulk(List<PreparationTopicRequestDTO> requestDTOs);
    Page<PreparationTopicResponseDTO> getTopics(PreparationTopicFilterDTO filter, Pageable pageable);
    PreparationTopicResponseDTO updateTopic(Long id, PreparationTopicRequestDTO requestDTO);
    void deleteTopic(Long id);
}
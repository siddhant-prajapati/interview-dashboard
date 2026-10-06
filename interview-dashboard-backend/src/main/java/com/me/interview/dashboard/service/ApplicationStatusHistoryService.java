package com.me.interview.dashboard.service;


import com.me.interview.dashboard.dto.ApplicationStatusHistoryFilterDTO;
import com.me.interview.dashboard.dto.ApplicationStatusHistoryRequestDTO;
import com.me.interview.dashboard.dto.ApplicationStatusHistoryResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ApplicationStatusHistoryService {

    ApplicationStatusHistoryResponseDTO createApplicationStatusHistory(ApplicationStatusHistoryRequestDTO requestDTO);

    List<ApplicationStatusHistoryResponseDTO> createApplicationStatusHistoriesBulk(List<ApplicationStatusHistoryRequestDTO> requestDTOs);

    ApplicationStatusHistoryResponseDTO getApplicationStatusHistoryById(Long id);

    Page<ApplicationStatusHistoryResponseDTO> getApplicationStatusHistories(ApplicationStatusHistoryFilterDTO filter, Pageable pageable);

    ApplicationStatusHistoryResponseDTO updateApplicationStatusHistory(Long id, ApplicationStatusHistoryRequestDTO requestDTO);

    void deleteApplicationStatusHistory(Long id);
}

package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.PlatformFilterDTO;
import com.me.interview.dashboard.dto.PlatformRequestDTO;
import com.me.interview.dashboard.dto.PlatformResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PlatformService {

    PlatformResponseDTO createPlatform(PlatformRequestDTO requestDTO);

    List<PlatformResponseDTO> createPlatformsBulk(List<PlatformRequestDTO> requestDTOs);

    PlatformResponseDTO getPlatformById(Long id);

    Page<PlatformResponseDTO> getPlatforms(PlatformFilterDTO filter, Pageable pageable);

    List<PlatformResponseDTO> getPlatformsByUserId(Long userId);

    PlatformResponseDTO updatePlatform(Long id, PlatformRequestDTO requestDTO);

    void deletePlatform(Long id);
}

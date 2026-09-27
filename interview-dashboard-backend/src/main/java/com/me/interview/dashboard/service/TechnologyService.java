package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.TechnologyFilterDTO;
import com.me.interview.dashboard.dto.TechnologyRequestDTO;
import com.me.interview.dashboard.dto.TechnologyResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TechnologyService {

    TechnologyResponseDTO createTechnology(TechnologyRequestDTO requestDTO);

    List<TechnologyResponseDTO> createTechnologiesBulk(List<TechnologyRequestDTO> requestDTOs);

    TechnologyResponseDTO getTechnologyById(Long id);

    Page<TechnologyResponseDTO> getTechnologies(TechnologyFilterDTO filter, Pageable pageable);

    TechnologyResponseDTO updateTechnology(Long id, TechnologyRequestDTO requestDTO);

    void deleteTechnology(Long id);
}

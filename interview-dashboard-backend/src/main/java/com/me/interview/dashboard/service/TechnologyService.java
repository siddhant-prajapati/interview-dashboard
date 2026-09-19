package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.TechnologyFilterDTO;
import com.me.interview.dashboard.dto.TechnologyRequestDTO;
import com.me.interview.dashboard.dto.TechnologyResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TechnologyService {

    TechnologyResponseDTO createTechnology(TechnologyRequestDTO requestDTO);

    TechnologyResponseDTO getTechnologyById(Long id);

    Page<TechnologyResponseDTO> getTechnologies(TechnologyFilterDTO filter, Pageable pageable);

    TechnologyResponseDTO updateTechnology(Long id, TechnologyRequestDTO requestDTO);

    void deleteTechnology(Long id);
}

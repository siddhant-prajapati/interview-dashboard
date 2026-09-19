package com.me.interview.dashboard.service.impl;


import com.me.interview.dashboard.dto.TechnologyFilterDTO;
import com.me.interview.dashboard.dto.TechnologyRequestDTO;
import com.me.interview.dashboard.dto.TechnologyResponseDTO;
import com.me.interview.dashboard.model.Technology;
import com.me.interview.dashboard.mapper.TechnologyMapper;
import com.me.interview.dashboard.repository.TechnologyRepository;
import com.me.interview.dashboard.service.TechnologyService;
import com.me.interview.dashboard.specification.TechnologySpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TechnologyServiceImpl implements TechnologyService {

    private final TechnologyRepository technologyRepository;
    private final TechnologyMapper technologyMapper;

    @Override
    @Transactional
    public TechnologyResponseDTO createTechnology(TechnologyRequestDTO requestDTO) {
        Technology technology = technologyMapper.toEntity(requestDTO);
        Technology savedTechnology = technologyRepository.save(technology);
        return technologyMapper.toDto(savedTechnology);
    }

    @Override
    @Transactional(readOnly = true)
    public TechnologyResponseDTO getTechnologyById(Long id) {
        Technology technology = technologyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Technology not found with id: " + id));
        return technologyMapper.toDto(technology);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TechnologyResponseDTO> getTechnologies(TechnologyFilterDTO filter, Pageable pageable) {
        Specification<Technology> spec = TechnologySpecifications.buildSpecification(filter);
        return technologyRepository.findAll(spec, pageable)
                .map(technologyMapper::toDto);
    }

    @Override
    @Transactional
    public TechnologyResponseDTO updateTechnology(Long id, TechnologyRequestDTO requestDTO) {
        Technology existingTechnology = technologyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Technology not found with id: " + id));

        technologyMapper.updateEntityFromDto(requestDTO, existingTechnology);

        Technology updatedTechnology = technologyRepository.save(existingTechnology);
        return technologyMapper.toDto(updatedTechnology);
    }

    @Override
    @Transactional
    public void deleteTechnology(Long id) {
        if (!technologyRepository.existsById(id)) {
            throw new RuntimeException("Technology not found with id: " + id);
        }
        technologyRepository.deleteById(id);
    }
}
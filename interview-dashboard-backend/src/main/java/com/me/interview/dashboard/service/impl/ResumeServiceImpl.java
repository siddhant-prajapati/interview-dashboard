package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.dto.ResumeFilterDTO;
import com.me.interview.dashboard.dto.ResumeRequestDTO;
import com.me.interview.dashboard.dto.ResumeResponseDTO;
import com.me.interview.dashboard.model.Resume;
import com.me.interview.dashboard.mapper.ResumeMapper;
import com.me.interview.dashboard.repository.ResumeRepository;
import com.me.interview.dashboard.service.ResumeService;
import com.me.interview.dashboard.specification.ResumeSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    @Override
    @Transactional
    public ResumeResponseDTO createResume(ResumeRequestDTO requestDTO) {
        Resume resume = resumeMapper.toEntity(requestDTO);

        // Assuming you manually set created/updated timestamps if not using @PrePersist / @EntityListeners
        resume.setCreatedAt(LocalDateTime.now());
        resume.setUpdatedOn(LocalDateTime.now());

        Resume savedResume = resumeRepository.save(resume);
        return resumeMapper.toDto(savedResume);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeResponseDTO getResumeById(Long id) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + id));
        return resumeMapper.toDto(resume);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResumeResponseDTO> getResumes(ResumeFilterDTO filter, Pageable pageable) {
        Specification<Resume> spec = ResumeSpecifications.buildSpecification(filter);
        return resumeRepository.findAll(spec, pageable)
                .map(resumeMapper::toDto);
    }

    @Override
    @Transactional
    public ResumeResponseDTO updateResume(Long id, ResumeRequestDTO requestDTO) {
        Resume existingResume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + id));

        resumeMapper.updateEntityFromDto(requestDTO, existingResume);

        existingResume.setUpdatedOn(LocalDateTime.now());

        Resume updatedResume = resumeRepository.save(existingResume);
        return resumeMapper.toDto(updatedResume);
    }

    @Override
    @Transactional
    public void deleteResume(Long id) {
        if (!resumeRepository.existsById(id)) {
            throw new RuntimeException("Resume not found with id: " + id);
        }
        resumeRepository.deleteById(id);
    }
}

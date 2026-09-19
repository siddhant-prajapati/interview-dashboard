package com.me.interview.dashboard.service.impl;


import com.me.interview.dashboard.dto.ApplicationStatusHistoryFilterDTO;
import com.me.interview.dashboard.dto.ApplicationStatusHistoryRequestDTO;
import com.me.interview.dashboard.dto.ApplicationStatusHistoryResponseDTO;
import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.mapper.ApplicationStatusHistoryMapper;
import com.me.interview.dashboard.specification.ApplicationStatusHistorySpecifications;
import com.me.interview.dashboard.model.ApplicationStatusHistory;
import com.me.interview.dashboard.model.JobApplication;
import com.me.interview.dashboard.repository.ApplicationStatusHistoryRepository;
import com.me.interview.dashboard.repository.JobApplicationRepository;
import com.me.interview.dashboard.service.ApplicationStatusHistoryService;
import com.me.interview.dashboard.util.CustomLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationStatusHistoryServiceImpl implements ApplicationStatusHistoryService {

    private final ApplicationStatusHistoryRepository applicationStatusHistoryRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ApplicationStatusHistoryMapper applicationStatusHistoryMapper;

    // Fetch the Singleton Logger instance
    private final CustomLogger logger = CustomLogger.getInstance();

    @Override
    @Transactional
    public ApplicationStatusHistoryResponseDTO createApplicationStatusHistory(ApplicationStatusHistoryRequestDTO requestDTO) {
        logger.info("Attempting to create a new Status History record.");

        try {
            ApplicationStatusHistory history = applicationStatusHistoryMapper.toEntity(requestDTO);
            resolveRelationships(history, requestDTO);

            ApplicationStatusHistory savedHistory = applicationStatusHistoryRepository.save(history);

            logger.info("Successfully created Status History with ID: " + savedHistory.getId());
            return applicationStatusHistoryMapper.toDto(savedHistory);
        } catch (Exception e) {
            logger.error("Failed to create Status History: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationStatusHistoryResponseDTO getApplicationStatusHistoryById(Long id) {
        logger.info("Fetching Status History with ID: " + id);

        ApplicationStatusHistory history = applicationStatusHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ApplicationStatusHistory", "id", id));

        return applicationStatusHistoryMapper.toDto(history);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationStatusHistoryResponseDTO> getApplicationStatusHistories(ApplicationStatusHistoryFilterDTO filter, Pageable pageable) {
        logger.info("Fetching paginated list of Status Histories with filters applied.");

        Specification<ApplicationStatusHistory> spec = ApplicationStatusHistorySpecifications.buildSpecification(filter);
        return applicationStatusHistoryRepository.findAll(spec, pageable)
                .map(applicationStatusHistoryMapper::toDto);
    }

    @Override
    @Transactional
    public ApplicationStatusHistoryResponseDTO updateApplicationStatusHistory(Long id, ApplicationStatusHistoryRequestDTO requestDTO) {
        logger.info("Attempting to update Status History with ID: " + id);

        ApplicationStatusHistory existingHistory = applicationStatusHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ApplicationStatusHistory", "id", id));

        try {
            applicationStatusHistoryMapper.updateEntityFromDto(requestDTO, existingHistory);
            resolveRelationships(existingHistory, requestDTO);

            ApplicationStatusHistory updatedHistory = applicationStatusHistoryRepository.save(existingHistory);

            logger.info("Successfully updated Status History with ID: " + id);
            return applicationStatusHistoryMapper.toDto(updatedHistory);
        } catch (Exception e) {
            logger.error("Failed to update Status History with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteApplicationStatusHistory(Long id) {
        logger.info("Attempting to delete Status History with ID: " + id);

        if (!applicationStatusHistoryRepository.existsById(id)) {
            logger.warn("Deletion failed: Status History not found with ID: " + id);
            throw new ResourceNotFoundException("ApplicationStatusHistory", "id", id);
        }

        try {
            applicationStatusHistoryRepository.deleteById(id);
            logger.info("Successfully deleted Status History with ID: " + id);
        } catch (Exception e) {
            logger.error("Failed to delete Status History with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    private void resolveRelationships(ApplicationStatusHistory entity, ApplicationStatusHistoryRequestDTO dto) {
        if (dto.getJobApplicationId() != null) {
            JobApplication jobApplication = jobApplicationRepository.findById(dto.getJobApplicationId())
                    .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", dto.getJobApplicationId()));
            entity.setJobApplication(jobApplication);
        } else {
            entity.setJobApplication(null); // Or you could throw InvalidDataException if it's strictly required
        }
    }
}

package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.dto.*;
import com.me.interview.dashboard.model.*;
import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.mapper.JobApplicationMapper;
import com.me.interview.dashboard.repository.*;
import com.me.interview.dashboard.service.JobApplicationService;
import com.me.interview.dashboard.specification.JobApplicationSpecifications;
import com.me.interview.dashboard.util.CustomLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final CompanyRepository companyRepository;
    private final ResumeRepository resumeRepository;
    private final TechnologyRepository technologyRepository;
    private final JobApplicationMapper jobApplicationMapper;
    private final ApplicationStatusHistoryRepository applicationStatusHistoryRepository;

    // Fetch the Singleton Logger instance
    private final CustomLogger logger = CustomLogger.getInstance();

    @Override
    @Transactional
    public JobApplicationResponseDTO createJobApplication(JobApplicationRequestDTO requestDTO) {
        logger.info("Attempting to create a new Job Application for role: " + requestDTO.getRole());

        try {
            JobApplication jobApplication = jobApplicationMapper.toEntity(requestDTO);
            resolveRelationships(jobApplication, requestDTO);

            JobApplication savedApplication = jobApplicationRepository.save(jobApplication);

            logger.info("Successfully created Job Application with ID: " + savedApplication.getId());
            return jobApplicationMapper.toDto(savedApplication);
        } catch (Exception e) {
            logger.error("Failed to create Job Application: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationResponseDTO getJobApplicationById(Long id) {
        logger.info("Fetching Job Application with ID: " + id);

        JobApplication jobApplication = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));

        return jobApplicationMapper.toDto(jobApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationResponseDTO> getJobApplications(JobApplicationFilterDTO filter, Pageable pageable) {
        logger.info("Fetching paginated list of Job Applications with filters applied.");

        Specification<JobApplication> spec = JobApplicationSpecifications.buildSpecification(filter);
        return jobApplicationRepository.findAll(spec, pageable)
                .map(jobApplicationMapper::toDto);
    }

    @Override
    @Transactional
    public JobApplicationResponseDTO updateJobApplication(Long id, JobApplicationRequestDTO requestDTO) {
        logger.info("Attempting to update Job Application with ID: " + id);

        JobApplication existingApplication = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));

        try {
            // Update basic fields
            jobApplicationMapper.updateEntityFromDto(requestDTO, existingApplication);

            // Update relationships
            resolveRelationships(existingApplication, requestDTO);

            JobApplication updatedApplication = jobApplicationRepository.save(existingApplication);

            logger.info("Successfully updated Job Application with ID: " + id);
            return jobApplicationMapper.toDto(updatedApplication);
        } catch (Exception e) {
            logger.error("Failed to update Job Application with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional // The transaction ensures both deletes succeed or both fail (rollback)
    public void deleteJobApplication(Long id) {
        logger.info("Attempting to delete Job Application with ID: " + id);

        if (!jobApplicationRepository.existsById(id)) {
            logger.warn("Deletion failed: Job Application not found with ID: " + id);
            throw new ResourceNotFoundException("JobApplication", "id", id);
        }

        try {
            // 1. EXPLICIT SERVICE-LEVEL CASCADE DELETE
            // First, delete all child history records so we don't violate Foreign Key constraints
            applicationStatusHistoryRepository.deleteByJobApplicationId(id);
            logger.info("Successfully deleted all Application Status Histories for Job Application ID: " + id);

            // 2. DELETE THE PARENT
            // Now it is safe to delete the Job Application itself.
            // The Company remains completely untouched.
            jobApplicationRepository.deleteById(id);
            logger.info("Successfully deleted Job Application with ID: " + id);

        } catch (Exception e) {
            logger.error("Failed to delete Job Application with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    /**
     * Helper method to map IDs from the RequestDTO to actual Entity references.
     */
    private void resolveRelationships(JobApplication entity, JobApplicationRequestDTO dto) {
        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company", "id", dto.getCompanyId()));
            entity.setCompany(company);
        }

        if (dto.getResumeId() != null) {
            Resume resume = resumeRepository.findById(dto.getResumeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", dto.getResumeId()));
            entity.setResume(resume);
        } else {
            entity.setResume(null);
        }

        if (dto.getTechnologyIds() != null && !dto.getTechnologyIds().isEmpty()) {
            List<Technology> technologies = technologyRepository.findAllById(dto.getTechnologyIds());
            // Optionally, you could check if all IDs were found:
            // if (technologies.size() != dto.getTechnologyIds().size()) { throw new ResourceNotFoundException(...) }
            entity.setTechnologies(technologies);
        } else {
            entity.getTechnologies().clear();
        }
    }

    @Override
    @Transactional
    public JobApplicationResponseDTO createCompositeJobApplication(JobApplicationCompositeRequestDTO dto) {
        logger.info("Processing composite Job Application creation for role: " + dto.getRole());

        // 1. Resolve or Create Company
        Company company = resolveCompany(dto.getCompany());

        // 2. Resolve or Create Resume
        Resume resume = resolveResume(dto.getResume());

        // 3. Resolve or Create Technologies
        List<Technology> technologies = resolveTechnologies(dto.getTechnologys());

        // 4. Build and persist JobApplication
        JobApplication jobApplication = JobApplication.builder()
                .platform(dto.getPlatform())
                .postingDate(dto.getPostingDate())
                .about(dto.getAbout())
                .role(dto.getRole())
                .experience(dto.getExperience())
                .expectedSalary(dto.getExpectedSalary())
                .jobType(dto.getJobType())
                .applyDate(dto.getApplyDate())
                .status(dto.getStatus())
                .followUpCount(dto.getFollowUpCount() != null ? dto.getFollowUpCount() : 0)
                .portfolioShared(Boolean.TRUE.equals(dto.getPortfolioShared()))
                .linkedInProfileShared(Boolean.TRUE.equals(dto.getLinkedInProfileShared()))
                .jobUrl(dto.getJobUrl())
                .company(company)
                .resume(resume)
                .technologies(technologies)
                .build();

        JobApplication savedApplication = jobApplicationRepository.save(jobApplication);
        logger.info("Saved composite Job Application with ID: " + savedApplication.getId());

        // 5. Automatically create the initial ApplicationStatusHistory record
        ApplicationStatusHistory statusHistory = ApplicationStatusHistory.builder()
                .status(savedApplication.getStatus())
                .changedAt(LocalDateTime.now())
                .notes("Initial application entry created via composite endpoint.")
                .jobApplication(savedApplication)
                .build();

        applicationStatusHistoryRepository.save(statusHistory);
        logger.info("Generated initial status history entry for application ID: " + savedApplication.getId());

        return jobApplicationMapper.toDto(savedApplication);
    }

    private Company resolveCompany(CompanyNestedDTO dto) {
        if (dto == null) {
            return null;
        }
        if (dto.getId() != null) {
            return companyRepository.findById(dto.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company", "id", dto.getId()));
        }
        Company newCompany = Company.builder()
                .name(dto.getName())
                .technologyTest(dto.getTechnologyTest())
                .workOn(dto.getWorkOn())
                .allowedJobType(dto.getAllowedJobType())
                .contactNumber(dto.getContactNumber())
                .email(dto.getEmail())
                .location(dto.getLocation())
                .build();
        return companyRepository.save(newCompany);
    }

    private Resume resolveResume(ResumeNestedDTO dto) {
        if (dto == null) {
            return null;
        }
        if (dto.getId() != null) {
            return resumeRepository.findById(dto.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", dto.getId()));
        }
        Resume newResume = Resume.builder()
                .resumeName(dto.getResumeName())
                .documentPath(dto.getDocumentPath())
                .createdAt(LocalDateTime.now())
                .updatedOn(LocalDateTime.now())
                .build();
        return resumeRepository.save(newResume);
    }

    private List<Technology> resolveTechnologies(List<TechnologyNestedDTO> dtos) {
        List<Technology> resolvedList = new ArrayList<>();
        if (dtos == null || dtos.isEmpty()) {
            return resolvedList;
        }

        for (TechnologyNestedDTO techDto : dtos) {
            if (techDto.getId() != null) {
                Technology existingTech = technologyRepository.findById(techDto.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Technology", "id", techDto.getId()));
                resolvedList.add(existingTech);
            } else {
                Technology newTech = Technology.builder()
                        .name(techDto.getName())
                        .type(techDto.getType())
                        .build();
                resolvedList.add(technologyRepository.save(newTech));
            }
        }
        return resolvedList;
    }
}
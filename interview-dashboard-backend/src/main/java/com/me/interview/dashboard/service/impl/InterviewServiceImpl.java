package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.dto.*;
import com.me.interview.dashboard.enumeration.TechnologyType;
import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.mapper.QuestionMapper;
import com.me.interview.dashboard.mapper.TechnologyMapper;
import com.me.interview.dashboard.model.Interview;
import com.me.interview.dashboard.model.JobApplication;
import com.me.interview.dashboard.model.Question;
import com.me.interview.dashboard.model.Technology;
import com.me.interview.dashboard.mapper.InterviewMapper;
import com.me.interview.dashboard.repository.InterviewRepository;
import com.me.interview.dashboard.repository.JobApplicationRepository;
import com.me.interview.dashboard.repository.QuestionRepository;
import com.me.interview.dashboard.repository.TechnologyRepository;
import com.me.interview.dashboard.service.InterviewService;
import com.me.interview.dashboard.specification.InterviewSpecifications;
import com.me.interview.dashboard.util.CustomLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final QuestionRepository questionRepository;
    private final TechnologyRepository technologyRepository;
    private final InterviewMapper interviewMapper;
    private final QuestionMapper questionMapper;
    private final TechnologyMapper technologyMapper;
    private final CustomLogger logger = CustomLogger.getInstance();

    @Override
    @Transactional
    public InterviewResponseDTO createInterview(InterviewRequestDTO requestDTO) {
        Interview interview = interviewMapper.toEntity(requestDTO);
        resolveRelationships(interview, requestDTO);

        Interview savedInterview = interviewRepository.save(interview);
        return interviewMapper.toDto(savedInterview);
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewResponseDTO getInterviewById(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", id));
        return interviewMapper.toDto(interview);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InterviewResponseDTO> getInterviews(InterviewFilterDTO filter, Pageable pageable) {
        Specification<Interview> spec = InterviewSpecifications.buildSpecification(filter);
        return interviewRepository.findAll(spec, pageable)
                .map(interviewMapper::toDto);
    }

    @Override
    @Transactional
    public InterviewResponseDTO updateInterview(Long id, InterviewRequestDTO requestDTO) {
        Interview existingInterview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", id));

        interviewMapper.updateEntityFromDto(requestDTO, existingInterview);
        resolveRelationships(existingInterview, requestDTO);

        Interview updatedInterview = interviewRepository.save(existingInterview);
        return interviewMapper.toDto(updatedInterview);
    }

    @Override
    @Transactional
    public List<InterviewResponseDTO> createInterviewsBulk(List<InterviewRequestDTO> requestDTOs) {
        logger.info("Attempting bulk creation of " + (requestDTOs != null ? requestDTOs.size() : 0) + " interviews with nested questions and technologies");

        if (requestDTOs == null || requestDTOs.isEmpty()) {
            return new ArrayList<>();
        }

        List<Interview> savedInterviews = new ArrayList<>();

        for (InterviewRequestDTO dto : requestDTOs) {
            // 1. Fetch the Job Application if parent/foreign ID is present
            JobApplication jobApplication = null;
            if (dto.getJobApplicationId() != null) {
                jobApplication = jobApplicationRepository.findById(dto.getJobApplicationId())
                        .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", dto.getJobApplicationId()));
            } else {
                throw new com.me.interview.dashboard.exception.InvalidDataException("JobApplication ID is required for Interview");
            }

            // 2. Initialize the Interview entity
            Interview interview = new Interview();
            interview.setInterviewDate(dto.getInterviewDate());
            interview.setStage(dto.getStage());
            interview.setStatus(dto.getStatus());
            interview.setNotes(dto.getNotes());
            interview.setJobApplication(jobApplication);

            // 3. Handle Nested Questions (assuming Question has a ManyToOne relationship back to Interview)
            if (dto.getQuestionDTOs() != null && !dto.getQuestionDTOs().isEmpty()) {
                List<Question> questions = new ArrayList<>();
                for (QuestionRequestDTO qDto : dto.getQuestionDTOs()) {
                    Question question = new Question();
                    question.setQuestion(qDto.getQuestion());
                    question.setListedDate(LocalDate.now());
                    if (qDto.getTechnologyId() != null) {
                        Technology technology = technologyRepository.findById(qDto.getTechnologyId())
                                .orElseThrow(() -> new ResourceNotFoundException("Technology", "id", qDto.getTechnologyId()));
                        question.setTechnology(technology);
                    }
                    questions.add(question);
                }
                interview.setQuestions(questions); // CascadeType.ALL should be on this relationship in the Interview entity
            }

            // 4. Handle Nested Required Improvements (Technologies)
            if (dto.getRequiredImprovements() != null && !dto.getRequiredImprovements().isEmpty()) {
                List<Technology> requiredImprovements = new ArrayList<>();

                for (TechnologyRequestDTO techDto : dto.getRequiredImprovements()) {
                    // Check if technology already exists by name to avoid duplicates
                    Technology technology = technologyRepository.findByNameIgnoreCase(techDto.getName())
                            .orElseGet(() -> {
                                // If it doesn't exist, create a new one
                                Technology newTech = new Technology();
                                newTech.setName(techDto.getName());
                                newTech.setType(techDto.getType()); // Assuming type exists
                                return technologyRepository.save(newTech);
                            });
                    requiredImprovements.add(technology);
                }
                interview.setRequiredImprovements(requiredImprovements);
            }

            // 5. Save the complete Interview (Cascading will save the questions)
            savedInterviews.add(interviewRepository.save(interview));
        }

        logger.info("Successfully completed bulk creation of interviews.");

        return savedInterviews.stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteInterview(Long id) {
        if (!interviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Interview", "id", id);
        }
        interviewRepository.deleteById(id);
    }

    private void resolveRelationships(Interview entity, InterviewRequestDTO dto) {
        if (dto == null) {
            throw new com.me.interview.dashboard.exception.InvalidDataException("Interview request data cannot be null");
        }
        // Resolve JobApplication
        if (dto.getJobApplicationId() != null) {
            JobApplication jobApplication = jobApplicationRepository.findById(dto.getJobApplicationId())
                    .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", dto.getJobApplicationId()));
            entity.setJobApplication(jobApplication);
        } else {
            throw new com.me.interview.dashboard.exception.InvalidDataException("JobApplication ID is required to create/update an Interview");
        }

        // Resolve Questions - mutate existing collection to avoid replacing Hibernate persistent collection with unmodifiable list
        if (entity.getQuestions() == null) {
            entity.setQuestions(new ArrayList<>());
        } else {
            entity.getQuestions().clear();
        }

        if (dto.getQuestionDTOs() != null && !dto.getQuestionDTOs().isEmpty()) {
            for (QuestionRequestDTO qDto : dto.getQuestionDTOs()) {
                Optional<Question> questionOptional = questionRepository.findByQuestion(qDto.getQuestion());
                if (questionOptional.isEmpty()) {
                    Question question = questionMapper.toEntity(qDto);
                    if (question.getListedDate() == null) {
                        question.setListedDate(LocalDate.now());
                    }
                    if (qDto.getTechnologyId() != null) {
                        technologyRepository.findById(qDto.getTechnologyId())
                                .ifPresent(question::setTechnology);
                    }
                    entity.getQuestions().add(question);
                }
            }
        }

        // Resolve Required Improvements (Technologies) - mutate existing collection and ensure technologies are saved/persisted
        if (entity.getRequiredImprovements() == null) {
            entity.setRequiredImprovements(new ArrayList<>());
        } else {
            entity.getRequiredImprovements().clear();
        }

        if (dto.getRequiredImprovements() != null && !dto.getRequiredImprovements().isEmpty()) {
            for (TechnologyRequestDTO techDto : dto.getRequiredImprovements()) {
                if (techDto.getName() != null && !techDto.getName().isBlank()) {
                    Technology technology = technologyRepository.findByNameIgnoreCase(techDto.getName().trim())
                            .orElseGet(() -> {
                                Technology newTech = technologyMapper.toEntity(techDto);
                                newTech.setName(techDto.getName().trim());
                                if (newTech.getType() == null) {
                                    newTech.setType(TechnologyType.LANGUAGE);
                                }
                                return technologyRepository.save(newTech);
                            });
                    entity.getRequiredImprovements().add(technology);
                }
            }
        }
    }
}
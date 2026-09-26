package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.dto.*;
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
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + id));
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
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + id));

        interviewMapper.updateEntityFromDto(requestDTO, existingInterview);
        resolveRelationships(existingInterview, requestDTO);

        Interview updatedInterview = interviewRepository.save(existingInterview);
        return interviewMapper.toDto(updatedInterview);
    }

    @Override
    @Transactional
    public List<InterviewResponseDTO> createInterviewsBulk(List<InterviewRequestDTO> requestDTOs) {
        logger.info("Attempting bulk creation of " + requestDTOs.size() + " interviews with nested questions and technologies");

        List<Interview> savedInterviews = new ArrayList<>();

        for (InterviewRequestDTO dto : requestDTOs) {
            // 1. Fetch the Job Application
            JobApplication jobApplication = jobApplicationRepository.findById(dto.getJobApplicationId())
                    .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", dto.getJobApplicationId()));

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
                    Technology technology = technologyRepository.findById(qDto.getTechnologyId())
                            .orElseThrow(() -> new ResourceNotFoundException("Technology not found"));
                    question.setTechnology(technology);
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
            throw new RuntimeException("Interview not found with id: " + id);
        }
        interviewRepository.deleteById(id);
    }

    private void resolveRelationships(Interview entity, InterviewRequestDTO dto) {
        // Resolve JobApplication
        if (dto.getJobApplicationId() != null) {
            JobApplication jobApplication = jobApplicationRepository.findById(dto.getJobApplicationId())
                    .orElseThrow(() -> new RuntimeException("JobApplication not found with id: " + dto.getJobApplicationId()));
            entity.setJobApplication(jobApplication);
        } else {
            throw new RuntimeException("JobApplication ID is required to create/update an Interview");
        }

        // Resolve Questions
        if (dto.getQuestionDTOs() != null && !dto.getQuestionDTOs().isEmpty()) {
            List<Question> questions = dto.getQuestionDTOs().stream().map(questionMapper::toEntity).toList();
            entity.setQuestions(questions);
        } else {
            entity.getQuestions().clear();
        }

        // Resolve Required Improvements (Technologies)
        if (dto.getRequiredImprovements() != null && !dto.getRequiredImprovements().isEmpty()) {
            List<Technology> technologies = dto.getRequiredImprovements().stream().map(technologyMapper::toEntity).toList();
            entity.setRequiredImprovements(technologies);
        } else {
            entity.getRequiredImprovements().clear();
        }
    }
}
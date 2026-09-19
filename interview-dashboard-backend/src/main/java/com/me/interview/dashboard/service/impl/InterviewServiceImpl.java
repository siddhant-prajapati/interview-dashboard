package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.dto.InterviewFilterDTO;
import com.me.interview.dashboard.dto.InterviewRequestDTO;
import com.me.interview.dashboard.dto.InterviewResponseDTO;
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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final QuestionRepository questionRepository;
    private final TechnologyRepository technologyRepository;
    private final InterviewMapper interviewMapper;

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
        if (dto.getQuestionIds() != null && !dto.getQuestionIds().isEmpty()) {
            List<Question> questions = questionRepository.findAllById(dto.getQuestionIds());
            entity.setQuestions(questions);
        } else {
            entity.getQuestions().clear();
        }

        // Resolve Required Improvements (Technologies)
        if (dto.getRequiredImprovementIds() != null && !dto.getRequiredImprovementIds().isEmpty()) {
            List<Technology> technologies = technologyRepository.findAllById(dto.getRequiredImprovementIds());
            entity.setRequiredImprovements(technologies);
        } else {
            entity.getRequiredImprovements().clear();
        }
    }
}
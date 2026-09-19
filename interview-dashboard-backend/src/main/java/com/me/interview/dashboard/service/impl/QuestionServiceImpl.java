package com.me.interview.dashboard.service.impl;


import com.me.interview.dashboard.dto.QuestionFilterDTO;
import com.me.interview.dashboard.dto.QuestionRequestDTO;
import com.me.interview.dashboard.dto.QuestionResponseDTO;
import com.me.interview.dashboard.model.Question;
import com.me.interview.dashboard.model.Technology;
import com.me.interview.dashboard.mapper.QuestionMapper;
import com.me.interview.dashboard.repository.QuestionRepository;
import com.me.interview.dashboard.repository.TechnologyRepository;
import com.me.interview.dashboard.service.QuestionService;
import com.me.interview.dashboard.specification.QuestionSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final TechnologyRepository technologyRepository;
    private final QuestionMapper questionMapper;

    @Override
    @Transactional
    public QuestionResponseDTO createQuestion(QuestionRequestDTO requestDTO) {
        Question question = questionMapper.toEntity(requestDTO);
        resolveRelationships(question, requestDTO);

        Question savedQuestion = questionRepository.save(question);
        return questionMapper.toDto(savedQuestion);
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionResponseDTO getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        return questionMapper.toDto(question);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<QuestionResponseDTO> getQuestions(QuestionFilterDTO filter, Pageable pageable) {
        Specification<Question> spec = QuestionSpecifications.buildSpecification(filter);
        return questionRepository.findAll(spec, pageable)
                .map(questionMapper::toDto);
    }

    @Override
    @Transactional
    public QuestionResponseDTO updateQuestion(Long id, QuestionRequestDTO requestDTO) {
        Question existingQuestion = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));

        questionMapper.updateEntityFromDto(requestDTO, existingQuestion);
        resolveRelationships(existingQuestion, requestDTO);

        Question updatedQuestion = questionRepository.save(existingQuestion);
        return questionMapper.toDto(updatedQuestion);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }

    private void resolveRelationships(Question entity, QuestionRequestDTO dto) {
        if (dto.getTechnologyId() != null) {
            Technology technology = technologyRepository.findById(dto.getTechnologyId())
                    .orElseThrow(() -> new RuntimeException("Technology not found with id: " + dto.getTechnologyId()));
            entity.setTechnology(technology);
        } else {
            entity.setTechnology(null);
        }
    }
}
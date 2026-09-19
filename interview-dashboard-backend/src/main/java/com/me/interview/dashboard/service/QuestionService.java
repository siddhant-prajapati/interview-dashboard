package com.me.interview.dashboard.service;


import com.me.interview.dashboard.dto.QuestionFilterDTO;
import com.me.interview.dashboard.dto.QuestionRequestDTO;
import com.me.interview.dashboard.dto.QuestionResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface QuestionService {

    QuestionResponseDTO createQuestion(QuestionRequestDTO requestDTO);

    QuestionResponseDTO getQuestionById(Long id);

    Page<QuestionResponseDTO> getQuestions(QuestionFilterDTO filter, Pageable pageable);

    QuestionResponseDTO updateQuestion(Long id, QuestionRequestDTO requestDTO);

    void deleteQuestion(Long id);
}

package com.me.interview.dashboard.specification;

import com.me.interview.dashboard.dto.QuestionFilterDTO;
import com.me.interview.dashboard.model.Question;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class QuestionSpecifications {

    public static Specification<Question> buildSpecification(QuestionFilterDTO filter) {
        Specification<Question> spec = Specification.where((Specification<Question>) null);

        if (filter == null) {
            return spec;
        }

        return spec.and(hasQuestionText(filter.getQuestion()))
                .and(hasTechnologyId(filter.getTechnologyId()))
                .and(listedDateBetween(filter.getListedDateStart(), filter.getListedDateEnd()));
    }

    public static Specification<Question> hasQuestionText(String questionText) {
        return (root, query, criteriaBuilder) ->
                questionText == null || questionText.isEmpty() ? null :
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("question")), "%" + questionText.toLowerCase() + "%");
    }

    public static Specification<Question> hasTechnologyId(Long technologyId) {
        return (root, query, criteriaBuilder) ->
                technologyId == null ? null : criteriaBuilder.equal(root.get("technology").get("id"), technologyId);
    }

    public static Specification<Question> listedDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate != null && endDate != null) {
                return criteriaBuilder.between(root.get("listedDate"), startDate, endDate);
            } else if (startDate != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("listedDate"), startDate);
            } else if (endDate != null) {
                return criteriaBuilder.lessThanOrEqualTo(root.get("listedDate"), endDate);
            }
            return null;
        };
    }
}

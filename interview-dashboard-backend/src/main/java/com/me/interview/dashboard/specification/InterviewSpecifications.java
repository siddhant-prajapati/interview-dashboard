package com.me.interview.dashboard.specification;

import com.me.interview.dashboard.dto.InterviewFilterDTO;
import com.me.interview.dashboard.enumeration.InterviewStage;
import com.me.interview.dashboard.enumeration.InterviewStatus;
import com.me.interview.dashboard.model.Interview;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class InterviewSpecifications {

    public static Specification<Interview> buildSpecification(InterviewFilterDTO filter) {
        Specification<Interview> spec = Specification.where((Specification<Interview>) null);

        if (filter == null) {
            return spec;
        }

        return spec.and(hasStage(filter.getStage()))
                .and(hasStatus(filter.getStatus()))
                .and(hasJobApplicationId(filter.getJobApplicationId()))
                .and(interviewDateBetween(filter.getInterviewDateStart(), filter.getInterviewDateEnd()));
    }

    public static Specification<Interview> hasStage(InterviewStage stage) {
        return (root, query, criteriaBuilder) ->
                stage == null ? null : criteriaBuilder.equal(root.get("stage"), stage);
    }

    public static Specification<Interview> hasStatus(InterviewStatus status) {
        return (root, query, criteriaBuilder) ->
                status == null ? null : criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<Interview> hasJobApplicationId(Long jobApplicationId) {
        return (root, query, criteriaBuilder) ->
                jobApplicationId == null ? null : criteriaBuilder.equal(root.get("jobApplication").get("id"), jobApplicationId);
    }

    public static Specification<Interview> interviewDateBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate != null && endDate != null) {
                return criteriaBuilder.between(root.get("interviewDate"), startDate, endDate);
            } else if (startDate != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("interviewDate"), startDate);
            } else if (endDate != null) {
                return criteriaBuilder.lessThanOrEqualTo(root.get("interviewDate"), endDate);
            }
            return null;
        };
    }
}

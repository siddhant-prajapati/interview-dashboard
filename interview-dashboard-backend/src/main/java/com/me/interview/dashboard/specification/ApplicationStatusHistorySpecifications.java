package com.me.interview.dashboard.specification;

import com.me.interview.dashboard.dto.ApplicationStatusHistoryFilterDTO;
import com.me.interview.dashboard.enumeration.ApplicationStatus;
import com.me.interview.dashboard.model.ApplicationStatusHistory;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class ApplicationStatusHistorySpecifications {

    public static Specification<ApplicationStatusHistory> buildSpecification(ApplicationStatusHistoryFilterDTO filter) {
        Specification<ApplicationStatusHistory> spec = Specification.where((Specification<ApplicationStatusHistory>) null);

        if (filter == null) {
            return spec;
        }

        return spec.and(hasStatus(filter.getStatus()))
                .and(hasJobApplicationId(filter.getJobApplicationId()))
                .and(changedAtBetween(filter.getChangedAtStart(), filter.getChangedAtEnd()));
    }

    public static Specification<ApplicationStatusHistory> hasStatus(ApplicationStatus status) {
        return (root, query, criteriaBuilder) ->
                status == null ? null : criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<ApplicationStatusHistory> hasJobApplicationId(Long jobApplicationId) {
        return (root, query, criteriaBuilder) ->
                jobApplicationId == null ? null : criteriaBuilder.equal(root.get("jobApplication").get("id"), jobApplicationId);
    }

    public static Specification<ApplicationStatusHistory> changedAtBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate != null && endDate != null) {
                return criteriaBuilder.between(root.get("changedAt"), startDate, endDate);
            } else if (startDate != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("changedAt"), startDate);
            } else if (endDate != null) {
                return criteriaBuilder.lessThanOrEqualTo(root.get("changedAt"), endDate);
            }
            return null;
        };
    }
}
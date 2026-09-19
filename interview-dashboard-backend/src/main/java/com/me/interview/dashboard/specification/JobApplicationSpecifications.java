package com.me.interview.dashboard.specification;


import com.me.interview.dashboard.dto.JobApplicationFilterDTO;
import com.me.interview.dashboard.enumeration.ApplicationStatus;
import com.me.interview.dashboard.enumeration.JobType;
import com.me.interview.dashboard.model.JobApplication;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class JobApplicationSpecifications {

    // Centralized method to build the entire specification from the DTO
    public static Specification<JobApplication> buildSpecification(JobApplicationFilterDTO filter) {
        Specification<JobApplication> spec = Specification.where((Specification<JobApplication>) null);

        if (filter == null) {
            return spec;
        }

        return spec.and(hasPlatform(filter.getPlatform()))
                .and(hasRole(filter.getRole()))
                .and(hasStatus(filter.getStatus()))
                .and(hasJobType(filter.getJobType()))
                .and(hasCompanyId(filter.getCompanyId()))
                .and(applyDateBetween(filter.getApplyDateStart(), filter.getApplyDateEnd()));
    }

    // --- Individual Criteria Methods ---

    public static Specification<JobApplication> hasPlatform(String platform) {
        return (root, query, criteriaBuilder) ->
                platform == null || platform.isEmpty() ? null :
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("platform")), "%" + platform.toLowerCase() + "%");
    }

    public static Specification<JobApplication> hasRole(String role) {
        return (root, query, criteriaBuilder) ->
                role == null || role.isEmpty() ? null :
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("role")), "%" + role.toLowerCase() + "%");
    }

    public static Specification<JobApplication> hasStatus(ApplicationStatus status) {
        return (root, query, criteriaBuilder) ->
                status == null ? null : criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<JobApplication> hasJobType(JobType jobType) {
        return (root, query, criteriaBuilder) ->
                jobType == null ? null : criteriaBuilder.equal(root.get("jobType"), jobType);
    }

    public static Specification<JobApplication> hasCompanyId(Long companyId) {
        return (root, query, criteriaBuilder) ->
                companyId == null ? null : criteriaBuilder.equal(root.get("company").get("id"), companyId);
    }

    public static Specification<JobApplication> applyDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate != null && endDate != null) {
                return criteriaBuilder.between(root.get("applyDate"), startDate, endDate);
            } else if (startDate != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("applyDate"), startDate);
            } else if (endDate != null) {
                return criteriaBuilder.lessThanOrEqualTo(root.get("applyDate"), endDate);
            }
            return null;
        };
    }
}
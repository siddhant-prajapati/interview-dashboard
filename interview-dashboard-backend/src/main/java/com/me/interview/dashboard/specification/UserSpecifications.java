package com.me.interview.dashboard.specification;


import com.me.interview.dashboard.dto.UserFilterDTO;
import com.me.interview.dashboard.model.Company;
import com.me.interview.dashboard.model.User;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class UserSpecifications {

    public static Specification<User> buildSpecification(UserFilterDTO filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getUsername() != null && !filter.getUsername().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("username")),
                        "%" + filter.getUsername().toLowerCase() + "%"));
            }

            if (filter.getEmail() != null && !filter.getEmail().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")),
                        "%" + filter.getEmail().toLowerCase() + "%"));
            }

            if (filter.getName() != null && !filter.getName().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        "%" + filter.getName().toLowerCase() + "%"));
            }

            if (filter.getMinExperience() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("experience"), filter.getMinExperience()));
            }

            if (filter.getCreatedAfter() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), filter.getCreatedAfter()));
            }

            if (filter.getCreatedBefore() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), filter.getCreatedBefore()));
            }

            if (StringUtils.hasText(filter.getLinkedInLink())) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("linkedInLink")), "%" + filter.getLinkedInLink().toLowerCase() + "%"));
            }

            // New Company Filter (Joins the Many-to-Many relationship)
            if (filter.getCompanyId() != null) {
                Join<User, Company> companyJoin = root.join("companies");
                predicates.add(criteriaBuilder.equal(companyJoin.get("id"), filter.getCompanyId()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
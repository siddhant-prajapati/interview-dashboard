package com.me.interview.dashboard.specification;

import com.me.interview.dashboard.dto.ProjectFilterDTO;
import com.me.interview.dashboard.model.Project;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;

public class ProjectSpecifications {

    public static Specification<Project> buildSpecification(ProjectFilterDTO filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getName() != null && !filter.getName().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        "%" + filter.getName().toLowerCase() + "%"));
            }

            if (filter.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getUserId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("user").get("id"), filter.getUserId()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
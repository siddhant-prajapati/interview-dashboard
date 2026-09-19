package com.me.interview.dashboard.specification;

import com.me.interview.dashboard.dto.PreparationTopicFilterDTO;
import com.me.interview.dashboard.model.PreparationTopic;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;

public class PreparationTopicSpecifications {

    public static Specification<PreparationTopic> buildSpecification(PreparationTopicFilterDTO filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getName() != null && !filter.getName().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        "%" + filter.getName().toLowerCase() + "%"));
            }

            if (filter.getCategory() != null) {
                predicates.add(criteriaBuilder.equal(root.get("category"), filter.getCategory()));
            }

            if (filter.getParentId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("parent").get("id"), filter.getParentId()));
            }

            if (Boolean.TRUE.equals(filter.getIsRoot())) {
                predicates.add(criteriaBuilder.isNull(root.get("parent")));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
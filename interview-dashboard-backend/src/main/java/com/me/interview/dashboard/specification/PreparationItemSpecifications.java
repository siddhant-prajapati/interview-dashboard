package com.me.interview.dashboard.specification;

import com.me.interview.dashboard.dto.PreparationItemFilterDTO;
import com.me.interview.dashboard.model.PreparationItem;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;

public class PreparationItemSpecifications {

    public static Specification<PreparationItem> buildSpecification(PreparationItemFilterDTO filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getTitle() != null && !filter.getTitle().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + filter.getTitle().toLowerCase() + "%"));
            }

            if (filter.getType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), filter.getType()));
            }

            if (filter.getTopicId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("topic").get("id"), filter.getTopicId()));
            }

            if (filter.getDifficulty() != null) {
                predicates.add(criteriaBuilder.equal(root.get("difficulty"), filter.getDifficulty()));
            }

            if (filter.getCompleted() != null) {
                predicates.add(criteriaBuilder.equal(root.get("completed"), filter.getCompleted()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
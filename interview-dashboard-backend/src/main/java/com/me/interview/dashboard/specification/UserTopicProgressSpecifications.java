package com.me.interview.dashboard.specification;

import com.me.interview.dashboard.dto.UserTopicProgressFilterDTO;
import com.me.interview.dashboard.model.UserTopicProgress;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;

public class UserTopicProgressSpecifications {

    public static Specification<UserTopicProgress> buildSpecification(UserTopicProgressFilterDTO filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getUserId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("user").get("id"), filter.getUserId()));
            }

            if (filter.getTopicId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("topic").get("id"), filter.getTopicId()));
            }

            if (filter.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getNextRevisionBefore() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("nextRevisionDate"), filter.getNextRevisionBefore()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
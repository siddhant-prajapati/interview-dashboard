package com.me.interview.dashboard.specification;

import com.me.interview.dashboard.dto.TechnologyFilterDTO;
import com.me.interview.dashboard.enumeration.TechnologyType;
import com.me.interview.dashboard.model.Technology;
import org.springframework.data.jpa.domain.Specification;

public class TechnologySpecifications {

    public static Specification<Technology> buildSpecification(TechnologyFilterDTO filter) {
        Specification<Technology> spec = Specification.where((Specification<Technology>) null);

        if (filter == null) {
            return spec;
        }

        return spec.and(hasName(filter.getName()))
                .and(hasType(filter.getType()));
    }

    public static Specification<Technology> hasName(String name) {
        return (root, query, criteriaBuilder) ->
                name == null || name.isEmpty() ? null :
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Technology> hasType(TechnologyType type) {
        return (root, query, criteriaBuilder) ->
                type == null ? null : criteriaBuilder.equal(root.get("type"), type);
    }
}

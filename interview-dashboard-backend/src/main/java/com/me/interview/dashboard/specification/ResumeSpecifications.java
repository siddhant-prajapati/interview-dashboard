package com.me.interview.dashboard.specification;

import com.me.interview.dashboard.dto.ResumeFilterDTO;
import com.me.interview.dashboard.model.Resume;
import org.springframework.data.jpa.domain.Specification;

public class ResumeSpecifications {

    public static Specification<Resume> buildSpecification(ResumeFilterDTO filter) {
        Specification<Resume> spec = Specification.where((Specification<Resume>) null);

        if (filter == null) {
            return spec;
        }

        return spec.and(hasResumeName(filter.getResumeName()));
    }

    public static Specification<Resume> hasResumeName(String resumeName) {
        return (root, query, criteriaBuilder) ->
                resumeName == null || resumeName.isEmpty() ? null :
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("resumeName")), "%" + resumeName.toLowerCase() + "%");
    }
}
package com.me.interview.dashboard.specification;


import com.me.interview.dashboard.dto.CompanyFilterDTO;
import com.me.interview.dashboard.model.Company;
import org.springframework.data.jpa.domain.Specification;

public class CompanySpecifications {

    public static Specification<Company> buildSpecification(CompanyFilterDTO filter) {
        Specification<Company> spec = Specification.where((Specification<Company>) null);

        if (filter == null) {
            return spec;
        }

        return spec.and(hasName(filter.getName()))
                .and(hasTechnologyTest(filter.getTechnologyTest()))
                .and(hasLocation(filter.getLocation()))
                .and(hasAllowedJobType(filter.getAllowedJobType()));
    }

    public static Specification<Company> hasName(String name) {
        return (root, query, criteriaBuilder) ->
                name == null || name.isEmpty() ? null :
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Company> hasTechnologyTest(Boolean technologyTest) {
        return (root, query, criteriaBuilder) ->
                technologyTest == null ? null : criteriaBuilder.equal(root.get("technologyTest"), technologyTest);
    }

    public static Specification<Company> hasLocation(String location) {
        return (root, query, criteriaBuilder) ->
                location == null || location.isEmpty() ? null :
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), "%" + location.toLowerCase() + "%");
    }

    public static Specification<Company> hasAllowedJobType(String allowedJobType) {
        return (root, query, criteriaBuilder) ->
                allowedJobType == null || allowedJobType.isEmpty() ? null :
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("allowedJobType")), "%" + allowedJobType.toLowerCase() + "%");
    }
}
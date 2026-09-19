package com.me.interview.dashboard.mapper;

import com.me.interview.dashboard.dto.JobApplicationRequestDTO;
import com.me.interview.dashboard.dto.JobApplicationResponseDTO;
import com.me.interview.dashboard.model.JobApplication;
import com.me.interview.dashboard.model.Technology;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface JobApplicationMapper {

    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "resume.id", target = "resumeId")
    @Mapping(target = "technologyIds", expression = "java(mapTechnologiesToIds(entity.getTechnologies()))")
    JobApplicationResponseDTO toDto(JobApplication entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "resume", ignore = true)
    @Mapping(target = "technologies", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    JobApplication toEntity(JobApplicationRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "resume", ignore = true)
    @Mapping(target = "technologies", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(JobApplicationRequestDTO dto, @MappingTarget JobApplication entity);

    default List<Long> mapTechnologiesToIds(List<Technology> technologies) {
        if (technologies == null) return null;
        return technologies.stream().map(Technology::getId).collect(Collectors.toList());
    }
}
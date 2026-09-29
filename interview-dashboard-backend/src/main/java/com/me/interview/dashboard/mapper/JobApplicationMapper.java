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

    @Mapping(source = "company.name", target = "companyName")
    @Mapping(source = "resume.resumeName", target = "resumeName")
    @Mapping(source = "platform.name", target = "platform")
    @Mapping(source = "platform.name", target = "platformName")
    @Mapping(source = "platform.id", target = "platformId")
    @Mapping(target = "technologies", expression = "java(mapTechnologiesToNames(entity.getTechnologies()))")
    JobApplicationResponseDTO toDto(JobApplication entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "resume", ignore = true)
    @Mapping(target = "platform", ignore = true)
    @Mapping(target = "technologies", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    JobApplication toEntity(JobApplicationRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "resume", ignore = true)
    @Mapping(target = "platform", ignore = true)
    @Mapping(target = "technologies", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(JobApplicationRequestDTO dto, @MappingTarget JobApplication entity);

    default List<String> mapTechnologiesToNames(List<Technology> technologies) {
        if (technologies == null) return null;
        return technologies.stream()
                .filter(t -> t != null && t.getName() != null)
                .map(Technology::getName)
                .collect(Collectors.toList());
    }
}
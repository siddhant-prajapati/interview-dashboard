package com.me.interview.dashboard.mapper;

import com.me.interview.dashboard.dto.ProjectRequestDTO;
import com.me.interview.dashboard.dto.ProjectResponseDTO;
import com.me.interview.dashboard.model.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {TechnologyMapper.class})
public interface ProjectMapper {

    @Mapping(source = "user.id", target = "userId")
    ProjectResponseDTO toDto(Project entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "technologies", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Project toEntity(ProjectRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "technologies", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(ProjectRequestDTO dto, @MappingTarget Project entity);
}
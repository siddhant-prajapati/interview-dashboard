package com.me.interview.dashboard.mapper;

import com.me.interview.dashboard.dto.TechnologyRequestDTO;
import com.me.interview.dashboard.dto.TechnologyResponseDTO;
import com.me.interview.dashboard.model.Technology;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TechnologyMapper {

    TechnologyResponseDTO toDto(Technology entity);

    @Mapping(target = "id", ignore = true)
    Technology toEntity(TechnologyRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(TechnologyRequestDTO dto, @MappingTarget Technology entity);
}
package com.me.interview.dashboard.mapper;

import com.me.interview.dashboard.dto.PreparationTopicRequestDTO;
import com.me.interview.dashboard.dto.PreparationTopicResponseDTO;
import com.me.interview.dashboard.model.PreparationTopic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PreparationTopicMapper {

    @Mapping(source = "parent.id", target = "parentId")
    PreparationTopicResponseDTO toDto(PreparationTopic entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true) // Handled in Service
    @Mapping(target = "children", ignore = true)
    PreparationTopic toEntity(PreparationTopicRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true) // Handled in Service
    @Mapping(target = "children", ignore = true)
    void updateEntityFromDto(PreparationTopicRequestDTO dto, @MappingTarget PreparationTopic entity);
}
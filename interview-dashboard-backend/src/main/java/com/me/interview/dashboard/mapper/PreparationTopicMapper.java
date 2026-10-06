package com.me.interview.dashboard.mapper;

import com.me.interview.dashboard.dto.PreparationTopicRequestDTO;
import com.me.interview.dashboard.dto.PreparationTopicResponseDTO;
import com.me.interview.dashboard.model.PreparationTopic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PreparationTopicMapper {

    @Mapping(source = "parent.id", target = "parentId")
    @Mapping(source = "subTopics", target = "subTopics")
    PreparationTopicResponseDTO toDto(PreparationTopic entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true) // Handled in Service
    @Mapping(target = "subTopics", ignore = true)
    PreparationTopic toEntity(PreparationTopicRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true) // Handled in Service
    @Mapping(target = "subTopics", ignore = true)
    void updateEntityFromDto(PreparationTopicRequestDTO dto, @MappingTarget PreparationTopic entity);

    List<PreparationTopicResponseDTO> toDtoList(List<PreparationTopic> entities);
}
package com.me.interview.dashboard.mapper;

import com.me.interview.dashboard.dto.PreparationItemRequestDTO;
import com.me.interview.dashboard.dto.PreparationItemResponseDTO;
import com.me.interview.dashboard.model.PreparationItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PreparationItemMapper {

    @Mapping(source = "topic.id", target = "topicId")
    PreparationItemResponseDTO toDto(PreparationItem entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "topic", ignore = true) // Handled in Service layer
    @Mapping(target = "completedAt", ignore = true) // Handled via logic
    PreparationItem toEntity(PreparationItemRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "topic", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    void updateEntityFromDto(PreparationItemRequestDTO dto, @MappingTarget PreparationItem entity);
}
package com.me.interview.dashboard.mapper;

import com.me.interview.dashboard.dto.ApplicationStatusHistoryRequestDTO;
import com.me.interview.dashboard.dto.ApplicationStatusHistoryResponseDTO;
import com.me.interview.dashboard.model.ApplicationStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ApplicationStatusHistoryMapper {

    @Mapping(source = "jobApplication.id", target = "jobApplicationId")
    ApplicationStatusHistoryResponseDTO toDto(ApplicationStatusHistory entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "jobApplication", ignore = true)
    ApplicationStatusHistory toEntity(ApplicationStatusHistoryRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "jobApplication", ignore = true)
    void updateEntityFromDto(ApplicationStatusHistoryRequestDTO dto, @MappingTarget ApplicationStatusHistory entity);
}

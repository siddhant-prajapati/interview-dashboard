package com.me.interview.dashboard.mapper;

import com.me.interview.dashboard.dto.PlatformRequestDTO;
import com.me.interview.dashboard.dto.PlatformResponseDTO;
import com.me.interview.dashboard.model.Platform;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlatformMapper {

    @Mapping(source = "user.id", target = "userId")
    PlatformResponseDTO toDto(Platform entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Platform toEntity(PlatformRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    void updateEntityFromDto(PlatformRequestDTO dto, @MappingTarget Platform entity);

    List<PlatformResponseDTO> toDtoList(List<Platform> entities);

    List<Platform> toEntityList(List<PlatformRequestDTO> dtos);
}

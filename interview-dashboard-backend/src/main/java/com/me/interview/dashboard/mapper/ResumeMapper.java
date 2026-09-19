package com.me.interview.dashboard.mapper;

import com.me.interview.dashboard.dto.ResumeRequestDTO;
import com.me.interview.dashboard.dto.ResumeResponseDTO;
import com.me.interview.dashboard.model.Resume;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ResumeMapper {

    ResumeResponseDTO toDto(Resume entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedOn", ignore = true)
    Resume toEntity(ResumeRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedOn", ignore = true)
    void updateEntityFromDto(ResumeRequestDTO dto, @MappingTarget Resume entity);
}

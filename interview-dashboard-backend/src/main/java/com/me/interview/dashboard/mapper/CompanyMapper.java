package com.me.interview.dashboard.mapper;


import com.me.interview.dashboard.dto.CompanyRequestDTO;
import com.me.interview.dashboard.dto.CompanyResponseDTO;
import com.me.interview.dashboard.model.Company;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    CompanyResponseDTO toDto(Company entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Company toEntity(CompanyRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(CompanyRequestDTO dto, @MappingTarget Company entity);
}

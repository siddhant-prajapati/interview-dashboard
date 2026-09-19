package com.me.interview.dashboard.mapper;


import com.me.interview.dashboard.dto.UserRequestDTO;
import com.me.interview.dashboard.dto.UserResponseDTO;
import com.me.interview.dashboard.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponseDTO toDto(User entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    User toEntity(UserRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(UserRequestDTO dto, @MappingTarget User entity);
}
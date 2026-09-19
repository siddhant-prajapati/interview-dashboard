package com.me.interview.dashboard.mapper;

import com.me.interview.dashboard.dto.UserTopicProgressRequestDTO;
import com.me.interview.dashboard.dto.UserTopicProgressResponseDTO;
import com.me.interview.dashboard.model.UserTopicProgress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserTopicProgressMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "topic.id", target = "topicId")
    UserTopicProgressResponseDTO toDto(UserTopicProgress entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true) // Handled in Service
    @Mapping(target = "topic", ignore = true) // Handled in Service
    UserTopicProgress toEntity(UserTopicProgressRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "topic", ignore = true)
    void updateEntityFromDto(UserTopicProgressRequestDTO dto, @MappingTarget UserTopicProgress entity);
}
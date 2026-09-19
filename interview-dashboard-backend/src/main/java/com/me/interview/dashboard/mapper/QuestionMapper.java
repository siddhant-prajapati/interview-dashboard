package com.me.interview.dashboard.mapper;

import com.me.interview.dashboard.dto.QuestionRequestDTO;
import com.me.interview.dashboard.dto.QuestionResponseDTO;
import com.me.interview.dashboard.model.Interview;
import com.me.interview.dashboard.model.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    @Mapping(source = "technology.id", target = "technologyId")
    QuestionResponseDTO toDto(Question entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "technology", ignore = true)
    Question toEntity(QuestionRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "technology", ignore = true)
    void updateEntityFromDto(QuestionRequestDTO dto, @MappingTarget Question entity);

    default List<Long> mapInterviewsToIds(List<Interview> interviews) {
        if (interviews == null) return null;
        return interviews.stream().map(Interview::getId).collect(Collectors.toList());
    }
}

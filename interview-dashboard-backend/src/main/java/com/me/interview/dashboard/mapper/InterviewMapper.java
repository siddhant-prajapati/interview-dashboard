package com.me.interview.dashboard.mapper;


import com.me.interview.dashboard.dto.InterviewRequestDTO;
import com.me.interview.dashboard.dto.InterviewResponseDTO;
import com.me.interview.dashboard.model.Interview;
import com.me.interview.dashboard.model.Question;
import com.me.interview.dashboard.model.Technology;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface InterviewMapper {

    @Mapping(source = "jobApplication.id", target = "jobApplicationId")
    @Mapping(target = "questionIds", expression = "java(mapQuestionsToIds(entity.getQuestions()))")
    @Mapping(target = "requiredImprovementIds", expression = "java(mapTechnologiesToIds(entity.getRequiredImprovements()))")
    InterviewResponseDTO toDto(Interview entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "jobApplication", ignore = true)
    @Mapping(target = "questions", ignore = true)
    @Mapping(target = "requiredImprovements", ignore = true)
    Interview toEntity(InterviewRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "jobApplication", ignore = true)
    @Mapping(target = "questions", ignore = true)
    @Mapping(target = "requiredImprovements", ignore = true)
    void updateEntityFromDto(InterviewRequestDTO dto, @MappingTarget Interview entity);

    default List<Long> mapQuestionsToIds(List<Question> questions) {
        if (questions == null) return null;
        return questions.stream().map(Question::getId).collect(Collectors.toList());
    }

    default List<Long> mapTechnologiesToIds(List<Technology> technologies) {
        if (technologies == null) return null;
        return technologies.stream().map(Technology::getId).collect(Collectors.toList());
    }
}

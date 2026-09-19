package com.me.interview.dashboard.repository;

import com.me.interview.dashboard.model.PreparationTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PreparationTopicRepository extends JpaRepository<PreparationTopic, Long>, JpaSpecificationExecutor<PreparationTopic> {
    boolean existsByParentId(Long parentId);
}
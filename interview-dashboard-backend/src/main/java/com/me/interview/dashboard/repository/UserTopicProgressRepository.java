package com.me.interview.dashboard.repository;

import com.me.interview.dashboard.model.UserTopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserTopicProgressRepository extends JpaRepository<UserTopicProgress, Long>, JpaSpecificationExecutor<UserTopicProgress> {
    Optional<UserTopicProgress> findByUserIdAndTopicId(Long userId, Long topicId);
}
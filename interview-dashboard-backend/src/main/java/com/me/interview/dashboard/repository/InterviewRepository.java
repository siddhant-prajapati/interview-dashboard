package com.me.interview.dashboard.repository;

import com.me.interview.dashboard.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long>, JpaSpecificationExecutor<Interview> {
    List<Interview> findAllByJobApplicationId(Long jobApplicationId);

    void deleteAllByJobApplicationId(Long id);
}
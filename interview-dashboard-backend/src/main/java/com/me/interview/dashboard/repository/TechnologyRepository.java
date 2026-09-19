package com.me.interview.dashboard.repository;

import com.me.interview.dashboard.model.Technology;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TechnologyRepository extends JpaRepository<Technology, Long>, JpaSpecificationExecutor<Technology> {
}
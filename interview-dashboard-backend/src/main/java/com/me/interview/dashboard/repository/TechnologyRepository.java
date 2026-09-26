package com.me.interview.dashboard.repository;

import com.me.interview.dashboard.model.Technology;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TechnologyRepository extends JpaRepository<Technology, Long>, JpaSpecificationExecutor<Technology> {
    Optional<Technology> findByNameIgnoreCase(String name);
}
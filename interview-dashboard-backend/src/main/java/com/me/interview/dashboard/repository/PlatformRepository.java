package com.me.interview.dashboard.repository;

import com.me.interview.dashboard.model.Platform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlatformRepository extends JpaRepository<Platform, Long>, JpaSpecificationExecutor<Platform> {
    List<Platform> findByUserId(Long userId);
    Optional<Platform> findFirstByNameIgnoreCase(String name);
}

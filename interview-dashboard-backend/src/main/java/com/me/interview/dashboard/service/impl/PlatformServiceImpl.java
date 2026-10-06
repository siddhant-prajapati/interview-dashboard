package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.dto.PlatformFilterDTO;
import com.me.interview.dashboard.dto.PlatformRequestDTO;
import com.me.interview.dashboard.dto.PlatformResponseDTO;
import com.me.interview.dashboard.exception.InvalidDataException;
import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.mapper.PlatformMapper;
import com.me.interview.dashboard.model.Platform;
import com.me.interview.dashboard.model.User;
import com.me.interview.dashboard.repository.PlatformRepository;
import com.me.interview.dashboard.repository.UserRepository;
import com.me.interview.dashboard.service.PlatformService;
import com.me.interview.dashboard.specification.PlatformSpecifications;
import com.me.interview.dashboard.util.CustomLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlatformServiceImpl implements PlatformService {

    private final PlatformRepository platformRepository;
    private final UserRepository userRepository;
    private final PlatformMapper platformMapper;

    private final CustomLogger logger = CustomLogger.getInstance();

    @Override
    @Transactional
    public PlatformResponseDTO createPlatform(PlatformRequestDTO requestDTO) {
        logger.info("Attempting to create a new Platform: " + requestDTO.getName());

        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", requestDTO.getUserId()));

        try {
            Platform platform = platformMapper.toEntity(requestDTO);
            platform.setUser(user);
            if (platform.getLastUpdatedDate() == null) {
                platform.setLastUpdatedDate(LocalDateTime.now());
            }

            Platform savedPlatform = platformRepository.save(platform);
            logger.info("Successfully created Platform with ID: " + savedPlatform.getId());
            return platformMapper.toDto(savedPlatform);
        } catch (Exception e) {
            logger.error("Failed to create Platform: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public List<PlatformResponseDTO> createPlatformsBulk(List<PlatformRequestDTO> requestDTOs) {
        logger.info("Attempting bulk creation of Platforms");
        if (requestDTOs == null || requestDTOs.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            List<Platform> platforms = new ArrayList<>();
            for (PlatformRequestDTO dto : requestDTOs) {
                User user = null;
                if (dto.getUserId() != null) {
                    user = userRepository.findById(dto.getUserId())
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getUserId()));
                } else {
                    throw new InvalidDataException("User ID is required for Platform");
                }

                Platform platform = platformMapper.toEntity(dto);
                platform.setUser(user);
                if (platform.getLastUpdatedDate() == null) {
                    platform.setLastUpdatedDate(LocalDateTime.now());
                }
                platforms.add(platform);
            }

            List<Platform> savedPlatforms = platformRepository.saveAll(platforms);
            logger.info("Successfully created " + savedPlatforms.size() + " platforms in bulk");
            return platformMapper.toDtoList(savedPlatforms);
        } catch (Exception e) {
            logger.error("Failed to bulk create Platforms: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PlatformResponseDTO getPlatformById(Long id) {
        logger.info("Fetching Platform with ID: " + id);
        Platform platform = platformRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Platform", "id", id));
        return platformMapper.toDto(platform);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PlatformResponseDTO> getPlatforms(PlatformFilterDTO filter, Pageable pageable) {
        logger.info("Fetching paginated list of Platforms with filters");
        Specification<Platform> spec = PlatformSpecifications.buildSpecification(filter);
        return platformRepository.findAll(spec, pageable).map(platformMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlatformResponseDTO> getPlatformsByUserId(Long userId) {
        logger.info("Fetching Platforms for User ID: " + userId);
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        List<Platform> platforms = platformRepository.findByUserId(userId);
        return platformMapper.toDtoList(platforms);
    }

    @Override
    @Transactional
    public PlatformResponseDTO updatePlatform(Long id, PlatformRequestDTO requestDTO) {
        logger.info("Attempting to update Platform with ID: " + id);

        Platform existingPlatform = platformRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Platform", "id", id));

        if (requestDTO.getUserId() != null) {
            User user = userRepository.findById(requestDTO.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", requestDTO.getUserId()));
            existingPlatform.setUser(user);
        }

        try {
            platformMapper.updateEntityFromDto(requestDTO, existingPlatform);
            if (requestDTO.getLastUpdatedDate() == null) {
                existingPlatform.setLastUpdatedDate(LocalDateTime.now());
            }

            Platform updatedPlatform = platformRepository.save(existingPlatform);
            logger.info("Successfully updated Platform with ID: " + id);
            return platformMapper.toDto(updatedPlatform);
        } catch (Exception e) {
            logger.error("Failed to update Platform with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public void deletePlatform(Long id) {
        logger.info("Attempting to delete Platform with ID: " + id);

        if (!platformRepository.existsById(id)) {
            logger.warn("Deletion failed: Platform not found with ID: " + id);
            throw new ResourceNotFoundException("Platform", "id", id);
        }

        try {
            platformRepository.deleteById(id);
            logger.info("Successfully deleted Platform with ID: " + id);
        } catch (Exception e) {
            logger.error("Failed to delete Platform with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }
}

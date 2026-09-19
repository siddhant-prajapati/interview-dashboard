package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.dto.UserTopicProgressFilterDTO;
import com.me.interview.dashboard.dto.UserTopicProgressRequestDTO;
import com.me.interview.dashboard.dto.UserTopicProgressResponseDTO;
import com.me.interview.dashboard.model.PreparationTopic;
import com.me.interview.dashboard.model.User;
import com.me.interview.dashboard.model.UserTopicProgress;
import com.me.interview.dashboard.exception.InvalidDataException;
import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.mapper.UserTopicProgressMapper;
import com.me.interview.dashboard.repository.PreparationTopicRepository;
import com.me.interview.dashboard.repository.UserRepository;
import com.me.interview.dashboard.repository.UserTopicProgressRepository;
import com.me.interview.dashboard.service.UserTopicProgressService;
import com.me.interview.dashboard.specification.UserTopicProgressSpecifications;
import com.me.interview.dashboard.util.CustomLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserTopicProgressServiceImpl implements UserTopicProgressService {

    private final UserTopicProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final PreparationTopicRepository topicRepository;
    private final UserTopicProgressMapper progressMapper;

    private final CustomLogger logger = CustomLogger.getInstance();

    @Override
    @Transactional
    public UserTopicProgressResponseDTO createProgress(UserTopicProgressRequestDTO requestDTO) {
        logger.info("Creating progress record for User ID: " + requestDTO.getUserId() + " and Topic ID: " + requestDTO.getTopicId());

        if (progressRepository.findByUserIdAndTopicId(requestDTO.getUserId(), requestDTO.getTopicId()).isPresent()) {
            throw new InvalidDataException("Progress record already exists for this User and Topic combination.");
        }

        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", requestDTO.getUserId()));

        PreparationTopic topic = topicRepository.findById(requestDTO.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("PreparationTopic", "id", requestDTO.getTopicId()));

        try {
            UserTopicProgress progress = progressMapper.toEntity(requestDTO);
            progress.setUser(user);
            progress.setTopic(topic);

            UserTopicProgress savedProgress = progressRepository.save(progress);
            logger.info("Successfully created UserTopicProgress with ID: " + savedProgress.getId());
            return progressMapper.toDto(savedProgress);
        } catch (Exception e) {
            logger.error("Failed to create UserTopicProgress: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserTopicProgressResponseDTO getProgressById(Long id) {
        logger.info("Fetching UserTopicProgress with ID: " + id);
        UserTopicProgress progress = progressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserTopicProgress", "id", id));
        return progressMapper.toDto(progress);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserTopicProgressResponseDTO> getAllProgress(UserTopicProgressFilterDTO filter, Pageable pageable) {
        logger.info("Fetching paginated list of UserTopicProgress with filters");
        Specification<UserTopicProgress> spec = UserTopicProgressSpecifications.buildSpecification(filter);
        return progressRepository.findAll(spec, pageable).map(progressMapper::toDto);
    }

    @Override
    @Transactional
    public UserTopicProgressResponseDTO updateProgress(Long id, UserTopicProgressRequestDTO requestDTO) {
        logger.info("Attempting to update UserTopicProgress with ID: " + id);

        UserTopicProgress existingProgress = progressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserTopicProgress", "id", id));

        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", requestDTO.getUserId()));

        PreparationTopic topic = topicRepository.findById(requestDTO.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("PreparationTopic", "id", requestDTO.getTopicId()));

        try {
            progressMapper.updateEntityFromDto(requestDTO, existingProgress);
            existingProgress.setUser(user);
            existingProgress.setTopic(topic);

            UserTopicProgress updatedProgress = progressRepository.save(existingProgress);
            logger.info("Successfully updated UserTopicProgress with ID: " + id);
            return progressMapper.toDto(updatedProgress);
        } catch (Exception e) {
            logger.error("Failed to update UserTopicProgress with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteProgress(Long id) {
        logger.info("Attempting to delete UserTopicProgress with ID: " + id);

        if (!progressRepository.existsById(id)) {
            logger.warn("Deletion failed: UserTopicProgress not found with ID: " + id);
            throw new ResourceNotFoundException("UserTopicProgress", "id", id);
        }

        try {
            progressRepository.deleteById(id);
            logger.info("Successfully deleted UserTopicProgress with ID: " + id);
        } catch (Exception e) {
            logger.error("Failed to delete UserTopicProgress with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }
}
package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.dto.PreparationTopicFilterDTO;
import com.me.interview.dashboard.dto.PreparationTopicRequestDTO;
import com.me.interview.dashboard.dto.PreparationTopicResponseDTO;
import com.me.interview.dashboard.model.PreparationTopic;
import com.me.interview.dashboard.exception.InvalidDataException;
import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.mapper.PreparationTopicMapper;
import com.me.interview.dashboard.repository.PreparationTopicRepository;
import com.me.interview.dashboard.service.PreparationTopicService;
import com.me.interview.dashboard.specification.PreparationTopicSpecifications;
import com.me.interview.dashboard.util.CustomLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PreparationTopicServiceImpl implements PreparationTopicService {

    private final PreparationTopicRepository preparationTopicRepository;
    private final PreparationTopicMapper preparationTopicMapper;

    private final CustomLogger logger = CustomLogger.getInstance();

    @Override
    @Transactional
    public PreparationTopicResponseDTO createTopic(PreparationTopicRequestDTO requestDTO) {
        logger.info("Attempting to create Preparation Topic: " + requestDTO.getName());

        PreparationTopic parent = resolveParentTopic(requestDTO.getParentId());

        try {
            PreparationTopic topic = preparationTopicMapper.toEntity(requestDTO);
            topic.setParent(parent);

            PreparationTopic savedTopic = preparationTopicRepository.save(topic);
            logger.info("Successfully created Preparation Topic with ID: " + savedTopic.getId());
            return preparationTopicMapper.toDto(savedTopic);
        } catch (Exception e) {
            logger.error("Failed to create Preparation Topic: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public List<PreparationTopicResponseDTO> createTopicsBulk(List<PreparationTopicRequestDTO> requestDTOs) {
        logger.info("Attempting bulk hierarchical creation of Preparation Topics. Total Root Nodes: " + requestDTOs.size());

        try {
            List<PreparationTopic> savedRootTopics = new ArrayList<>();

            for (PreparationTopicRequestDTO rootDto : requestDTOs) {
                // Pass null as the parent for the root level items
                PreparationTopic savedRoot = saveTopicRecursive(rootDto, null);
                savedRootTopics.add(savedRoot);
            }

            logger.info("Successfully completed bulk hierarchical creation.");
            return savedRootTopics.stream()
                    .map(preparationTopicMapper::toDto)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Failed during bulk creation of Preparation Topics: " + e.getMessage());
            throw e;
        }
    }

    private PreparationTopic saveTopicRecursive(PreparationTopicRequestDTO dto, PreparationTopic parent) {
        // 1. Map basic fields (Manual mapping is safer here to avoid mapper cycle issues)
        PreparationTopic topic = new PreparationTopic();
        topic.setName(dto.getName());
        topic.setDescription(dto.getDescription());
        topic.setCategory(dto.getCategory());

        // 2. Assign the parent (will be null for root nodes)
        topic.setParent(parent);

        // 3. Save to database to generate the ID
        PreparationTopic savedTopic = preparationTopicRepository.save(topic);

        // 4. If this topic has sub-topics, process them recursively
        if (dto.getSubTopics() != null && !dto.getSubTopics().isEmpty()) {
            List<PreparationTopic> savedChildren = new ArrayList<>();

            for (PreparationTopicRequestDTO subDto : dto.getSubTopics()) {
                // The newly saved topic becomes the parent for the next level down
                savedChildren.add(saveTopicRecursive(subDto, savedTopic));
            }

            // Attach the saved children back to the parent entity
            savedTopic.setChildren(savedChildren);
        }

        return savedTopic;
    }

    @Override
    @Transactional(readOnly = true)
    public PreparationTopicResponseDTO getTopicById(Long id) {
        logger.info("Fetching Preparation Topic with ID: " + id);
        PreparationTopic topic = preparationTopicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PreparationTopic", "id", id));
        return preparationTopicMapper.toDto(topic);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PreparationTopicResponseDTO> getTopics(PreparationTopicFilterDTO filter, Pageable pageable) {
        logger.info("Fetching paginated list of Preparation Topics with filters");
        Specification<PreparationTopic> spec = PreparationTopicSpecifications.buildSpecification(filter);
        return preparationTopicRepository.findAll(spec, pageable).map(preparationTopicMapper::toDto);
    }

    @Override
    @Transactional
    public PreparationTopicResponseDTO updateTopic(Long id, PreparationTopicRequestDTO requestDTO) {
        logger.info("Attempting to update Preparation Topic with ID: " + id);

        PreparationTopic existingTopic = preparationTopicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PreparationTopic", "id", id));

        // Prevent a topic from being set as its own parent
        if (id.equals(requestDTO.getParentId())) {
            throw new InvalidDataException("A Preparation Topic cannot be its own parent.");
        }

        PreparationTopic parent = resolveParentTopic(requestDTO.getParentId());

        try {
            preparationTopicMapper.updateEntityFromDto(requestDTO, existingTopic);
            existingTopic.setParent(parent);

            PreparationTopic updatedTopic = preparationTopicRepository.save(existingTopic);
            logger.info("Successfully updated Preparation Topic with ID: " + id);
            return preparationTopicMapper.toDto(updatedTopic);
        } catch (Exception e) {
            logger.error("Failed to update Preparation Topic with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteTopic(Long id) {
        logger.info("Attempting to delete Preparation Topic with ID: " + id);

        if (!preparationTopicRepository.existsById(id)) {
            logger.warn("Deletion failed: Preparation Topic not found with ID: " + id);
            throw new ResourceNotFoundException("PreparationTopic", "id", id);
        }

        // Prevent deletion if the topic has children to avoid orphaned records
        if (preparationTopicRepository.existsByParentId(id)) {
            logger.warn("Deletion blocked: Topic " + id + " contains child topics.");
            throw new InvalidDataException("Cannot delete topic because it has child topics. Delete children first.");
        }

        try {
            preparationTopicRepository.deleteById(id);
            logger.info("Successfully deleted Preparation Topic with ID: " + id);
        } catch (Exception e) {
            logger.error("Failed to delete Preparation Topic with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    private PreparationTopic resolveParentTopic(Long parentId) {
        if (parentId == null) {
            return null;
        }
        return preparationTopicRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("PreparationTopic (Parent)", "id", parentId));
    }
}
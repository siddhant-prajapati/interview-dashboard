package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.dto.PreparationItemFilterDTO;
import com.me.interview.dashboard.dto.PreparationItemRequestDTO;
import com.me.interview.dashboard.dto.PreparationItemResponseDTO;
import com.me.interview.dashboard.model.PreparationItem;
import com.me.interview.dashboard.model.PreparationTopic;
import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.mapper.PreparationItemMapper;
import com.me.interview.dashboard.repository.PreparationItemRepository;
import com.me.interview.dashboard.repository.PreparationTopicRepository;
import com.me.interview.dashboard.service.PreparationItemService;
import com.me.interview.dashboard.specification.PreparationItemSpecifications;
import com.me.interview.dashboard.util.CustomLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PreparationItemServiceImpl implements PreparationItemService {

    private final PreparationItemRepository itemRepository;
    private final PreparationTopicRepository topicRepository;
    private final PreparationItemMapper itemMapper;

    private final CustomLogger logger = CustomLogger.getInstance();

    @Override
    @Transactional
    public PreparationItemResponseDTO createItem(PreparationItemRequestDTO requestDTO) {
        logger.info("Attempting to create Preparation Item: " + requestDTO.getTitle());

        PreparationTopic topic = topicRepository.findById(requestDTO.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("PreparationTopic", "id", requestDTO.getTopicId()));

        try {
            PreparationItem item = itemMapper.toEntity(requestDTO);
            item.setTopic(topic);

            // Auto-set completed date if immediately marked completed
            if (Boolean.TRUE.equals(requestDTO.getCompleted())) {
                item.setCompletedAt(LocalDate.now());
            }

            PreparationItem savedItem = itemRepository.save(item);
            logger.info("Successfully created Preparation Item with ID: " + savedItem.getId());
            return itemMapper.toDto(savedItem);
        } catch (Exception e) {
            logger.error("Failed to create Preparation Item: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PreparationItemResponseDTO getItemById(Long id) {
        logger.info("Fetching Preparation Item with ID: " + id);
        PreparationItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PreparationItem", "id", id));
        return itemMapper.toDto(item);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PreparationItemResponseDTO> getItems(PreparationItemFilterDTO filter, Pageable pageable) {
        logger.info("Fetching paginated list of Preparation Items with filters");
        Specification<PreparationItem> spec = PreparationItemSpecifications.buildSpecification(filter);
        return itemRepository.findAll(spec, pageable).map(itemMapper::toDto);
    }

    @Override
    @Transactional
    public PreparationItemResponseDTO updateItem(Long id, PreparationItemRequestDTO requestDTO) {
        logger.info("Attempting to update Preparation Item with ID: " + id);

        PreparationItem existingItem = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PreparationItem", "id", id));

        PreparationTopic topic = topicRepository.findById(requestDTO.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("PreparationTopic", "id", requestDTO.getTopicId()));

        try {
            boolean wasNotCompleted = !Boolean.TRUE.equals(existingItem.getCompleted());

            itemMapper.updateEntityFromDto(requestDTO, existingItem);
            existingItem.setTopic(topic);

            // Handle completion date logic
            if (Boolean.TRUE.equals(requestDTO.getCompleted()) && wasNotCompleted) {
                existingItem.setCompletedAt(LocalDate.now());
            } else if (!Boolean.TRUE.equals(requestDTO.getCompleted())) {
                existingItem.setCompletedAt(null);
            }

            PreparationItem updatedItem = itemRepository.save(existingItem);
            logger.info("Successfully updated Preparation Item with ID: " + id);
            return itemMapper.toDto(updatedItem);
        } catch (Exception e) {
            logger.error("Failed to update Preparation Item with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteItem(Long id) {
        logger.info("Attempting to delete Preparation Item with ID: " + id);

        if (!itemRepository.existsById(id)) {
            logger.warn("Deletion failed: Preparation Item not found with ID: " + id);
            throw new ResourceNotFoundException("PreparationItem", "id", id);
        }

        try {
            itemRepository.deleteById(id);
            logger.info("Successfully deleted Preparation Item with ID: " + id);
        } catch (Exception e) {
            logger.error("Failed to delete Preparation Item with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }
}
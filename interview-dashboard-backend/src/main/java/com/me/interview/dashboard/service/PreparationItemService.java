package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.PreparationItemFilterDTO;
import com.me.interview.dashboard.dto.PreparationItemRequestDTO;
import com.me.interview.dashboard.dto.PreparationItemResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PreparationItemService {
    PreparationItemResponseDTO createItem(PreparationItemRequestDTO requestDTO);
    List<PreparationItemResponseDTO> createItemsBulk(List<PreparationItemRequestDTO> requestDTOs);
    PreparationItemResponseDTO getItemById(Long id);
    Page<PreparationItemResponseDTO> getItems(PreparationItemFilterDTO filter, Pageable pageable);
    PreparationItemResponseDTO updateItem(Long id, PreparationItemRequestDTO requestDTO);
    void deleteItem(Long id);
}
package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.PlatformFilterDTO;
import com.me.interview.dashboard.dto.PlatformRequestDTO;
import com.me.interview.dashboard.dto.PlatformResponseDTO;
import com.me.interview.dashboard.service.PlatformService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlatformControllerTest {

    @Mock
    private PlatformService platformService;

    @InjectMocks
    private PlatformController platformController;

    private PlatformRequestDTO sampleRequestDTO;
    private PlatformResponseDTO sampleResponseDTO;

    @BeforeEach
    void setUp() {
        sampleRequestDTO = new PlatformRequestDTO();
        sampleRequestDTO.setName("LinkedIn");
        sampleRequestDTO.setAccountLink("https://linkedin.com/in/johndoe");
        sampleRequestDTO.setJobPostCount(5);
        sampleRequestDTO.setUserId(1L);

        sampleResponseDTO = new PlatformResponseDTO();
        sampleResponseDTO.setId(10L);
        sampleResponseDTO.setName("LinkedIn");
        sampleResponseDTO.setAccountLink("https://linkedin.com/in/johndoe");
        sampleResponseDTO.setJobPostCount(5);
        sampleResponseDTO.setUserId(1L);
    }

    @Test
    @DisplayName("createPlatform should return 201 Created and response DTO")
    void testCreatePlatform() {
        when(platformService.createPlatform(sampleRequestDTO)).thenReturn(sampleResponseDTO);

        ResponseEntity<PlatformResponseDTO> response = platformController.createPlatform(sampleRequestDTO);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(sampleResponseDTO);
        verify(platformService, times(1)).createPlatform(sampleRequestDTO);
    }

    @Test
    @DisplayName("createPlatformsBulk should return 201 Created and list of platforms")
    void testCreatePlatformsBulk() {
        List<PlatformRequestDTO> dtoList = List.of(sampleRequestDTO);
        List<PlatformResponseDTO> responseList = List.of(sampleResponseDTO);
        when(platformService.createPlatformsBulk(dtoList)).thenReturn(responseList);

        ResponseEntity<List<PlatformResponseDTO>> response = platformController.createPlatformsBulk(dtoList);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(responseList);
        verify(platformService, times(1)).createPlatformsBulk(dtoList);
    }

    @Test
    @DisplayName("getPlatformById should return 200 OK and response DTO")
    void testGetPlatformById() {
        when(platformService.getPlatformById(10L)).thenReturn(sampleResponseDTO);

        ResponseEntity<PlatformResponseDTO> response = platformController.getPlatformById(10L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(sampleResponseDTO);
        verify(platformService, times(1)).getPlatformById(10L);
    }

    @Test
    @DisplayName("getPlatforms should return 200 OK and paginated platforms")
    void testGetPlatforms() {
        PlatformFilterDTO filter = new PlatformFilterDTO();
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "id"));
        Page<PlatformResponseDTO> page = new PageImpl<>(List.of(sampleResponseDTO));
        when(platformService.getPlatforms(filter, pageable)).thenReturn(page);

        ResponseEntity<Page<PlatformResponseDTO>> response = platformController.getPlatforms(filter, 0, 10, "id", "asc");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
        verify(platformService, times(1)).getPlatforms(filter, pageable);
    }

    @Test
    @DisplayName("getPlatformsByUserId should return 200 OK and user platforms")
    void testGetPlatformsByUserId() {
        List<PlatformResponseDTO> responseList = List.of(sampleResponseDTO);
        when(platformService.getPlatformsByUserId(1L)).thenReturn(responseList);

        ResponseEntity<List<PlatformResponseDTO>> response = platformController.getPlatformsByUserId(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseList);
        verify(platformService, times(1)).getPlatformsByUserId(1L);
    }

    @Test
    @DisplayName("updatePlatform should return 200 OK and updated platform")
    void testUpdatePlatform() {
        when(platformService.updatePlatform(10L, sampleRequestDTO)).thenReturn(sampleResponseDTO);

        ResponseEntity<PlatformResponseDTO> response = platformController.updatePlatform(10L, sampleRequestDTO);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(sampleResponseDTO);
        verify(platformService, times(1)).updatePlatform(10L, sampleRequestDTO);
    }

    @Test
    @DisplayName("deletePlatform should return 204 No Content")
    void testDeletePlatform() {
        doNothing().when(platformService).deletePlatform(10L);

        ResponseEntity<Void> response = platformController.deletePlatform(10L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(platformService, times(1)).deletePlatform(10L);
    }
}

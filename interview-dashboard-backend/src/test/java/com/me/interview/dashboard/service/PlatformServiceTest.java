package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.PlatformFilterDTO;
import com.me.interview.dashboard.dto.PlatformRequestDTO;
import com.me.interview.dashboard.dto.PlatformResponseDTO;
import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.mapper.PlatformMapper;
import com.me.interview.dashboard.model.Platform;
import com.me.interview.dashboard.model.User;
import com.me.interview.dashboard.repository.PlatformRepository;
import com.me.interview.dashboard.repository.UserRepository;
import com.me.interview.dashboard.service.impl.PlatformServiceImpl;
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
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlatformServiceTest {

    @Mock
    private PlatformRepository platformRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PlatformMapper platformMapper;

    @InjectMocks
    private PlatformServiceImpl platformService;

    private User sampleUser;
    private Platform samplePlatform;
    private PlatformRequestDTO sampleRequestDTO;
    private PlatformResponseDTO sampleResponseDTO;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("john_doe")
                .email("john@example.com")
                .build();

        samplePlatform = Platform.builder()
                .id(10L)
                .name("LinkedIn")
                .accountLink("https://linkedin.com/in/johndoe")
                .lastUpdatedDate(LocalDateTime.now())
                .jobPostCount(5)
                .user(sampleUser)
                .build();

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
    @DisplayName("createPlatform should save platform and return response DTO")
    void testCreatePlatform_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(platformMapper.toEntity(sampleRequestDTO)).thenReturn(samplePlatform);
        when(platformRepository.save(samplePlatform)).thenReturn(samplePlatform);
        when(platformMapper.toDto(samplePlatform)).thenReturn(sampleResponseDTO);

        PlatformResponseDTO result = platformService.createPlatform(sampleRequestDTO);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getName()).isEqualTo("LinkedIn");
        verify(userRepository, times(1)).findById(1L);
        verify(platformRepository, times(1)).save(samplePlatform);
    }

    @Test
    @DisplayName("createPlatform should throw ResourceNotFoundException when user does not exist")
    void testCreatePlatform_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> platformService.createPlatform(sampleRequestDTO))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with id : '1'");

        verify(platformRepository, never()).save(any());
    }

    @Test
    @DisplayName("createPlatformsBulk should process multiple requests successfully")
    void testCreatePlatformsBulk_Success() {
        List<PlatformRequestDTO> dtoList = List.of(sampleRequestDTO);
        List<Platform> entityList = List.of(samplePlatform);
        List<PlatformResponseDTO> responseList = List.of(sampleResponseDTO);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(platformMapper.toEntity(sampleRequestDTO)).thenReturn(samplePlatform);
        when(platformRepository.saveAll(anyList())).thenReturn(entityList);
        when(platformMapper.toDtoList(entityList)).thenReturn(responseList);

        List<PlatformResponseDTO> result = platformService.createPlatformsBulk(dtoList);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("LinkedIn");
        verify(platformRepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("createPlatformsBulk should return empty list when input is empty")
    void testCreatePlatformsBulk_Empty() {
        List<PlatformResponseDTO> result = platformService.createPlatformsBulk(Collections.emptyList());
        assertThat(result).isEmpty();
        verify(platformRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("getPlatformById should return DTO when entity exists")
    void testGetPlatformById_Success() {
        when(platformRepository.findById(10L)).thenReturn(Optional.of(samplePlatform));
        when(platformMapper.toDto(samplePlatform)).thenReturn(sampleResponseDTO);

        PlatformResponseDTO result = platformService.getPlatformById(10L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("getPlatformById should throw ResourceNotFoundException when not found")
    void testGetPlatformById_NotFound() {
        when(platformRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> platformService.getPlatformById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Platform not found with id : '99'");
    }

    @Test
    @DisplayName("getPlatforms should return paginated list")
    void testGetPlatforms() {
        PlatformFilterDTO filter = new PlatformFilterDTO();
        filter.setName("LinkedIn");
        Pageable pageable = PageRequest.of(0, 10);
        Page<Platform> page = new PageImpl<>(List.of(samplePlatform));

        when(platformRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);
        when(platformMapper.toDto(samplePlatform)).thenReturn(sampleResponseDTO);

        Page<PlatformResponseDTO> result = platformService.getPlatforms(filter, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("getPlatformsByUserId should return user platforms")
    void testGetPlatformsByUserId_Success() {
        when(userRepository.existsById(1L)).thenReturn(true);
        when(platformRepository.findByUserId(1L)).thenReturn(List.of(samplePlatform));
        when(platformMapper.toDtoList(List.of(samplePlatform))).thenReturn(List.of(sampleResponseDTO));

        List<PlatformResponseDTO> result = platformService.getPlatformsByUserId(1L);

        assertThat(result).hasSize(1);
        verify(platformRepository, times(1)).findByUserId(1L);
    }

    @Test
    @DisplayName("getPlatformsByUserId should throw ResourceNotFoundException if user does not exist")
    void testGetPlatformsByUserId_UserNotFound() {
        when(userRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> platformService.getPlatformsByUserId(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with id : '99'");
    }

    @Test
    @DisplayName("updatePlatform should update existing entity")
    void testUpdatePlatform_Success() {
        when(platformRepository.findById(10L)).thenReturn(Optional.of(samplePlatform));
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(platformRepository.save(samplePlatform)).thenReturn(samplePlatform);
        when(platformMapper.toDto(samplePlatform)).thenReturn(sampleResponseDTO);

        PlatformResponseDTO result = platformService.updatePlatform(10L, sampleRequestDTO);

        assertThat(result).isNotNull();
        verify(platformMapper, times(1)).updateEntityFromDto(sampleRequestDTO, samplePlatform);
        verify(platformRepository, times(1)).save(samplePlatform);
    }

    @Test
    @DisplayName("deletePlatform should delete entity when found")
    void testDeletePlatform_Success() {
        when(platformRepository.existsById(10L)).thenReturn(true);

        platformService.deletePlatform(10L);

        verify(platformRepository, times(1)).deleteById(10L);
    }

    @Test
    @DisplayName("deletePlatform should throw ResourceNotFoundException when not found")
    void testDeletePlatform_NotFound() {
        when(platformRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> platformService.deletePlatform(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Platform not found with id : '99'");

        verify(platformRepository, never()).deleteById(anyLong());
    }
}

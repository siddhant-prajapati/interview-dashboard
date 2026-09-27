package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.UserFilterDTO;
import com.me.interview.dashboard.dto.UserRequestDTO;
import com.me.interview.dashboard.dto.UserResponseDTO;
import com.me.interview.dashboard.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private UserRequestDTO userRequestDTO;
    private UserResponseDTO userResponseDTO;

    @BeforeEach
    void setUp() {
        userRequestDTO = new UserRequestDTO();
        userRequestDTO.setUsername("john_doe");
        userRequestDTO.setEmail("john@example.com");

        userResponseDTO = new UserResponseDTO();
        userResponseDTO.setId(1L);
        userResponseDTO.setUsername("john_doe");
        userResponseDTO.setEmail("john@example.com");
    }

    @Test
    @DisplayName("getUsers should construct Pageable with ascending sort from query params")
    void testGetUsers_Ascending() {
        UserFilterDTO filter = new UserFilterDTO();
        Page<UserResponseDTO> page = new PageImpl<>(List.of(userResponseDTO));
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);

        when(userService.getUsers(eq(filter), any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<UserResponseDTO>> response = userController.getUsers(filter, 0, 10, "username", "asc");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();

        verify(userService, times(1)).getUsers(eq(filter), pageableCaptor.capture());
        Pageable capturedPageable = pageableCaptor.getValue();
        assertThat(capturedPageable.getPageNumber()).isEqualTo(0);
        assertThat(capturedPageable.getPageSize()).isEqualTo(10);
        assertThat(capturedPageable.getSort().getOrderFor("username")).isNotNull();
        assertThat(capturedPageable.getSort().getOrderFor("username").getDirection()).isEqualTo(Sort.Direction.ASC);
    }

    @Test
    @DisplayName("getUsers should construct Pageable with descending sort when sort=desc")
    void testGetUsers_Descending() {
        UserFilterDTO filter = new UserFilterDTO();
        Page<UserResponseDTO> page = new PageImpl<>(List.of(userResponseDTO));
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);

        when(userService.getUsers(eq(filter), any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<UserResponseDTO>> response = userController.getUsers(filter, 2, 25, "createdAt", "desc");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        verify(userService, times(1)).getUsers(eq(filter), pageableCaptor.capture());
        Pageable capturedPageable = pageableCaptor.getValue();
        assertThat(capturedPageable.getPageNumber()).isEqualTo(2);
        assertThat(capturedPageable.getPageSize()).isEqualTo(25);
        assertThat(capturedPageable.getSort().getOrderFor("createdAt")).isNotNull();
        assertThat(capturedPageable.getSort().getOrderFor("createdAt").getDirection()).isEqualTo(Sort.Direction.DESC);
    }
}

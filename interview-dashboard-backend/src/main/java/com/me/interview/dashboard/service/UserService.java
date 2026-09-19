package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.UserFilterDTO;
import com.me.interview.dashboard.dto.UserRequestDTO;
import com.me.interview.dashboard.dto.UserResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponseDTO createUser(UserRequestDTO requestDTO);
    UserResponseDTO getUserById(Long id);
    Page<UserResponseDTO> getUsers(UserFilterDTO filter, Pageable pageable);
    UserResponseDTO updateUser(Long id, UserRequestDTO requestDTO);
    void deleteUser(Long id);
}
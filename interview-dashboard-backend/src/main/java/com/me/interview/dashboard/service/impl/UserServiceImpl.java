package com.me.interview.dashboard.service.impl;


import com.me.interview.dashboard.dto.UserFilterDTO;
import com.me.interview.dashboard.dto.UserRequestDTO;
import com.me.interview.dashboard.dto.UserResponseDTO;
import com.me.interview.dashboard.model.User;
import com.me.interview.dashboard.exception.InvalidDataException;
import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.mapper.UserMapper;
import com.me.interview.dashboard.repository.UserRepository;
import com.me.interview.dashboard.service.UserService;
import com.me.interview.dashboard.specification.UserSpecifications;
import com.me.interview.dashboard.util.CustomLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CustomLogger logger = CustomLogger.getInstance();

    @Override
    @Transactional
    public UserResponseDTO createUser(UserRequestDTO requestDTO) {
        logger.info("Attempting to create a new User with username: " + requestDTO.getUsername());

        if (userRepository.existsByUsername(requestDTO.getUsername())) {
            logger.warn("Creation failed: Username already exists - " + requestDTO.getUsername());
            throw new InvalidDataException("Username is already taken");
        }

        try {
            User user = userMapper.toEntity(requestDTO);
            user.setCreatedAt(LocalDateTime.now());

            User savedUser = userRepository.save(user);
            logger.info("Successfully created User with ID: " + savedUser.getId());
            return userMapper.toDto(savedUser);
        } catch (Exception e) {
            logger.error("Failed to create User: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        logger.info("Fetching User with ID: " + id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getUsers(UserFilterDTO filter, Pageable pageable) {
        logger.info("Fetching paginated list of Users with filters applied");
        Specification<User> spec = UserSpecifications.buildSpecification(filter);
        return userRepository.findAll(spec, pageable).map(userMapper::toDto);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, UserRequestDTO requestDTO) {
        logger.info("Attempting to update User with ID: " + id);

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (!existingUser.getUsername().equals(requestDTO.getUsername()) &&
                userRepository.existsByUsername(requestDTO.getUsername())) {
            logger.warn("Update failed: Username already exists - " + requestDTO.getUsername());
            throw new InvalidDataException("Username is already taken");
        }

        try {
            userMapper.updateEntityFromDto(requestDTO, existingUser);
            User updatedUser = userRepository.save(existingUser);

            logger.info("Successfully updated User with ID: " + id);
            return userMapper.toDto(updatedUser);
        } catch (Exception e) {
            logger.error("Failed to update User with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        logger.info("Attempting to delete User with ID: " + id);

        if (!userRepository.existsById(id)) {
            logger.warn("Deletion failed: User not found with ID: " + id);
            throw new ResourceNotFoundException("User", "id", id);
        }

        try {
            userRepository.deleteById(id);
            logger.info("Successfully deleted User with ID: " + id);
        } catch (Exception e) {
            logger.error("Failed to delete User with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }
}
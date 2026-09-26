package com.me.interview.dashboard.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserRequestDTO {
    private String username;
    private String email;
    private String name;
    private Double experience;
    private List<String> roles;
    private String portfolioLink;
    private String githubLink;
    private String hackerrankLink;
    private String leetcodeLink;
}
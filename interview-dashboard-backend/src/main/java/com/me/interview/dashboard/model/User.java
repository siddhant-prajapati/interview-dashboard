package com.me.interview.dashboard.model;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    private String email;

    private String name;

    private Double experience;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private List<String> roles = new ArrayList<>();

    @Column(name = "portfolio_link")
    private String portfolioLink;

    @Column(name = "github_link")
    private String githubLink;

    @Column(name = "hackerrank_link")
    private String hackerrankLink;

    @Column(name = "leetcode_link")
    private String leetcodeLink;

    private LocalDateTime createdAt;
}
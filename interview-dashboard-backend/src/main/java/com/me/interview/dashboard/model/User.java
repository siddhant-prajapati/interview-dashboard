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
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "email")
    private String email;

    @Column(name = "name")
    private String name;

    @Column(name = "experience")
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

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "linkedin_link")
    private String linkedInLink;

    @Builder.Default
    @ManyToMany
    @JoinTable(
            name = "user_companies",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "company_id")
    )
    private List<Company> companies = new ArrayList<>();
}
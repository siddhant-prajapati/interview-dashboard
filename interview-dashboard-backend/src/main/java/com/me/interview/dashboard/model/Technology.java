package com.me.interview.dashboard.model;

import com.me.interview.dashboard.enumeration.TechnologyType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "technologies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Technology {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50)
    private TechnologyType type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
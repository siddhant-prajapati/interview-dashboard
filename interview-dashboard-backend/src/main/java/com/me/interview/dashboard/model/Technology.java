package com.me.interview.dashboard.model;

import com.me.interview.dashboard.enumeration.TechnologyType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.beans.factory.annotation.Value;

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
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    private TechnologyType type;

    private String description;
}
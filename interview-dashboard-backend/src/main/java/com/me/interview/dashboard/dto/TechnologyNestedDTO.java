package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.TechnologyType;
import lombok.Data;

@Data
public class TechnologyNestedDTO {
    private Long id; // Null if new, populated if existing
    private String name;
    private TechnologyType type;
    private Double experience;
    private Double currentProficiency;
}

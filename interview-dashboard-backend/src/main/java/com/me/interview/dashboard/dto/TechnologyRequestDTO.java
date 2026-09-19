package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.TechnologyType;
import lombok.Data;

@Data
public class TechnologyRequestDTO {
    private String name;
    private TechnologyType type;
    private Double experience;
    private Integer currentProficiency;
}

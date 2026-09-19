package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.TechnologyType;
import lombok.Data;

@Data
public class TechnologyFilterDTO {
    private String name;
    private TechnologyType type;
}

package com.me.interview.dashboard.dto;

import lombok.Data;

@Data
public class CompanyFilterDTO {
    private String name;
    private Boolean technologyTest;
    private String location;
    private String allowedJobType;
}
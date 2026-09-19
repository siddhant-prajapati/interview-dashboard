package com.me.interview.dashboard.dto;


import com.me.interview.dashboard.enumeration.JobType;
import lombok.Data;

import java.util.List;

@Data
public class CompanyRequestDTO {
    private String name;
    private Boolean technologyTest;
    private String workOn;
    private List<JobType> allowedJobType;
    private String contactNumber;
    private String email;
    private String location;
}

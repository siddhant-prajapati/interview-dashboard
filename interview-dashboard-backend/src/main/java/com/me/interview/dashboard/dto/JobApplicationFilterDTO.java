package com.me.interview.dashboard.dto;


import com.me.interview.dashboard.enumeration.ApplicationStatus;
import com.me.interview.dashboard.enumeration.JobType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class JobApplicationFilterDTO {
    private String platform;
    private String role;
    private ApplicationStatus status;
    private JobType jobType;
    private Long companyId;
    private LocalDate applyDateStart;
    private LocalDate applyDateEnd;
}

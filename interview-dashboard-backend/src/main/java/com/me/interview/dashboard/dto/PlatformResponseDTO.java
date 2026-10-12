package com.me.interview.dashboard.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PlatformResponseDTO extends PlatformRequestDTO {
    private Long id;
}

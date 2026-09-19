package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.CompanyFilterDTO;
import com.me.interview.dashboard.dto.CompanyRequestDTO;
import com.me.interview.dashboard.dto.CompanyResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CompanyService {

    CompanyResponseDTO createCompany(CompanyRequestDTO requestDTO);

    CompanyResponseDTO getCompanyById(Long id);

    Page<CompanyResponseDTO> getCompanies(CompanyFilterDTO filter, Pageable pageable);

    CompanyResponseDTO updateCompany(Long id, CompanyRequestDTO requestDTO);

    void deleteCompany(Long id);
}

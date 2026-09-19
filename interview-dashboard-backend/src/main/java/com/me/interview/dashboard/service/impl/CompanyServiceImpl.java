package com.me.interview.dashboard.service.impl;


import com.me.interview.dashboard.dto.CompanyFilterDTO;
import com.me.interview.dashboard.dto.CompanyRequestDTO;
import com.me.interview.dashboard.dto.CompanyResponseDTO;
import com.me.interview.dashboard.model.Company;
import com.me.interview.dashboard.mapper.CompanyMapper;
import com.me.interview.dashboard.repository.CompanyRepository;
import com.me.interview.dashboard.service.CompanyService;
import com.me.interview.dashboard.specification.CompanySpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    @Override
    @Transactional
    public CompanyResponseDTO createCompany(CompanyRequestDTO requestDTO) {
        Company company = companyMapper.toEntity(requestDTO);
        Company savedCompany = companyRepository.save(company);
        return companyMapper.toDto(savedCompany);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDTO getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
        return companyMapper.toDto(company);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CompanyResponseDTO> getCompanies(CompanyFilterDTO filter, Pageable pageable) {
        Specification<Company> spec = CompanySpecifications.buildSpecification(filter);
        return companyRepository.findAll(spec, pageable)
                .map(companyMapper::toDto);
    }

    @Override
    @Transactional
    public CompanyResponseDTO updateCompany(Long id, CompanyRequestDTO requestDTO) {
        Company existingCompany = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));

        companyMapper.updateEntityFromDto(requestDTO, existingCompany);

        Company updatedCompany = companyRepository.save(existingCompany);
        return companyMapper.toDto(updatedCompany);
    }

    @Override
    @Transactional
    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new RuntimeException("Company not found with id: " + id);
        }
        companyRepository.deleteById(id);
    }
}
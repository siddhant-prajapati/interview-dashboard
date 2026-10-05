package com.me.interview.dashboard.service;

import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.model.Company;
import com.me.interview.dashboard.model.JobApplication;
import com.me.interview.dashboard.model.Technology;
import com.me.interview.dashboard.model.User;
import com.me.interview.dashboard.repository.JobApplicationRepository;
import com.me.interview.dashboard.repository.UserRepository;
import com.me.interview.dashboard.service.impl.EmailPromptGeneratorServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailPromptGeneratorServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @InjectMocks
    private EmailPromptGeneratorServiceImpl promptGeneratorService;

    private User sampleUser;
    private JobApplication sampleJobApplication;
    private Company sampleCompany;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Siddhant Prajapati")
                .experience(3.0)
                .roles(List.of("Java Developer", "Full Stack Developer"))
                .linkedInLink("https://linkedin.com/in/siddhant")
                .portfolioLink("https://siddhant.dev")
                .githubLink("https://github.com/siddhant")
                .build();

        sampleCompany = Company.builder()
                .id(10L)
                .name("Acme Corp")
                .build();

        Technology javaTech = Technology.builder().id(100L).name("Java").build();
        Technology springTech = Technology.builder().id(101L).name("Spring Boot").build();

        sampleJobApplication = JobApplication.builder()
                .id(20L)
                .role("Senior Backend Engineer")
                .company(sampleCompany)
                .about("We are seeking a senior backend engineer proficient in Java and microservices.")
                .technologies(List.of(javaTech, springTech))
                .build();
    }

    @Test
    @DisplayName("generateAlignmentAndTopicsPrompt with entities returns formatted prompt")
    void testGenerateAlignmentAndTopicsPrompt_WithEntities() {
        String prompt = promptGeneratorService.generateAlignmentAndTopicsPrompt(sampleUser, sampleJobApplication);

        assertThat(prompt).isNotBlank();
        assertThat(prompt).contains("Siddhant Prajapati");
        assertThat(prompt).contains("3.0 years");
        assertThat(prompt).contains("Java Developer, Full Stack Developer");
        assertThat(prompt).contains("Senior Backend Engineer");
        assertThat(prompt).contains("Acme Corp");
        assertThat(prompt).contains("Java, Spring Boot");
        assertThat(prompt).contains("We are seeking a senior backend engineer proficient in Java and microservices.");
    }

    @Test
    @DisplayName("generateAlignmentAndTopicsPrompt with entity containing null fields gracefully falls back")
    void testGenerateAlignmentAndTopicsPrompt_WithNullFields() {
        User emptyUser = User.builder().id(2L).build();
        JobApplication emptyJobApp = JobApplication.builder().id(3L).build();

        String prompt = promptGeneratorService.generateAlignmentAndTopicsPrompt(emptyUser, emptyJobApp);

        assertThat(prompt).isNotBlank();
        assertThat(prompt).contains("Candidate");
        assertThat(prompt).contains("0.0 years");
        assertThat(prompt).contains("Not specified");
        assertThat(prompt).contains("Not provided");
        assertThat(prompt).contains("Unknown Role");
        assertThat(prompt).contains("Unknown Company");
        assertThat(prompt).contains("No description provided.");
    }

    @Test
    @DisplayName("generateAlignmentAndTopicsPrompt by ID successfully fetches entities and generates prompt")
    void testGenerateAlignmentAndTopicsPrompt_ById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(jobApplicationRepository.findById(20L)).thenReturn(Optional.of(sampleJobApplication));

        String prompt = promptGeneratorService.generateAlignmentAndTopicsPrompt(1L, 20L);

        assertThat(prompt).isNotBlank();
        assertThat(prompt).contains("Siddhant Prajapati");
        assertThat(prompt).contains("Senior Backend Engineer");
        verify(userRepository, times(1)).findById(1L);
        verify(jobApplicationRepository, times(1)).findById(20L);
    }

    @Test
    @DisplayName("generateAlignmentAndTopicsPrompt by ID throws ResourceNotFoundException if user not found")
    void testGenerateAlignmentAndTopicsPrompt_UserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> promptGeneratorService.generateAlignmentAndTopicsPrompt(99L, 20L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with id : '99'");

        verify(jobApplicationRepository, never()).findById(any());
    }

    @Test
    @DisplayName("generateAlignmentAndTopicsPrompt by ID throws ResourceNotFoundException if job application not found")
    void testGenerateAlignmentAndTopicsPrompt_JobApplicationNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(jobApplicationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> promptGeneratorService.generateAlignmentAndTopicsPrompt(1L, 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("JobApplication not found with id : '99'");
    }

    @Test
    @DisplayName("generateFollowUpEmailPrompt with entities returns formatted prompt")
    void testGenerateFollowUpEmailPrompt_WithEntities() {
        String prompt = promptGeneratorService.generateFollowUpEmailPrompt(
                sampleUser,
                sampleJobApplication,
                1,
                5,
                "Applied via careers page"
        );

        assertThat(prompt).isNotBlank();
        assertThat(prompt).contains("Siddhant Prajapati");
        assertThat(prompt).contains("Senior Backend Engineer");
        assertThat(prompt).contains("Acme Corp");
        assertThat(prompt).contains("Follow-Up Number: 1");
        assertThat(prompt).contains("Days Since Last Contact: 5 days");
        assertThat(prompt).contains("Applied via careers page");
    }

    @Test
    @DisplayName("generateFollowUpEmailPrompt by ID successfully fetches entities and generates prompt")
    void testGenerateFollowUpEmailPrompt_ById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(jobApplicationRepository.findById(20L)).thenReturn(Optional.of(sampleJobApplication));

        String prompt = promptGeneratorService.generateFollowUpEmailPrompt(
                1L,
                20L,
                2,
                10,
                null
        );

        assertThat(prompt).isNotBlank();
        assertThat(prompt).contains("Follow-Up Number: 2");
        assertThat(prompt).contains("Days Since Last Contact: 10 days");
        assertThat(prompt).contains("Submitted application");
        verify(userRepository, times(1)).findById(1L);
        verify(jobApplicationRepository, times(1)).findById(20L);
    }
}

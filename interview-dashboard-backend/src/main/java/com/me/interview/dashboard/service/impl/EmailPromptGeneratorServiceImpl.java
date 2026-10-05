package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.model.JobApplication;
import com.me.interview.dashboard.model.Technology;
import com.me.interview.dashboard.model.User;
import com.me.interview.dashboard.repository.JobApplicationRepository;
import com.me.interview.dashboard.repository.UserRepository;
import com.me.interview.dashboard.service.EmailPromptGeneratorService;
import com.me.interview.dashboard.util.CustomLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailPromptGeneratorServiceImpl implements EmailPromptGeneratorService {

    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CustomLogger logger = CustomLogger.getInstance();

    @Override
    @Transactional(readOnly = true)
    public String generateAlignmentAndTopicsPrompt(Long userId, Long jobApplicationId) {
        logger.info("Generating alignment and topics prompt for userId: " + userId + ", jobApplicationId: " + jobApplicationId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        JobApplication jobApplication = jobApplicationRepository.findById(jobApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", jobApplicationId));

        return generateAlignmentAndTopicsPrompt(user, jobApplication);
    }

    @Override
    public String generateAlignmentAndTopicsPrompt(User user, JobApplication jobApplication) {
        String userSkills = (user.getRoles() != null && !user.getRoles().isEmpty()) 
                ? String.join(", ", user.getRoles()) 
                : "Not specified";

        List<String> linksList = new ArrayList<>();
        if (user.getLinkedInLink() != null && !user.getLinkedInLink().isBlank()) {
            linksList.add("LinkedIn: " + user.getLinkedInLink());
        }
        if (user.getPortfolioLink() != null && !user.getPortfolioLink().isBlank()) {
            linksList.add("Portfolio: " + user.getPortfolioLink());
        }
        if (user.getGithubLink() != null && !user.getGithubLink().isBlank()) {
            linksList.add("GitHub: " + user.getGithubLink());
        }
        String candidateLinks = linksList.isEmpty() ? "Not provided" : String.join(" | ", linksList);

        String role = jobApplication.getRole() != null ? jobApplication.getRole() : "Unknown Role";
        String companyName = (jobApplication.getCompany() != null && jobApplication.getCompany().getName() != null)
                ? jobApplication.getCompany().getName()
                : "Unknown Company";
        String description = (jobApplication.getAbout() != null && !jobApplication.getAbout().isBlank())
                ? jobApplication.getAbout()
                : "No description provided.";
        String technologies = (jobApplication.getTechnologies() != null && !jobApplication.getTechnologies().isEmpty())
                ? jobApplication.getTechnologies().stream().map(Technology::getName).collect(Collectors.joining(", "))
                : "Not specified";

        String promptTemplate = """
                You are an expert technical recruiter and senior software engineering mentor. 
                I need you to analyze a candidate's profile against a specific job application.
                
                ### Candidate Profile (User Data)
                - Name: %s
                - Experience: %s years
                - Current Skills & Technologies: %s
                - LinkedIn/Portfolio: %s
                
                ### Job Application Details
                - Job Title: %s
                - Company: %s
                - Key Technologies: %s
                - Job Description / Requirements: 
                %s
                
                ### Your Task:
                Please generate a structured email response addressed to the candidate that covers the following:
                
                1. **Skill Alignment Analysis**: 
                   - Compare the candidate's current skills against the job description.
                   - Highlight strong matches (where the candidate excels).
                   - Identify clear skill gaps or areas where the candidate lacks experience mentioned in the job description.
                
                2. **Customized Preparation Topics**:
                   - Based on the identified gaps and the core requirements of the job description, generate a prioritized list of interview preparation topics.
                   - Group these topics into categories (e.g., System Design, DSA, Framework-specific, Language-specific).
                   - Provide a brief 1-sentence reason why each topic is crucial for this specific role.
                
                Format the output strictly in clean Markdown so it can be directly sent as an email body. Be encouraging but highly analytical and precise.
                """;

        return String.format(
                promptTemplate,
                user.getName() != null ? user.getName() : "Candidate",
                user.getExperience() != null ? user.getExperience() : 0.0,
                userSkills,
                candidateLinks,
                role,
                companyName,
                technologies,
                description
        );
    }

    @Override
    @Transactional(readOnly = true)
    public String generateFollowUpEmailPrompt(Long userId, Long jobApplicationId, int followUpNumber, int daysSinceLastContact, String lastInteractionContext) {
        logger.info("Generating follow-up email prompt for userId: " + userId + ", jobApplicationId: " + jobApplicationId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        JobApplication jobApplication = jobApplicationRepository.findById(jobApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", jobApplicationId));

        return generateFollowUpEmailPrompt(user, jobApplication, followUpNumber, daysSinceLastContact, lastInteractionContext);
    }

    @Override
    public String generateFollowUpEmailPrompt(User user, JobApplication jobApplication, int followUpNumber, int daysSinceLastContact, String lastInteractionContext) {
        String role = jobApplication.getRole() != null ? jobApplication.getRole() : "the open position";
        String companyName = (jobApplication.getCompany() != null && jobApplication.getCompany().getName() != null)
                ? jobApplication.getCompany().getName()
                : "your company";

        String promptTemplate = """
                You are an expert career coach and professional technical copywriter.
                I need you to write a polite, concise, and highly professional follow-up email to a hiring manager or recruiter.
                
                ### Context for the Follow-Up
                - Candidate Name: %s
                - Job Title: %s
                - Company: %s
                - Follow-Up Number: %d
                - Days Since Last Contact: %d days
                - Last Interaction / Current Status: %s
                
                ### Your Task:
                Write the email written FROM the candidate TO the hiring team. The email must achieve the following based on the follow-up number:
                
                - **If Follow-Up #1**: A friendly, gentle nudge reiterating strong interest in the role and asking if there are any updates or further materials needed.
                - **If Follow-Up #2**: A very brief check-in. Acknowledge that they are likely very busy, reiterate excitement, and ask if the timeline has shifted.
                - **If Follow-Up #3 or higher**: A polite "closing the loop" email. Express continued interest but state that you assume they have moved in another direction or the timeline is delayed, and to keep you in mind for future opportunities.
                
                **Rules:**
                1. Include a clear, professional subject line (e.g., "Checking In: [Job Title] Application - [Name]").
                2. Keep it EXTREMELY concise. Recruiters are busy. 3-5 sentences maximum.
                3. Tone must be polite, confident, and understanding. NEVER sound impatient, annoyed, or desperate.
                4. Output ONLY the email content (no conversational filler before or after). Do not include placeholders like "[Date]" unless absolutely necessary.
                """;

        return String.format(
                promptTemplate,
                user.getName() != null ? user.getName() : "[Your Name]",
                role,
                companyName,
                followUpNumber,
                daysSinceLastContact,
                lastInteractionContext != null && !lastInteractionContext.isBlank() ? lastInteractionContext : "Submitted application"
        );
    }
}
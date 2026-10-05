package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.model.JobApplication;
import com.me.interview.dashboard.model.User;
import com.me.interview.dashboard.service.EmailPromptGeneratorService;
import org.springframework.stereotype.Service;

@Service
public class EmailPromptGeneratorServiceImpl implements EmailPromptGeneratorService {

    @Override
    public String generateAlignmentAndTopicsPrompt(User user, JobApplication jobApplication) {
        // Safely extract user skills. Adjust getRoles() if your User entity uses a different field for skills/technologies.
        String userSkills = (user.getRoles() != null && !user.getRoles().isEmpty()) 
                ? String.join(", ", user.getRoles()) 
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
                user.getLinkedInLink() != null ? user.getLinkedInLink() : "Not provided",
                jobApplication.getJobTitle() != null ? jobApplication.getJobTitle() : "Unknown Role",
                jobApplication.getCompanyName() != null ? jobApplication.getCompanyName() : "Unknown Company",
                jobApplication.getDescription() != null ? jobApplication.getDescription() : "No description provided."
        );
    }

    @Override
    public String generateFollowUpEmailPrompt(User user, JobApplication jobApplication, int followUpNumber, int daysSinceLastContact, String lastInteractionContext) {
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
                jobApplication.getJobTitle() != null ? jobApplication.getJobTitle() : "the open position",
                jobApplication.getCompanyName() != null ? jobApplication.getCompanyName() : "your company",
                followUpNumber,
                daysSinceLastContact,
                lastInteractionContext != null && !lastInteractionContext.isBlank() ? lastInteractionContext : "Submitted application"
        );
    }
}
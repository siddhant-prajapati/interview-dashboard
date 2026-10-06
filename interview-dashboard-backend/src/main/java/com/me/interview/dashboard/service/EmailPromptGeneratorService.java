package com.me.interview.dashboard.service;

import com.me.interview.dashboard.model.JobApplication;
import com.me.interview.dashboard.model.User;

public interface EmailPromptGeneratorService {
    String generateAlignmentAndTopicsPrompt(Long userId, Long jobApplicationId);
    String generateAlignmentAndTopicsPrompt(User user, JobApplication jobApplication);
    String generateFollowUpEmailPrompt(Long userId, Long jobApplicationId, int followUpNumber, int daysSinceLastContact, String lastInteractionContext);
    String generateFollowUpEmailPrompt(User user, JobApplication jobApplication, int followUpNumber, int daysSinceLastContact, String lastInteractionContext);
}
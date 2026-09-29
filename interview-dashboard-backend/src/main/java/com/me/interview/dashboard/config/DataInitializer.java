package com.me.interview.dashboard.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.me.interview.dashboard.enumeration.*;
import com.me.interview.dashboard.model.*;
import com.me.interview.dashboard.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * DataInitializer loads external JSON seed files from resources/data/ into the database on startup
 * whenever tables are empty. All primary keys are generated via auto-increment (no IDs in JSON).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final TechnologyRepository technologyRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PlatformRepository platformRepository;
    private final ResumeRepository resumeRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final PreparationTopicRepository topicRepository;
    private final PreparationItemRepository itemRepository;
    private final QuestionRepository questionRepository;
    private final InterviewRepository interviewRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    @Override
    @Transactional
    public void run(String... args) {
        try {
            seedTechnologies();
            seedUsers();
            seedPlatforms();
            seedCompanies();
            seedResumes();
            seedPreparationTopicsAndItems();
            seedQuestions();
            seedJobApplications();
            seedInterviews();
        } catch (Exception e) {
            log.error("Error during seed data initialization: {}", e.getMessage(), e);
        }
    }

    private void seedTechnologies() {
        if (technologyRepository.count() > 0) {
            return;
        }
        loadFromResource("data/technologies.json", new TypeReference<List<Technology>>() {}, technologies -> {
            technologyRepository.saveAll(technologies);
            log.info("Successfully seeded {} technologies from technologies.json", technologies.size());
        });
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            return;
        }
        loadFromResource("data/users.json", new TypeReference<List<User>>() {}, users -> {
            LocalDateTime now = LocalDateTime.now();
            users.forEach(u -> u.setCreatedAt(now));
            userRepository.saveAll(users);
            log.info("Successfully seeded {} users from users.json", users.size());
        });
    }

    private void seedPlatforms() {
        if (platformRepository.count() > 0) {
            return;
        }
        loadFromResource("data/platforms.json", new TypeReference<List<PlatformSeedDTO>>() {}, dtos -> {
            User firstUser = userRepository.findAll().stream().findFirst().orElse(null);
            for (PlatformSeedDTO dto : dtos) {
                User user = dto.getUserId() != null
                        ? userRepository.findById(dto.getUserId()).orElse(firstUser)
                        : firstUser;
                if (user != null) {
                    Integer count = null;
                    if (dto.getJobPostCount() != null && !dto.getJobPostCount().isBlank()) {
                        try {
                            count = Integer.parseInt(dto.getJobPostCount().trim());
                        } catch (Exception ignored) {
                        }
                    }
                    Platform p = Platform.builder()
                            .name(dto.getName())
                            .accountLink(dto.getAccountLink())
                            .lastUpdatedDate(LocalDateTime.now())
                            .jobPostCount(count)
                            .user(user)
                            .build();
                    platformRepository.save(p);
                }
            }
            log.info("Successfully seeded platforms from platforms.json");
        });
    }

    private void seedCompanies() {
        if (companyRepository.count() > 0) {
            return;
        }
        loadFromResource("data/companies.json", new TypeReference<List<Company>>() {}, companies -> {
            LocalDateTime now = LocalDateTime.now();
            companies.forEach(c -> {
                c.setCreatedAt(now);
                c.setUpdatedAt(now);
            });
            companyRepository.saveAll(companies);
            log.info("Successfully seeded {} companies from companies.json", companies.size());
        });
    }

    private void seedResumes() {
        if (resumeRepository.count() > 0) {
            return;
        }
        loadFromResource("data/resumes.json", new TypeReference<List<Resume>>() {}, resumes -> {
            LocalDateTime now = LocalDateTime.now();
            resumes.forEach(r -> {
                r.setCreatedAt(now);
                r.setUpdatedOn(now);
            });
            resumeRepository.saveAll(resumes);
            log.info("Successfully seeded {} resumes from resumes.json", resumes.size());
        });
    }

    private void seedPreparationTopicsAndItems() {
        if (topicRepository.count() == 0) {
            loadFromResource("data/preparation_topics.json", new TypeReference<List<PreparationTopic>>() {}, topics -> {
                topicRepository.saveAll(topics);
                log.info("Successfully seeded {} preparation topics from preparation_topics.json", topics.size());
            });
        }

        if (itemRepository.count() == 0) {
            loadFromResource("data/preparation_items.json", new TypeReference<List<PreparationItemSeedDTO>>() {}, itemDTOs -> {
                List<PreparationItem> items = new ArrayList<>();
                for (PreparationItemSeedDTO dto : itemDTOs) {
                    Optional<PreparationTopic> topicOpt = topicRepository.findAll().stream()
                            .filter(t -> t.getName().equalsIgnoreCase(dto.getTopicName()))
                            .findFirst();

                    if (topicOpt.isPresent()) {
                        PreparationItem item = PreparationItem.builder()
                                .topic(topicOpt.get())
                                .title(dto.getTitle())
                                .description(dto.getDescription())
                                .type(dto.getType() != null ? dto.getType() : ItemType.CONCEPT)
                                .difficulty(dto.getDifficulty() != null ? dto.getDifficulty() : 3)
                                .completed(Boolean.TRUE.equals(dto.getCompleted()))
                                .completedAt(Boolean.TRUE.equals(dto.getCompleted()) ? LocalDate.now().minusDays(1) : null)
                                .notes(dto.getNotes())
                                .build();
                        items.add(item);
                    }
                }
                itemRepository.saveAll(items);
                log.info("Successfully seeded {} preparation items from preparation_items.json", items.size());
            });
        }
    }

    private void seedQuestions() {
        if (questionRepository.count() > 0) {
            return;
        }
        loadFromResource("data/questions.json", new TypeReference<List<QuestionSeedDTO>>() {}, questionDTOs -> {
            List<Question> questions = new ArrayList<>();
            for (QuestionSeedDTO dto : questionDTOs) {
                Technology tech = technologyRepository.findByNameIgnoreCase(dto.getTechnologyName()).orElse(null);
                if (tech != null) {
                    questions.add(Question.builder()
                            .question(dto.getQuestion())
                            .technology(tech)
                            .listedDate(LocalDate.now().minusDays(3))
                            .build());
                }
            }
            if (!questions.isEmpty()) {
                questionRepository.saveAll(questions);
                log.info("Successfully seeded {} questions from questions.json", questions.size());
            }
        });
    }

    private void seedJobApplications() {
        if (jobApplicationRepository.count() > 0) {
            return;
        }
        loadFromResource("data/job_applications.json", new TypeReference<List<JobApplicationSeedDTO>>() {}, appDTOs -> {
            for (JobApplicationSeedDTO dto : appDTOs) {
                Company company = companyRepository.findAll().stream()
                        .filter(c -> c.getName().equalsIgnoreCase(dto.getCompanyName()))
                        .findFirst().orElse(null);

                Resume resume = resumeRepository.findAll().stream()
                        .filter(r -> r.getResumeName().equalsIgnoreCase(dto.getResumeName()))
                        .findFirst().orElse(null);

                List<Technology> techList = new ArrayList<>();
                if (dto.getTechnologyNames() != null) {
                    for (String techName : dto.getTechnologyNames()) {
                        technologyRepository.findByNameIgnoreCase(techName).ifPresent(techList::add);
                    }
                }

                LocalDate postDate = LocalDate.now().minusDays(dto.getPostingDateDaysAgo() != null ? dto.getPostingDateDaysAgo() : 7);
                LocalDate applyDate = LocalDate.now().minusDays(dto.getApplyDateDaysAgo() != null ? dto.getApplyDateDaysAgo() : 3);

                Platform platform = null;
                if (dto.getPlatform() != null && !dto.getPlatform().trim().isEmpty()) {
                    String platformName = dto.getPlatform().trim();
                    platform = platformRepository.findFirstByNameIgnoreCase(platformName)
                            .orElseGet(() -> {
                                User firstUser = userRepository.findAll().stream().findFirst().orElse(null);
                                if (firstUser != null) {
                                    return platformRepository.save(Platform.builder()
                                            .name(platformName)
                                            .user(firstUser)
                                            .lastUpdatedDate(LocalDateTime.now())
                                            .build());
                                }
                                return null;
                            });
                }

                JobApplication app = JobApplication.builder()
                        .company(company)
                        .resume(resume)
                        .role(dto.getRole())
                        .platform(platform)
                        .jobType(dto.getJobType() != null ? dto.getJobType() : JobType.REMOTE)
                        .expectedSalary(dto.getExpectedSalary())
                        .experience(dto.getExperience())
                        .postingDate(postDate)
                        .applyDate(applyDate)
                        .status(dto.getStatus() != null ? dto.getStatus() : ApplicationStatus.APPLIED)
                        .followUpCount(dto.getFollowUpCount() != null ? dto.getFollowUpCount() : 0)
                        .portfolioShared(Boolean.TRUE.equals(dto.getPortfolioShared()))
                        .linkedInProfileShared(Boolean.TRUE.equals(dto.getLinkedInProfileShared()))
                        .jobUrl(dto.getJobUrl())
                        .technologies(techList)
                        .build();

                JobApplication savedApp = jobApplicationRepository.save(app);

                if (dto.getStatusHistory() != null) {
                    for (StatusHistorySeedDTO sh : dto.getStatusHistory()) {
                        int daysAgo = sh.getDaysAgo() != null ? sh.getDaysAgo() : 1;
                        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                                .jobApplication(savedApp)
                                .status(sh.getStatus())
                                .changedAt(LocalDateTime.now().minusDays(daysAgo))
                                .notes(sh.getNotes())
                                .build());
                    }
                }
            }
            log.info("Successfully seeded {} job applications from job_applications.json", appDTOs.size());
        });
    }

    private void seedInterviews() {
        if (interviewRepository.count() > 0) {
            return;
        }
        loadFromResource("data/interviews.json", new TypeReference<List<InterviewSeedDTO>>() {}, interviewDTOs -> {
            List<Interview> interviews = new ArrayList<>();
            for (InterviewSeedDTO dto : interviewDTOs) {
                JobApplication targetApp = jobApplicationRepository.findAll().stream()
                        .filter(app -> (app.getCompany() != null && app.getCompany().getName().equalsIgnoreCase(dto.getCompanyName()))
                                && (dto.getRole() == null || app.getRole().equalsIgnoreCase(dto.getRole())))
                        .findFirst().orElse(null);

                if (targetApp != null) {
                    int days = dto.getDaysFromNow() != null ? dto.getDaysFromNow() : 2;
                    int hour = dto.getHourOfDay() != null ? dto.getHourOfDay() : 14;
                    int minute = dto.getMinuteOfDay() != null ? dto.getMinuteOfDay() : 0;
                    LocalDateTime sched = LocalDateTime.now().plusDays(days).withHour(hour).withMinute(minute).withSecond(0);

                    interviews.add(Interview.builder()
                            .jobApplication(targetApp)
                            .stage(dto.getStage() != null ? dto.getStage() : InterviewStage.TECHNICAL)
                            .status(dto.getStatus() != null ? dto.getStatus() : InterviewStatus.SCHEDULED)
                            .interviewDate(sched)
                            .notes(dto.getNotes())
                            .build());
                }
            }
            if (!interviews.isEmpty()) {
                interviewRepository.saveAll(interviews);
                log.info("Successfully seeded {} interviews from interviews.json", interviews.size());
            }
        });
    }

    private <T> void loadFromResource(String resourcePath, TypeReference<T> typeRef, java.util.function.Consumer<T> consumer) {
        try {
            ClassPathResource resource = new ClassPathResource(resourcePath);
            if (resource.exists()) {
                try (InputStream inputStream = resource.getInputStream()) {
                    T data = objectMapper.readValue(inputStream, typeRef);
                    if (data != null) {
                        consumer.accept(data);
                    }
                }
            } else {
                log.warn("Seed resource file not found: {}", resourcePath);
            }
        } catch (Exception e) {
            log.error("Failed to load and seed {}: {}", resourcePath, e.getMessage(), e);
        }
    }

    // Helper DTOs for JSON deserialization of relational records without IDs
    @Data
    public static class PreparationItemSeedDTO {
        private String topicName;
        private String title;
        private String description;
        private ItemType type;
        private Integer difficulty;
        private Boolean completed;
        private String notes;
    }

    @Data
    public static class QuestionSeedDTO {
        private String technologyName;
        private String question;
    }

    @Data
    public static class JobApplicationSeedDTO {
        private String companyName;
        private String resumeName;
        private String role;
        private String platform;
        private JobType jobType;
        private String expectedSalary;
        private Double experience;
        private Integer postingDateDaysAgo;
        private Integer applyDateDaysAgo;
        private ApplicationStatus status;
        private Integer followUpCount;
        private Boolean portfolioShared;
        private Boolean linkedInProfileShared;
        private String jobUrl;
        private List<String> technologyNames;
        private List<StatusHistorySeedDTO> statusHistory;
    }

    @Data
    public static class StatusHistorySeedDTO {
        private ApplicationStatus status;
        private String notes;
        private Integer daysAgo;
    }

    @Data
    public static class InterviewSeedDTO {
        private String companyName;
        private String role;
        private InterviewStage stage;
        private InterviewStatus status;
        private Integer daysFromNow;
        private Integer hourOfDay;
        private Integer minuteOfDay;
        private String notes;
    }

    @Data
    public static class PlatformSeedDTO {
        private String name;
        private String accountLink;
        private String lastUpdatedDate;
        private String jobPostCount;
        private Long userId;
    }
}

package com.me.interview.dashboard.util;
import java.time.LocalDateTime;

public class CustomLogger {

    // 1. A private static volatile variable to hold the single instance
    private static volatile CustomLogger instance;

    // 2. A private constructor to prevent instantiation from outside the class
    private CustomLogger() {
        // Optional safety check to prevent instantiation via Reflection API
        if (instance != null) {
            throw new RuntimeException("Use getInstance() method to get the single instance of this class.");
        }
    }

    // 3. A public static method to provide global access to the instance
    public static CustomLogger getInstance() {
        // First check (no locking)
        if (instance == null) {
            // Lock the class block
            synchronized (CustomLogger.class) {
                // Second check (with locking) - "Double-Checked Locking"
                if (instance == null) {
                    instance = new CustomLogger();
                }
            }
        }
        return instance;
    }

    // --- Logging Methods ---

    public void info(String message) {
        System.out.println("[INFO] [" + LocalDateTime.now() + "] : " + message);
    }

    public void warn(String message) {
        System.out.println("[WARN] [" + LocalDateTime.now() + "] : " + message);
    }

    public void error(String message) {
        System.err.println("[ERROR] [" + LocalDateTime.now() + "] : " + message);
    }
}
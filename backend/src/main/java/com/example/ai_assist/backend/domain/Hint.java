package com.example.ai_assist.backend.domain;

public class Hint {

    private final String level;
    private final String message;

    public Hint(String level, String message) {
        this.level = level;
        this.message = message;
    }

    public String getLevel() {
        return level;
    }

    public String getMessage() {
        return message;
    }
}

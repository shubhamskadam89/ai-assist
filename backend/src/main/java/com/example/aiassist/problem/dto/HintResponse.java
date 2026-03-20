package com.example.aiassist.problem.dto;

public class HintResponse {

    private final boolean showHint;
    private final String level;
    private final String message;

    private HintResponse(boolean showHint, String level, String message) {
        this.showHint = showHint;
        this.level = level;
        this.message = message;
    }

    public static HintResponse noHint() {
        return new HintResponse(false, null, null);
    }

    public static HintResponse from(Hint hint) {
        return new HintResponse(true, hint.getLevel(), hint.getMessage());
    }

    public boolean isShowHint() { return showHint; }
    public String getLevel() { return level; }
    public String getMessage() { return message; }
}
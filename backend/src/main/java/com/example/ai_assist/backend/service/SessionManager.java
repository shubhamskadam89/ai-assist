package com.example.ai_assist.backend.service;

import com.example.ai_assist.backend.domain.SessionState;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionManager {

    private final Map<String, SessionState> sessions = new ConcurrentHashMap<>();

    public SessionState getSession(String sessionId) {
        return sessions.computeIfAbsent(sessionId, SessionState::new);
    }
}

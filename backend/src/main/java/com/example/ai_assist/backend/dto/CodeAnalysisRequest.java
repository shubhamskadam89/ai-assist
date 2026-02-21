package com.example.ai_assist.backend.dto;

import com.example.ai_assist.backend.domain.SignalVector;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeAnalysisRequest {
    @JsonProperty("sessionId")
    private String sessionId;
    
    @JsonProperty("problemContextId")
    private UUID problemContextId;
    
    @JsonProperty("language")
    private String language;
    
    @JsonProperty("rawCode")
    private String rawCode;
    
    @JsonProperty("signalVector")
    private SignalVector signalVector;
}

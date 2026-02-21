from pydantic import BaseModel


class ProblemClassificationRequest(BaseModel):
    title: str
    description: str


class ProblemClassificationResponse(BaseModel):
    expectedOptimal: str = "UNKNOWN"
    confidence: float = 0.0
    reasoning: str | None = None


class CodeGuidanceRequest(BaseModel):
    expectedOptimal: str
    language: str
    rawCode: str
    mistakeCount: int


class CodeGuidanceResponse(BaseModel):
    detectedApproach: str = "UNKNOWN"
    alignment: str = "UNCERTAIN"  # ALIGNED | MISALIGNED | UNCERTAIN
    conceptualHint: str | None = None
    confidence: float = 0.0


class ApproachDetectionRequest(BaseModel):
    language: str
    rawCode: str


class ApproachDetectionResponse(BaseModel):
    detectedApproach: str = "UNKNOWN"
    confidence: float = 0.0


class HintGenerationRequest(BaseModel):
    expectedOptimal: str
    detectedApproach: str
    mistakeCount: int


class HintGenerationResponse(BaseModel):
    conceptualHint: str

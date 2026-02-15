from pydantic import BaseModel


class ProblemClassificationRequest(BaseModel):
    title: str
    description: str


class ProblemClassificationResponse(BaseModel):
    expectedOptimal: str
    confidence: float
    reasoning: str | None = None


class CodeGuidanceRequest(BaseModel):
    expectedOptimal: str
    language: str
    rawCode: str
    mistakeCount: int


class CodeGuidanceResponse(BaseModel):
    detectedApproach: str
    alignment: str  # ALIGNED | MISALIGNED | UNCERTAIN
    conceptualHint: str | None
    confidence: float


class ApproachDetectionRequest(BaseModel):
    language: str
    rawCode: str


class ApproachDetectionResponse(BaseModel):
    detectedApproach: str
    confidence: float


class HintGenerationRequest(BaseModel):
    expectedOptimal: str
    detectedApproach: str
    mistakeCount: int


class HintGenerationResponse(BaseModel):
    conceptualHint: str

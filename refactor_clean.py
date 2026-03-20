import os
import re
import shutil

src_dir = "backend/src/main/java"
test_dir = "backend/src/test/java"

class_map = {
    "Platform": "com.example.aiassist.core.platform.Platform",
    "SessionState": "com.example.aiassist.core.session.SessionState",
    "SessionManager": "com.example.aiassist.core.session.SessionManager",

    "CodeController": "com.example.aiassist.ai.analysis.controller.CodeController",
    "CodeAnalysisService": "com.example.aiassist.ai.analysis.service.CodeAnalysisService",
    "OllamaService": "com.example.aiassist.ai.analysis.service.OllamaService",
    "CodeSnapshotRepository": "com.example.aiassist.ai.analysis.repository.CodeSnapshotRepository",
    "CodeSnapshot": "com.example.aiassist.ai.analysis.entity.CodeSnapshot",
    "CodeAnalysisRequest": "com.example.aiassist.ai.analysis.dto.CodeAnalysisRequest",
    "CodeAnalysisResult": "com.example.aiassist.ai.analysis.dto.CodeAnalysisResult",
    "CodeAnalysisResponse": "com.example.aiassist.ai.analysis.dto.CodeAnalysisResponse",
    "AiConfiguration": "com.example.aiassist.ai.analysis.engine.AiConfiguration",
    "AiCodeAnalyzer": "com.example.aiassist.ai.analysis.engine.AiCodeAnalyzer",
    "RuleBasedCodeAnalyzer": "com.example.aiassist.ai.analysis.engine.RuleBasedCodeAnalyzer",

    "ProblemDetectionService": "com.example.aiassist.ai.classification.service.ProblemDetectionService",
    "AiProblemClassifier": "com.example.aiassist.ai.classification.engine.AiProblemClassifier",
    "RuleBasedProblemClassifier": "com.example.aiassist.ai.classification.engine.RuleBasedProblemClassifier",
    "ProblemClassificationResult": "com.example.aiassist.ai.classification.dto.ProblemClassificationResult",
    "ClassificationStatus": "com.example.aiassist.ai.classification.dto.ClassificationStatus",

    "ProblemController": "com.example.aiassist.problem.controller.ProblemController",
    "HintPolicyEngine": "com.example.aiassist.problem.service.HintPolicyEngine",
    "ProblemRegistry": "com.example.aiassist.problem.service.ProblemRegistry",
    "ProblemRepository": "com.example.aiassist.problem.repository.ProblemRepository",
    "ProblemAttemptRepository": "com.example.aiassist.problem.repository.ProblemAttemptRepository",
    "ProblemContextRepository": "com.example.aiassist.problem.repository.ProblemContextRepository",
    "Problem": "com.example.aiassist.problem.entity.Problem",
    "ProblemAttempt": "com.example.aiassist.problem.entity.ProblemAttempt",
    "ProblemContext": "com.example.aiassist.problem.entity.ProblemContext",
    "ProblemDetectionRequest": "com.example.aiassist.problem.dto.ProblemDetectionRequest",
    "ProblemDetectionResponse": "com.example.aiassist.problem.dto.ProblemDetectionResponse",
    "ClassificationResult": "com.example.aiassist.problem.dto.ClassificationResult",
    "HintResponse": "com.example.aiassist.problem.dto.HintResponse",
    "Hint": "com.example.aiassist.problem.dto.Hint",

    "StudentProfile": "com.example.aiassist.student.entity.StudentProfile",
    "StudentPlatformIdentity": "com.example.aiassist.student.entity.StudentPlatformIdentity",
    "StudentProfileRepository": "com.example.aiassist.student.repository.StudentProfileRepository",
    "StudentPlatformIdentityRepository": "com.example.aiassist.student.repository.StudentPlatformIdentityRepository",
    "ProblemTrackingRequest": "com.example.aiassist.student.dto.ProblemTrackingRequest",

    "TrackingController": "com.example.aiassist.tracking.controller.TrackingController",

    "TeacherController": "com.example.aiassist.teacher.controller.TeacherController",
    "DashboardController": "com.example.aiassist.teacher.controller.DashboardController",
    "TestController": "com.example.aiassist.teacher.controller.TestController",
    "TeacherService": "com.example.aiassist.teacher.service.TeacherService",
    "TeacherRepository": "com.example.aiassist.teacher.repository.TeacherRepository",
    "Teacher": "com.example.aiassist.teacher.entity.Teacher",
    "TeacherRequestDTO": "com.example.aiassist.teacher.dto.TeacherRequestDTO",
    "TeacherResponseDTO": "com.example.aiassist.teacher.dto.TeacherResponseDTO",
    "DashboardStatsResponse": "com.example.aiassist.teacher.dto.DashboardStatsResponse",

    "Classroom": "com.example.aiassist.classroom.entity.Classroom",
    "ClassAssignment": "com.example.aiassist.classroom.entity.Assignment",
    "ClassAssignmentRepository": "com.example.aiassist.classroom.repository.AssignmentRepository",

    "SignalController": "com.example.aiassist.signal.controller.SignalController",
    "SignalService": "com.example.aiassist.signal.service.SignalService",
    "ApproachValidationEngine": "com.example.aiassist.signal.engine.ApproachValidationEngine",
    "IntentDetectionEngine": "com.example.aiassist.signal.engine.IntentDetectionEngine",
    "ValidationResult": "com.example.aiassist.signal.model.ValidationResult",
    "SignalRequest": "com.example.aiassist.signal.model.SignalRequest",
    "ApproachType": "com.example.aiassist.signal.model.ApproachType",
    "Approach": "com.example.aiassist.signal.model.Approach",
    "SignalVector": "com.example.aiassist.signal.model.SignalVector",
    "DetectionResult": "com.example.aiassist.signal.model.DetectionResult",

    "DataSeeder": "com.example.aiassist.config.DataSeeder",
    "CorsConfig": "com.example.aiassist.config.CorsConfig",

    "AiAssistBackendApplication": "com.example.aiassist.AiAssistApplication",
}

mapped_class_renames = {
    "ClassAssignment": "Assignment",
    "ClassAssignmentRepository": "AssignmentRepository",
    "AiAssistBackendApplication": "AiAssistApplication",
}

mapped_class_renames_test = {
    "AiAssistBackendApplicationTests": "AiAssistApplicationTests"
}

def process_dir(directory):
    abs_dir = os.path.join("/Users/shubhamkadam/ai-assist", directory)
    base_search_dir = os.path.join(abs_dir, "com/example/ai_assist")
    if not os.path.exists(base_search_dir):
        return
        
    all_java_files = []
    for root, _, files in os.walk(base_search_dir):
        for f in files:
            if f.endswith(".java"):
                all_java_files.append(os.path.join(root, f))

    for old_path in all_java_files:
        with open(old_path, 'r', encoding='utf-8') as f:
            content = f.read()

        filename = os.path.basename(old_path)
        old_class_name = filename[:-5]
        
        is_test = old_class_name.endswith("Tests")
        lookup_name = old_class_name[:-5] if is_test else old_class_name
        
        if lookup_name not in class_map:
            print(f"Skipping unknown class {old_class_name} at {old_path}")
            continue
            
        full_new_fqn = class_map[lookup_name]
        new_pkg = full_new_fqn.rsplit('.', 1)[0]
        new_class_name = full_new_fqn.rsplit('.', 1)[1] + ("Tests" if is_test else "")
        full_new_fqn = new_pkg + "." + new_class_name
        
        # 1. Update Package
        content = re.sub(r'^package\s+.*?;', f'package {new_pkg};', content, flags=re.MULTILINE)
        
        # 2. Update imports from old packages
        def import_replacer(match):
            full_import = match.group(1)
            imported_class = full_import.split('.')[-1]
            if imported_class in class_map:
                return f"import {class_map[imported_class]};"
            return match.group(0)
        
        content = re.sub(r'import\s+(com\.example\.ai_assist\.[A-Za-z0-9_\.]+);', import_replacer, content)
        
        # 3. Rename generic references
        # Ensure we replace `com.example.ai_assist.backend` with `com.example.aiassist` globally in case of FQN
        content = content.replace("com.example.ai_assist.backend", "com.example.aiassist")
        content = content.replace("com.example.ai_assist", "com.example.aiassist")
        
        # 4. Rename specific class references
        for old_name, new_name in mapped_class_renames.items():
            content = re.sub(r'\b' + old_name + r'\b', new_name, content)
        for old_name, new_name in mapped_class_renames_test.items():
            content = re.sub(r'\b' + old_name + r'\b', new_name, content)
            
        # Write to new destination
        new_rel_path = full_new_fqn.replace('.', '/') + ".java"
        new_abs_path = os.path.join(abs_dir, new_rel_path)
        
        os.makedirs(os.path.dirname(new_abs_path), exist_ok=True)
        with open(new_abs_path, 'w', encoding='utf-8') as f:
            f.write(content)

    # Delete old directory
    shutil.rmtree(os.path.join(abs_dir, "com/example/ai_assist"), ignore_errors=True)

process_dir(src_dir)
process_dir(test_dir)

print("Done phase 2 refactoring.")

import os
import re

base_dir = "/Users/shubhamkadam/ai-assist/backend/src/main/java/com/example/ai_assist/backend"

class_map = {
    "AiAssistBackendApplication": "",
    "CorsConfig": "config",
    "DataSeeder": "config",
    "SessionManager": "core.session",
    "SessionState": "core.session",
    "Platform": "core.platform",
    "CodeController": "analysis.controller",
    "CodeAnalysisService": "analysis.service",
    "OllamaService": "analysis.service",
    "AiConfiguration": "analysis.ai",
    "AiCodeAnalyzer": "analysis.ai",
    "RuleBasedCodeAnalyzer": "analysis.ai",
    "CodeAnalysisRequest": "analysis.dto",
    "CodeAnalysisResponse": "analysis.dto",
    "CodeAnalysisResult": "analysis.dto",
    "CodeSnapshot": "analysis.entity",
    "CodeSnapshotRepository": "analysis.repository",
    "ProblemController": "problem.controller",
    "ProblemDetectionService": "problem.service",
    "ProblemRegistry": "problem.service",
    "HintPolicyEngine": "problem.service",
    "AiProblemClassifier": "problem.ai",
    "RuleBasedProblemClassifier": "problem.ai",
    "ProblemDetectionRequest": "problem.dto",
    "ProblemDetectionResponse": "problem.dto",
    "HintResponse": "problem.dto",
    "Hint": "problem.dto",
    "ClassificationResult": "problem.dto",
    "ProblemClassificationResult": "problem.dto",
    "ClassificationStatus": "problem.dto",
    "Problem": "problem.entity",
    "ProblemAttempt": "problem.entity",
    "ProblemContext": "problem.entity",
    "ProblemRepository": "problem.repository",
    "ProblemAttemptRepository": "problem.repository",
    "ProblemContextRepository": "problem.repository",
    "SignalController": "signal.controller",
    "SignalService": "signal.service",
    "IntentDetectionEngine": "signal.engine",
    "ApproachValidationEngine": "signal.engine",
    "SignalRequest": "signal.dto",
    "SignalVector": "signal.dto",
    "DetectionResult": "signal.dto",
    "Approach": "signal.dto",
    "ApproachType": "signal.dto",
    "ValidationResult": "signal.dto",
    "TrackingController": "student.controller",
    "ProblemTrackingRequest": "student.dto",
    "StudentProfile": "student.entity",
    "StudentPlatformIdentity": "student.entity",
    "ClassAssignment": "student.entity",
    "StudentProfileRepository": "student.repository",
    "StudentPlatformIdentityRepository": "student.repository",
    "ClassAssignmentRepository": "student.repository",
    "TeacherController": "teacher.controller",
    "DashboardController": "teacher.controller",
    "TestController": "teacher.controller",
    "TeacherService": "teacher.service",
    "TeacherRequestDTO": "teacher.dto",
    "TeacherResponseDTO": "teacher.dto",
    "DashboardStatsResponse": "teacher.dto",
    "Teacher": "teacher.entity",
    "TeacherRepository": "teacher.repository"
}

# 1. Gather all java files
all_files = []
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith(".java"):
            all_files.append(os.path.join(root, f))

file_contents = {}
for path in all_files:
    with open(path, 'r', encoding='utf-8') as f:
        file_contents[path] = f.read()

# 2. Update contents
updated_contents = {}
for path, content in file_contents.items():
    filename = os.path.basename(path)
    class_name = filename[:-5]
    
    if class_name not in class_map:
        print(f"Warning: {class_name} not in class_map. Skipping.")
        updated_contents[path] = content
        continue
        
    new_sub_pkg = class_map[class_name]
    new_pkg_full = "com.example.ai_assist.backend"
    if new_sub_pkg:
        new_pkg_full += "." + new_sub_pkg
        
    # Update package declaration using regex
    content = re.sub(r'^package\s+com\.example\.ai_assist\.backend(\.[a-zA-Z0-9_]+)*\s*;', 
                     f'package {new_pkg_full};', content, flags=re.MULTILINE)
    
    # Update imports
    for cname, spkg in class_map.items():
        if cname == class_name:
            continue
            
        target_import = "com.example.ai_assist.backend"
        if spkg:
             target_import += "." + spkg
        target_import += "." + cname
        
        content = re.sub(r'import\s+com\.example\.ai_assist\.backend\.[a-zA-Z0-9_\.]*\.' + cname + r'\s*;',
                         f'import {target_import};', content)

    updated_contents[path] = content

# 3. Create new directories and write files
for spkg in set(class_map.values()):
    if spkg:
        os.makedirs(os.path.join(base_dir, spkg.replace('.', '/')), exist_ok=True)

for path, content in updated_contents.items():
    filename = os.path.basename(path)
    class_name = filename[:-5]
    
    if class_name not in class_map:
        continue
        
    new_sub_pkg = class_map[class_name]
    new_dir = base_dir
    if new_sub_pkg:
        new_dir = os.path.join(base_dir, new_sub_pkg.replace('.', '/'))
        
    new_path = os.path.join(new_dir, filename)
    
    with open(new_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    # Remove old file if path changed
    if new_path != path:
        os.remove(path)

# Cleanup empty directories
for root, dirs, files in os.walk(base_dir, topdown=False):
    for d in dirs:
        dir_path = os.path.join(root, d)
        if not os.listdir(dir_path):
            os.rmdir(dir_path)

print("Done refactoring.")

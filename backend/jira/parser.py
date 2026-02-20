from typing import List

def extract_requirements(story: dict) -> List[str]:
    """
    Extract a clean list of testable requirements from a Jira story.
    Combines title, description and acceptance criteria.
    """
    requirements = []

    # Always include the story title as a high-level requirement
    if story.get("title"):
        requirements.append(story["title"])

    # Parse acceptance criteria line by line
    ac = story.get("acceptance_criteria", "")
    if ac:
        for line in ac.splitlines():
            line = line.strip()
            # Remove bullet markers
            line = line.lstrip("-•*").strip()
            if len(line) > 10:  # skip very short/empty lines
                requirements.append(line)

    # If no acceptance criteria, fall back to description
    if len(requirements) <= 1:
        desc = story.get("description", "")
        if desc:
            for line in desc.splitlines():
                line = line.strip().lstrip("-•*").strip()
                if len(line) > 10:
                    requirements.append(line)

    return requirements


def format_requirements_for_prompt(requirements: List[str]) -> str:
    """Format requirements list into a prompt-friendly string."""
    if not requirements:
        return "No requirements found."

    lines = ["## Requirements from Jira Story\n"]
    for i, req in enumerate(requirements, 1):
        lines.append(f"{i}. {req}")

    return "\n".join(lines)

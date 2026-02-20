import requests
from requests.auth import HTTPBasicAuth
from typing import Optional

class JiraClient:
    def __init__(self, base_url: str, email: str, api_token: str):
        self.base_url  = base_url.rstrip("/")
        self.auth      = HTTPBasicAuth(email, api_token)
        self.headers   = {"Accept": "application/json"}

    def get_story(self, story_id: str) -> dict:
        """Fetch a Jira story by ID e.g. PROJ-123"""
        url = f"{self.base_url}/rest/api/3/issue/{story_id}"
        response = requests.get(url, auth=self.auth, headers=self.headers)

        if response.status_code == 404:
            raise ValueError(f"Story '{story_id}' not found in Jira.")
        if response.status_code == 401:
            raise ValueError("Invalid Jira credentials. Check your email and API token.")
        if not response.ok:
            raise ValueError(f"Jira API error: {response.status_code} {response.text}")

        data = response.json()
        fields = data.get("fields", {})

        # Extract description text from Atlassian Document Format (ADF)
        description = _extract_text_from_adf(fields.get("description") or {})
        
        # Extract acceptance criteria from ADF
        acceptance_criteria = _extract_text_from_adf(
            fields.get("customfield_10016") or {}
        )

        # Some teams put acceptance criteria in the description
        if not acceptance_criteria:
            acceptance_criteria = _extract_acceptance_criteria(description)

        return {
            "id"                  : data["key"],
            "title"               : fields.get("summary", ""),
            "description"         : description,
            "acceptance_criteria" : acceptance_criteria,
            "status"              : fields.get("status", {}).get("name", ""),
            "issue_type"          : fields.get("issuetype", {}).get("name", ""),
        }

    def add_comment(self, story_id: str, comment: str) -> None:
        """Add a comment to a Jira story."""
        url = f"{self.base_url}/rest/api/3/issue/{story_id}/comment"
        body = {
            "body": {
                "type"   : "doc",
                "version": 1,
                "content": [
                    {
                        "type"   : "paragraph",
                        "content": [{"type": "text", "text": comment}]
                    }
                ]
            }
        }
        requests.post(
            url,
            json=body,
            auth=self.auth,
            headers={**self.headers, "Content-Type": "application/json"}
        )


def _extract_text_from_adf(adf: dict) -> str:
    """Recursively extract plain text from Atlassian Document Format."""
    if not adf:
        return ""

    texts = []

    def walk(node):
        if isinstance(node, dict):
            if node.get("type") == "text":
                texts.append(node.get("text", ""))
            for child in node.get("content", []):
                walk(child)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(adf)
    return " ".join(texts).strip()


def _extract_acceptance_criteria(description: str) -> str:
    """Extract acceptance criteria section from description text."""
    if not description:
        return ""

    lines = description.splitlines()
    capturing = False
    criteria = []

    for line in lines:
        lower = line.lower()
        if "acceptance criteria" in lower or "acceptance criterion" in lower:
            capturing = True
            continue
        if capturing:
            if line.strip() == "" and criteria:
                break
            if line.strip():
                criteria.append(line.strip())

    return "\n".join(criteria)

import os
import json
import configparser
from typing import Optional

def detect_framework(project_root: str, language: str) -> Optional[str]:
    """
    Scan the project root and detect the test framework being used.
    Returns the framework name or None if not detected.
    """
    if language == "python":
        return _detect_python_framework(project_root) or "pytest"
    elif language in ("javascript", "javascriptreact", "typescriptreact"):
        return _detect_javascript_framework(project_root) or "Jest"
    elif language == "java":
        return _detect_java_framework(project_root) or "JUnit 5"
    return None


def _detect_python_framework(project_root: str) -> Optional[str]:
    """Check pytest.ini, setup.cfg, pyproject.toml, requirements.txt"""

    # Check pytest.ini
    if os.path.exists(os.path.join(project_root, "pytest.ini")):
        return "pytest"

    # Check pyproject.toml
    pyproject = os.path.join(project_root, "pyproject.toml")
    if os.path.exists(pyproject):
        content = open(pyproject).read()
        if "pytest" in content:
            return "pytest"
        if "unittest" in content:
            return "unittest"

    # Check setup.cfg
    setup_cfg = os.path.join(project_root, "setup.cfg")
    if os.path.exists(setup_cfg):
        content = open(setup_cfg).read()
        if "pytest" in content:
            return "pytest"

    # Check requirements.txt
    req_files = ["requirements.txt", "requirements-dev.txt", "requirements-test.txt"]
    for req_file in req_files:
        req_path = os.path.join(project_root, req_file)
        if os.path.exists(req_path):
            content = open(req_path).read().lower()
            if "pytest" in content:
                return "pytest"
            if "nose" in content:
                return "nose"

    # Default for Python
    return "pytest"


def _detect_javascript_framework(project_root: str) -> Optional[str]:
    """Check package.json for jest, mocha, vitest, jasmine"""

    package_json = os.path.join(project_root, "package.json")
    if not os.path.exists(package_json):
        return "Jest"  # default

    try:
        pkg = json.loads(open(package_json).read())
    except Exception:
        return "Jest"

    # Check scripts section
    scripts = pkg.get("scripts", {})
    for script_value in scripts.values():
        if "vitest" in script_value:
            return "Vitest"
        if "jest" in script_value:
            return "Jest"
        if "mocha" in script_value:
            return "Mocha"
        if "jasmine" in script_value:
            return "Jasmine"

    # Check dependencies and devDependencies
    all_deps = {
        **pkg.get("dependencies", {}),
        **pkg.get("devDependencies", {}),
    }

    if "vitest" in all_deps:
        return "Vitest"
    if "jest" in all_deps or "@jest/core" in all_deps:
        return "Jest"
    if "mocha" in all_deps:
        return "Mocha"
    if "jasmine" in all_deps:
        return "Jasmine"
    if "@testing-library/react" in all_deps:
        return "Jest + React Testing Library"

    # Check jest config key
    if "jest" in pkg:
        return "Jest"

    return "Jest"  # default


def _detect_java_framework(project_root: str) -> Optional[str]:
    """Check pom.xml and build.gradle for JUnit, TestNG"""

    # Check pom.xml
    pom_xml = os.path.join(project_root, "pom.xml")
    if os.path.exists(pom_xml):
        content = open(pom_xml).read().lower()
        if "junit" in content:
            if "junit-jupiter" in content or "junit.jupiter" in content:
                return "JUnit 5"
            return "JUnit 4"
        if "testng" in content:
            return "TestNG"

    # Check build.gradle
    for gradle_file in ["build.gradle", "build.gradle.kts"]:
        gradle_path = os.path.join(project_root, gradle_file)
        if os.path.exists(gradle_path):
            content = open(gradle_path).read().lower()
            if "junit" in content:
                if "junit-jupiter" in content or "junit5" in content:
                    return "JUnit 5"
                return "JUnit 4"
            if "testng" in content:
                return "TestNG"

    return "JUnit 5"  # default


def get_framework_hints(framework: str) -> str:
    """Return framework-specific instructions for the LLM prompt."""
    hints = {
        "pytest": """
- Prefix all test functions with test_.
- Use pytest.raises() for exception testing.
- Use @pytest.fixture for shared setup.
- Use parametrize for data-driven tests.
        """.strip(),

        "unittest": """
- Extend unittest.TestCase for all test classes.
- Use self.assertEqual(), self.assertRaises() etc.
- Use setUp() and tearDown() for setup/teardown.
        """.strip(),

        "Jest": """
- Use describe() blocks to group related tests.
- Use it() or test() for individual cases.
- Use expect() with matchers like .toBe(), .toEqual(), .toThrow().
- Use beforeEach/afterEach for setup and teardown.
        """.strip(),

        "Vitest": """
- Use describe() blocks to group related tests.
- Use it() or test() for individual cases.
- Use expect() with matchers like .toBe(), .toEqual(), .toThrow().
- Import from 'vitest': import { describe, it, expect } from 'vitest'
        """.strip(),

        "Mocha": """
- Use describe() and it() blocks.
- Use assert from Node.js or chai for assertions.
- Use before/after/beforeEach/afterEach hooks.
        """.strip(),

        "JUnit 5": """
- Annotate test methods with @Test.
- Use @BeforeEach for setup and @AfterEach for teardown.
- Use Assertions.assertEquals(), assertThrows(), assertNotNull().
        """.strip(),

        "JUnit 4": """
- Annotate test methods with @Test.
- Use @Before for setup and @After for teardown.
- Use Assert.assertEquals(), Assert.assertNotNull() etc.
        """.strip(),

        "TestNG": """
- Annotate test methods with @Test.
- Use @BeforeMethod for setup and @AfterMethod for teardown.
- Use Assert.assertEquals(), Assert.assertTrue() etc.
        """.strip(),

        "Jest + React Testing Library": """
- Use describe() and it() blocks.
- Import { render, screen, fireEvent } from '@testing-library/react'.
- Use screen.getByText(), getByRole(), getByTestId() to query.
- Use fireEvent.click() to simulate interactions.
        """.strip(),
    }
    return hints.get(framework, "Write clean, descriptive unit tests.")

"""Tests for parse_instinct_file() in instinct-cli.py."""

import importlib.util
import os
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# Load module (hyphenated filename requires importlib)
# ---------------------------------------------------------------------------

def _load_instinct_cli():
    path = Path(__file__).parent / "instinct-cli.py"
    spec = importlib.util.spec_from_file_location("instinct_cli", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

_mod = _load_instinct_cli()
parse_instinct_file = _mod.parse_instinct_file

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

MULTI_BLOCK = """\
---
id: instinct-a
trigger: "when coding"
confidence: 0.9
domain: general
---
## Action
Do thing A.
## Examples
- Example A1
---
id: instinct-b
trigger: "when testing"
confidence: 0.7
domain: testing
---
## Action
Do thing B.
"""

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_multiple_instincts_returns_correct_count():
    result = parse_instinct_file(MULTI_BLOCK)
    assert len(result) == 2


def test_multiple_instincts_preserve_body_content():
    result = parse_instinct_file(MULTI_BLOCK)
    assert "Do thing A." in result[0]["content"]
    assert "Example A1" in result[0]["content"]
    assert "Do thing B." in result[1]["content"]


def test_multiple_instincts_parse_frontmatter():
    result = parse_instinct_file(MULTI_BLOCK)
    assert result[0]["id"] == "instinct-a"
    assert result[0]["confidence"] == pytest.approx(0.9)
    assert result[0]["domain"] == "general"
    assert result[1]["id"] == "instinct-b"
    assert result[1]["confidence"] == pytest.approx(0.7)


def test_single_instinct_preserves_content():
    content = """\
---
id: solo
trigger: "when reviewing"
confidence: 0.8
domain: review
---
## Action
Check for security issues.
## Evidence
Prevents vulnerabilities.
"""
    result = parse_instinct_file(content)
    assert len(result) == 1
    assert "Check for security issues." in result[0]["content"]
    assert "Prevents vulnerabilities." in result[0]["content"]


def test_empty_body_yields_empty_content():
    content = """\
---
id: empty
trigger: "placeholder"
confidence: 0.5
domain: general
---
"""
    result = parse_instinct_file(content)
    assert len(result) == 1
    assert result[0]["content"] == ""


def test_missing_id_is_excluded():
    content = """\
---
trigger: "no id here"
confidence: 0.5
domain: general
---
## Action
Should be ignored.
"""
    result = parse_instinct_file(content)
    assert len(result) == 0


def test_empty_string_returns_empty_list():
    assert parse_instinct_file("") == []


def test_confidence_parsed_as_float():
    content = """\
---
id: typed
trigger: "when typing"
confidence: 0.75
domain: general
---
"""
    result = parse_instinct_file(content)
    assert isinstance(result[0]["confidence"], float)
    assert result[0]["confidence"] == pytest.approx(0.75)
#!/usr/bin/env python3
"""
Instinct CLI - Manage instincts for the continuous-learning system.

Commands:
  status   Show all instincts grouped by domain
  import   Import instincts from a file or URL
  export   Export instincts to a file or stdout
  evolve   Cluster instincts into skill/command/agent candidates
"""

import argparse
import re
import sys
import urllib.request
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

HOMUNCULUS_DIR = Path.home() / ".claude" / "homunculus"
PERSONAL_DIR = HOMUNCULUS_DIR / "instincts" / "personal"
INHERITED_DIR = HOMUNCULUS_DIR / "instincts" / "inherited"
EVOLVED_DIR = HOMUNCULUS_DIR / "evolved"
OBSERVATIONS_FILE = HOMUNCULUS_DIR / "observations.jsonl"

for _dir in [
    PERSONAL_DIR,
    INHERITED_DIR,
    EVOLVED_DIR / "skills",
    EVOLVED_DIR / "commands",
    EVOLVED_DIR / "agents",
]:
    _dir.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------

Instinct = dict  # id, trigger, confidence, domain, source, content, _source_file, _source_type

# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def parse_instinct_file(content: str) -> list[Instinct]:
    """Parse a file containing one or more YAML-frontmatter instinct blocks."""
    instincts: list[Instinct] = []
    current: dict = {}
    in_frontmatter = False
    body_lines: list[str] = []

    for line in content.splitlines():
        if line.strip() == "---":
            if in_frontmatter:
                in_frontmatter = False
            else:
                if current:
                    instincts.append({**current, "content": "\n".join(body_lines).strip()})
                current = {}
                body_lines = []
                in_frontmatter = True
        elif in_frontmatter:
            if ":" in line:
                key, _, value = line.partition(":")
                key = key.strip()
                value = value.strip().strip("\"'")
                current[key] = float(value) if key == "confidence" else value
        else:
            body_lines.append(line)

    if current:
        instincts.append({**current, "content": "\n".join(body_lines).strip()})

    return [i for i in instincts if i.get("id")]


def load_all_instincts() -> list[Instinct]:
    """Load instincts from personal and inherited directories."""
    instincts: list[Instinct] = []

    for directory in [PERSONAL_DIR, INHERITED_DIR]:
        if not directory.exists():
            continue
        for path in sorted(directory.glob("*.yaml")):
            try:
                parsed = parse_instinct_file(path.read_text())
                for inst in parsed:
                    inst["_source_file"] = str(path)
                    inst["_source_type"] = directory.name
                instincts.extend(parsed)
            except Exception as e:
                print(f"Warning: could not parse {path}: {e}", file=sys.stderr)

    return instincts


def extract_action(content: str) -> Optional[str]:
    """Extract the first line of the ## Action section from instinct content."""
    match = re.search(r"## Action\s*\n\s*(.+?)(?:\n\n|\n##|$)", content, re.DOTALL)
    if match:
        return match.group(1).strip().splitlines()[0]
    return None

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_status(args: argparse.Namespace) -> int:
    instincts = load_all_instincts()

    if not instincts:
        print("No instincts found.")
        print(f"  Personal:  {PERSONAL_DIR}")
        print(f"  Inherited: {INHERITED_DIR}")
        return 0

    personal = [i for i in instincts if i.get("_source_type") == "personal"]
    inherited = [i for i in instincts if i.get("_source_type") == "inherited"]
    print(f"Instincts: {len(instincts)} total ({len(personal)} personal, {len(inherited)} inherited)\n")

    by_domain: dict[str, list[Instinct]] = defaultdict(list)
    for inst in instincts:
        by_domain[inst.get("domain", "general")].append(inst)

    for domain in sorted(by_domain):
        domain_instincts = sorted(by_domain[domain], key=lambda x: -x.get("confidence", 0.5))
        print(f"{domain} ({len(domain_instincts)})")
        for inst in domain_instincts:
            conf = inst.get("confidence", 0.5)
            action = extract_action(inst.get("content", ""))
            print(f"  {inst.get('id', 'unnamed')}  {conf:.0%}  {inst.get('trigger', '')}")
            if action:
                truncated = action[:72] + "..." if len(action) > 72 else action
                print(f"    {truncated}")
        print()

    if OBSERVATIONS_FILE.exists():
        count = sum(1 for _ in OBSERVATIONS_FILE.open())
        print(f"Observations logged: {count}  ({OBSERVATIONS_FILE})")

    return 0


def cmd_import(args: argparse.Namespace) -> int:
    source = args.source

    if source.startswith(("http://", "https://")):
        try:
            with urllib.request.urlopen(source) as response:
                content = response.read().decode("utf-8")
        except Exception as e:
            print(f"Error fetching {source}: {e}", file=sys.stderr)
            return 1
    else:
        path = Path(source).expanduser()
        if not path.exists():
            print(f"File not found: {path}", file=sys.stderr)
            return 1
        content = path.read_text()

    incoming = parse_instinct_file(content)
    if not incoming:
        print("No valid instincts found in source.")
        return 1

    existing = load_all_instincts()
    existing_by_id = {i["id"]: i for i in existing if i.get("id")}

    min_conf: float = args.min_confidence or 0.0
    to_add: list[Instinct] = []
    to_update: list[Instinct] = []
    skipped: list[Instinct] = []

    for inst in incoming:
        inst_id = inst.get("id")
        if inst.get("confidence", 0.5) < min_conf:
            skipped.append(inst)
            continue
        existing_inst = existing_by_id.get(inst_id)
        if existing_inst is None:
            to_add.append(inst)
        elif inst.get("confidence", 0.0) > existing_inst.get("confidence", 0.0):
            to_update.append(inst)
        else:
            skipped.append(inst)

    print(f"Found {len(incoming)} instincts — "
          f"adding {len(to_add)}, updating {len(to_update)}, skipping {len(skipped)}\n")

    for label, group in [("Add", to_add), ("Update", to_update)]:
        for inst in group:
            print(f"  {label}  {inst['id']}  ({inst.get('confidence', 0.5):.0%})")

    if skipped:
        print(f"\n  Skip ({len(skipped)}):", ", ".join(i.get("id", "?") for i in skipped[:5]),
              "..." if len(skipped) > 5 else "")

    if args.dry_run:
        print("\nDry run — no changes made.")
        return 0

    if not to_add and not to_update:
        print("Nothing to import.")
        return 0

    if not args.force:
        answer = input(f"\nProceed? [y/N] ")
        if answer.lower() != "y":
            print("Cancelled.")
            return 0

    source_stem = Path(source).stem if not source.startswith("http") else "web-import"
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output_path = INHERITED_DIR / f"{source_stem}-{timestamp}.yaml"

    lines = [f"# Imported from {source}", f"# Date: {datetime.now().isoformat()}", ""]
    for inst in to_add + to_update:
        lines += [
            "---",
            f"id: {inst['id']}",
            f'trigger: "{inst.get("trigger", "")}"',
            f"confidence: {inst.get('confidence', 0.5)}",
            f"domain: {inst.get('domain', 'general')}",
            "source: inherited",
            f'imported_from: "{source}"',
        ]
        if inst.get("source_repo"):
            lines.append(f"source_repo: {inst['source_repo']}")
        lines += ["---", "", inst.get("content", ""), ""]

    output_path.write_text("\n".join(lines))
    print(f"\nImported {len(to_add) + len(to_update)} instincts to {output_path}")
    return 0


def cmd_export(args: argparse.Namespace) -> int:
    instincts = load_all_instincts()

    if args.domain:
        instincts = [i for i in instincts if i.get("domain") == args.domain]
    if args.min_confidence:
        instincts = [i for i in instincts if i.get("confidence", 0.5) >= args.min_confidence]

    if not instincts:
        print("No instincts match the export criteria.")
        return 1

    lines = [
        f"# Instincts export",
        f"# Date: {datetime.now().isoformat()}",
        f"# Total: {len(instincts)}",
        "",
    ]
    for inst in instincts:
        lines.append("---")
        for key in ["id", "trigger", "confidence", "domain", "source", "source_repo"]:
            if inst.get(key) is not None:
                value = inst[key]
                lines.append(f'{key}: "{value}"' if key == "trigger" else f"{key}: {value}")
        lines += ["---", "", inst.get("content", ""), ""]

    output = "\n".join(lines)

    if args.output:
        Path(args.output).write_text(output)
        print(f"Exported {len(instincts)} instincts to {args.output}")
    else:
        print(output)

    return 0


def cmd_evolve(args: argparse.Namespace) -> int:
    instincts = load_all_instincts()

    if len(instincts) < 3:
        print(f"Need at least 3 instincts to analyze — currently have {len(instincts)}.")
        return 1

    print(f"Evolve analysis — {len(instincts)} instincts\n")

    # Cluster by normalized trigger keyword
    clusters: dict[str, list[Instinct]] = defaultdict(list)
    stop_words = {"when", "creating", "writing", "adding", "implementing", "testing", "a", "an", "the"}
    for inst in instincts:
        key = " ".join(
            w for w in inst.get("trigger", "").lower().split()
            if w not in stop_words
        )
        clusters[key].append(inst)

    candidates = [
        {"key": key, "instincts": group,
         "avg_confidence": sum(i.get("confidence", 0.5) for i in group) / len(group),
         "domains": sorted({i.get("domain", "general") for i in group})}
        for key, group in clusters.items()
        if len(group) >= 2
    ]
    candidates.sort(key=lambda x: (-len(x["instincts"]), -x["avg_confidence"]))

    # Skill candidates
    skill_candidates = [c for c in candidates if len(c["instincts"]) >= 2]
    if skill_candidates:
        print(f"Skill candidates ({len(skill_candidates)}):\n")
        for c in skill_candidates[:5]:
            ids = ", ".join(i.get("id", "?") for i in c["instincts"][:3])
            print(f"  {c['key'] or '(mixed)'}  {c['avg_confidence']:.0%}  [{ids}]")
        print()

    # Command candidates — high-confidence workflow instincts
    workflow = [i for i in instincts if i.get("domain") == "workflow" and i.get("confidence", 0) >= 0.7]
    if workflow:
        print(f"Command candidates ({len(workflow)}):\n")
        for inst in workflow[:5]:
            name = re.sub(r"[^a-z0-9]+", "-", inst.get("trigger", "").lower().replace("when ", ""))[:24].strip("-")
            print(f"  /{name}  ({inst.get('confidence', 0.5):.0%})  from: {inst.get('id', '?')}")
        print()

    # Agent candidates — large clusters with high confidence
    agent_candidates = [c for c in candidates if len(c["instincts"]) >= 3 and c["avg_confidence"] >= 0.75]
    if agent_candidates:
        print(f"Agent candidates ({len(agent_candidates)}):\n")
        for c in agent_candidates[:3]:
            name = re.sub(r"[^a-z0-9]+", "-", c["key"])[:20].strip("-") + "-agent"
            print(f"  {name}  covers {len(c['instincts'])} instincts  {c['avg_confidence']:.0%}")
        print()

    if args.generate:
        print("(--generate not yet implemented)")

    return 0

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description="Instinct CLI for the continuous-learning system")
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("status", help="Show all instincts")

    p_import = sub.add_parser("import", help="Import instincts from file or URL")
    p_import.add_argument("source")
    p_import.add_argument("--dry-run", action="store_true")
    p_import.add_argument("--force", action="store_true")
    p_import.add_argument("--min-confidence", type=float)

    p_export = sub.add_parser("export", help="Export instincts")
    p_export.add_argument("--output", "-o")
    p_export.add_argument("--domain")
    p_export.add_argument("--min-confidence", type=float)

    p_evolve = sub.add_parser("evolve", help="Analyze and cluster instincts")
    p_evolve.add_argument("--generate", action="store_true")

    args = parser.parse_args()

    commands = {
        "status": cmd_status,
        "import": cmd_import,
        "export": cmd_export,
        "evolve": cmd_evolve,
    }

    if args.command not in commands:
        parser.print_help()
        return 1

    return commands[args.command](args)


if __name__ == "__main__":
    sys.exit(main())
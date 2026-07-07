#!/usr/bin/env bash
# Regenerates skills_index.md by scanning all skill directories.
# Run from repo root: bash .claude/skills/rebuild-index.sh

set -euo pipefail

SKILLS_DIR="$(cd "$(dirname "$0")" && pwd)"
INDEX="$SKILLS_DIR/skills_index.md"

python3 - "$SKILLS_DIR" "$INDEX" << 'PYEOF'
import sys, os, re, glob
from datetime import datetime, timezone

skills_dir = sys.argv[1]
index_path = sys.argv[2]

def parse_frontmatter(filepath):
    """Extract name and description from YAML frontmatter."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Match frontmatter between --- markers
    m = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if not m:
        return None, None

    fm = m.group(1)

    # Extract name
    nm = re.search(r'^name:\s*["\']?([^"\'\n]+)', fm, re.MULTILINE)
    name = nm.group(1).strip() if nm else None

    # Extract description — handle quoted and unquoted, single and multi-line
    dm = re.search(r'^description:\s*["\']?(.*?)(?:["\']?\s*$)', fm, re.MULTILINE)
    if dm:
        desc = dm.group(1).strip().strip("\"'")
        # If description spans multiple lines (indented continuation)
        desc_start = dm.end()
        remaining = fm[desc_start:]
        for line in remaining.split("\n"):
            stripped = line.strip()
            if stripped and not re.match(r'^[a-zA-Z_-]+:', stripped):
                desc += " " + stripped.strip("\"'")
            else:
                break
    else:
        desc = ""

    return name, desc

# Collect all skills
skills = []
for skill_dir in sorted(glob.glob(os.path.join(skills_dir, "*/"))):
    skill_file = os.path.join(skill_dir, "SKILL.md")
    if not os.path.isfile(skill_file):
        continue

    dirname = os.path.basename(skill_dir.rstrip("/"))
    name, description = parse_frontmatter(skill_file)
    name = name or dirname
    description = description or "(no description)"

    file_count = sum(1 for _ in glob.glob(os.path.join(skill_dir, "**/*"), recursive=True)
                     if os.path.isfile(_))

    # Short description for routing table (first sentence, max 120 chars)
    first_sentence = description.split(". ")[0].split(".\n")[0]
    if not first_sentence.endswith("."):
        first_sentence += "."
    if len(first_sentence) > 120:
        first_sentence = first_sentence[:117] + "..."

    skills.append({
        "name": name,
        "dirname": dirname,
        "description": description,
        "short": first_sentence,
        "files": file_count,
    })

# Build index
lines = []
lines.append("# Skills Index — Pacific Surfaces Project\n")
lines.append("> **Auto-generated** by `rebuild-index.sh`. Do not edit manually — changes will be overwritten.")
lines.append("> Run `bash .claude/skills/rebuild-index.sh` to regenerate after adding or removing skills.\n")
lines.append("---\n")

# Routing table
lines.append("## Routing Table\n")
lines.append("| Skill | Description | Path |")
lines.append("|---|---|---|")
for s in skills:
    lines.append(f"| **{s['dirname']}** | {s['short']} | `{s['dirname']}/` |")

lines.append("\n---\n")

# Skill cards
lines.append("## Skill Cards\n")
for s in skills:
    lines.append(f"### {s['dirname']}")
    lines.append(f"- **Description:** {s['description']}")
    lines.append(f"- **Files:** {s['files']} | **Path:** `{s['dirname']}/SKILL.md`")
    lines.append("")

lines.append("---\n")

# Workflow chains
lines.append("## Workflow Chains\n")
lines.append("Common multi-skill sequences:\n")
lines.append("1. **New feature:** `brainstorming` → `write-a-prd` → `prd-to-plan` → `writing-plans` → `pacific-design-system` + `brand-guidelines` → `verification-before-completion`")
lines.append("2. **Bug fix:** `systematic-debugging` → `triage-issue` → `tdd` → `verification-before-completion`")
lines.append("3. **New page/section:** `brainstorming` → `pacific-design-system` + `brand-guidelines` → `frontend-design` → `verification-before-completion`")
lines.append("4. **Design refresh:** `aidesigner-frontend` → `pacific-design-system` + `brand-guidelines` → `verification-before-completion`")
lines.append("5. **QA pass:** `qa` → `triage-issue` → `systematic-debugging` → `tdd`")
lines.append("6. **Repo setup:** `setup-pre-commit` + `git-guardrails-claude-code`")
lines.append("")
lines.append("---\n")
now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
lines.append(f"*Last rebuilt: {now} — {len(skills)} skills indexed*")

with open(index_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

print(f"Rebuilt {index_path} with {len(skills)} skills.")
PYEOF

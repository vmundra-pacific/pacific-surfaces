# Skills Index — Pacific Surfaces Project

> **Auto-generated** by `rebuild-index.sh`. Do not edit manually — changes will be overwritten.
> Run `bash .claude/skills/rebuild-index.sh` to regenerate after adding or removing skills.

---

## Routing Table

| Skill                              | Description                                                                                                              | Path                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| **aidesigner-frontend**            | Use this skill when the user wants to create or redesign a frontend, landing page, dashboard, marketing page, or othe... | `aidesigner-frontend/`            |
| **brainstorming**                  | You MUST use this before any creative work - creating features, building components, adding functionality, or modifyi... | `brainstorming/`                  |
| **brand-guidelines**               | Applies Pacific Surfaces' official brand colors and typography to any sort of artifact that may benefit from having P... | `brand-guidelines/`               |
| **frontend-design**                | Create distinctive, production-grade frontend interfaces with high design quality.                                       | `frontend-design/`                |
| **git-guardrails-claude-code**     | Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, branch -D, etc.) before they exe... | `git-guardrails-claude-code/`     |
| **grill-me**                       | Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of ... | `grill-me/`                       |
| **pacific-design-system**          | Pacific Surfaces design system rules.                                                                                    | `pacific-design-system/`          |
| **prd-to-issues**                  | Break a PRD into independently-grabbable GitHub issues using tracer-bullet vertical slices.                              | `prd-to-issues/`                  |
| **prd-to-plan**                    | Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices, saved as a local Markdown file... | `prd-to-plan/`                    |
| **qa**                             | Interactive QA session where user reports bugs or issues conversationally, and the agent files GitHub issues.            | `qa/`                             |
| **setup-pre-commit**               | Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo.                 | `setup-pre-commit/`               |
| **skill-creator**                  | Create new skills, modify and improve existing skills, and measure skill performance.                                    | `skill-creator/`                  |
| **systematic-debugging**           | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes.                             | `systematic-debugging/`           |
| **tdd**                            | Test-driven development with red-green-refactor loop.                                                                    | `tdd/`                            |
| **theme-factory**                  | Toolkit for styling artifacts with a theme.                                                                              | `theme-factory/`                  |
| **triage-issue**                   | Triage a bug or issue by exploring the codebase to find root cause, then create a GitHub issue with a TDD-based fix p... | `triage-issue/`                   |
| **verification-before-completion** | Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running ver... | `verification-before-completion/` |
| **write-a-prd**                    | Create a PRD through user interview, codebase exploration, and module design, then submit as a GitHub issue.             | `write-a-prd/`                    |
| **write-a-skill**                  | Create new agent skills with proper structure, progressive disclosure, and bundled resources.                            | `write-a-skill/`                  |
| **writing-plans**                  | Use when you have a spec or requirements for a multi-step task, before touching code.                                    | `writing-plans/`                  |

---

## Skill Cards

### aidesigner-frontend

- **Description:** Use this skill when the user wants to create or redesign a frontend, landing page, dashboard, marketing page, or other UI with AIDesigner. Prefer the connected aidesigner MCP server for generate/refine, then use the local AIDesigner CLI for artifact capture, preview rendering, and repo-native adoption guidance.
- **Files:** 3 | **Path:** `aidesigner-frontend/SKILL.md`

### brainstorming

- **Description:** You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
- **Files:** 8 | **Path:** `brainstorming/SKILL.md`

### brand-guidelines

- **Description:** Applies Pacific Surfaces' official brand colors and typography to any sort of artifact that may benefit from having Pacific's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.
- **Files:** 2 | **Path:** `brand-guidelines/SKILL.md`

### frontend-design

- **Description:** Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
- **Files:** 2 | **Path:** `frontend-design/SKILL.md`

### git-guardrails-claude-code

- **Description:** Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, branch -D, etc.) before they execute. Use when user wants to prevent destructive git operations, add git safety hooks, or block git push/reset in Claude Code.
- **Files:** 2 | **Path:** `git-guardrails-claude-code/SKILL.md`

### grill-me

- **Description:** Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
- **Files:** 1 | **Path:** `grill-me/SKILL.md`

### pacific-design-system

- **Description:** Pacific Surfaces design system rules. Use this skill any time you are creating or modifying a React component, page, or section in the pacific-surfaces repo. Triggers on any work involving /src/app, /src/components, Tailwind classes, colors, typography, animations, CTAs, forms, or layout in this codebase. Read this BEFORE writing any JSX.
- **Files:** 1 | **Path:** `pacific-design-system/SKILL.md`

### prd-to-issues

- **Description:** Break a PRD into independently-grabbable GitHub issues using tracer-bullet vertical slices. Use when user wants to convert a PRD to issues, create implementation tickets, or break down a PRD into work items.
- **Files:** 1 | **Path:** `prd-to-issues/SKILL.md`

### prd-to-plan

- **Description:** Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices, saved as a local Markdown file in ./plans/. Use when user wants to break down a PRD, create an implementation plan, plan phases from a PRD, or mentions "tracer bullets".
- **Files:** 1 | **Path:** `prd-to-plan/SKILL.md`

### qa

- **Description:** Interactive QA session where user reports bugs or issues conversationally, and the agent files GitHub issues. Explores the codebase in the background for context and domain language. Use when user wants to report bugs, do QA, file issues conversationally, or mentions "QA session".
- **Files:** 1 | **Path:** `qa/SKILL.md`

### setup-pre-commit

- **Description:** Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo. Use when user wants to add pre-commit hooks, set up Husky, configure lint-staged, or add commit-time formatting/typechecking/testing.
- **Files:** 1 | **Path:** `setup-pre-commit/SKILL.md`

### skill-creator

- **Description:** Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy.
- **Files:** 18 | **Path:** `skill-creator/SKILL.md`

### systematic-debugging

- **Description:** Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
- **Files:** 11 | **Path:** `systematic-debugging/SKILL.md`

### tdd

- **Description:** Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.
- **Files:** 6 | **Path:** `tdd/SKILL.md`

### theme-factory

- **Description:** Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly.
- **Files:** 13 | **Path:** `theme-factory/SKILL.md`

### triage-issue

- **Description:** Triage a bug or issue by exploring the codebase to find root cause, then create a GitHub issue with a TDD-based fix plan. Use when user reports a bug, wants to file an issue, mentions "triage", or wants to investigate and plan a fix for a problem.
- **Files:** 1 | **Path:** `triage-issue/SKILL.md`

### verification-before-completion

- **Description:** Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
- **Files:** 1 | **Path:** `verification-before-completion/SKILL.md`

### write-a-prd

- **Description:** Create a PRD through user interview, codebase exploration, and module design, then submit as a GitHub issue. Use when user wants to write a PRD, create a product requirements document, or plan a new feature.
- **Files:** 1 | **Path:** `write-a-prd/SKILL.md`

### write-a-skill

- **Description:** Create new agent skills with proper structure, progressive disclosure, and bundled resources. Use when user wants to create, write, or build a new skill.
- **Files:** 1 | **Path:** `write-a-skill/SKILL.md`

### writing-plans

- **Description:** Use when you have a spec or requirements for a multi-step task, before touching code
- **Files:** 2 | **Path:** `writing-plans/SKILL.md`

---

## Workflow Chains

Common multi-skill sequences:

1. **New feature:** `brainstorming` → `write-a-prd` → `prd-to-plan` → `writing-plans` → `pacific-design-system` + `brand-guidelines` → `verification-before-completion`
2. **Bug fix:** `systematic-debugging` → `triage-issue` → `tdd` → `verification-before-completion`
3. **New page/section:** `brainstorming` → `pacific-design-system` + `brand-guidelines` → `frontend-design` → `verification-before-completion`
4. **Design refresh:** `aidesigner-frontend` → `pacific-design-system` + `brand-guidelines` → `verification-before-completion`
5. **QA pass:** `qa` → `triage-issue` → `systematic-debugging` → `tdd`
6. **Repo setup:** `setup-pre-commit` + `git-guardrails-claude-code`

---

_Last rebuilt: 2026-04-16 11:19 UTC — 20 skills indexed_

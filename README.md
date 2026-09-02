<h1 align="center">/vision</h1>

<p align="center">
  <a href="https://agentskills.io"
    ><img
      alt="Agent Skills"
      src="https://img.shields.io/badge/Agent%20Skills-package-blue?style=flat-square"
  /></a>
  <a href="LICENSE"
    ><img
      alt="License"
      src="https://img.shields.io/badge/license-MIT-green?style=flat-square"
  /></a>
  <a href="https://x.com/kunchenguid"
    ><img
      alt="X"
      src="https://img.shields.io/badge/X-@kunchenguid-black?style=flat-square"
  /></a>
  <a href="https://discord.gg/Wsy2NpnZDu"
    ><img
      alt="Discord"
      src="https://img.shields.io/discord/1439901831038763092?style=flat-square&label=discord"
  /></a>
</p>

<h3 align="center">What does your project refuse to become?</h3>

Your repo has values. They are in the two hundred PRs you merged, the features
you quietly declined, the bug you fixed at the root instead of the symptom.
They are just not written down - so every contributor, every coding agent, and
every future you re-litigates them from scratch.

**vision** is an [Agent Skill](https://agentskills.io) that mines what you
actually build, drafts a VISION.md as a testable acceptance policy, then
stress-tests it with hard hypotheticals - tempting-but-off-mission features,
principle collisions, slippery slopes - whose answers only you can give. You
answer them on an interactive review board, and the reasoning behind each
verdict is reflected in the writing, until VISION.md is sufficient on its
own for an accept/resist test.

- **Evidence over vibes** - every principle cites real merged PRs or commits;
  generic engineering virtues are banned. If your history is unreadable, the
  skill refuses rather than inventing your values.
- **Stress-tested, not brainstormed** - 8-12 fault-line hypotheticals per
  vision, both sides steelmanned; if your answer is predictable, the question
  gets replaced.
- **A house-style review surface** - the package ships a stylesheet and a
  board template the agent fills rather than rewrites: black ink on white
  paper set like literature, your full latest draft always visible,
  hypotheticals dealt one at a time from a stack of cards; a verdict flips the
  card and reveals the next.
- **One alignment surface** - VISION.md is what a reviewer uses; board
  transcripts stay ephemeral and are never committed next to the vision.

For what the result looks like, see
[firstmate's VISION.md](https://github.com/kunchenguid/firstmate/blob/main/VISION.md) -
produced by exactly this process.

## Quick Start

```sh
# install (global recommended)
$ npx skills add kunchenguid/vision -g

# in your agent, inside the target repo
/vision
# or: /vision owner/repo
```

## What it needs

- Read access to the repo and its history: merged PRs via `gh` or `gh-axi`
  when accessible, falling back to default-branch git commit history
  otherwise.
- The review board runs on [lavish-axi](https://www.npmjs.com/package/lavish-axi),
  launched directly through `npx -y lavish-axi` - nothing to install; a
  blocker is reported only if the launch itself fails.
- Any harness: no host-specific agent tools.

## How It Works

```
repo + author
      │
      ▼
┌───────────────────┐
│ learn the pattern │  exemplar visions · anatomy · voice
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ existing vision?  │  yes → delta mode; migrate any answers file
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ mine evidence     │  repo analysis · merged PRs or commit history · evidence sheet
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ draft             │  identity · principles · non-goals · aligns/resisted tests
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ hypotheticals     │  8-12 fault-line proposals, both sides steelmanned
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ review board      │  card-stack verdicts → fold reasoning into draft → approval
└─────────┬─────────┘
          ▼
  VISION.md
```

## Usage

| Invoke | Example |
| ------ | ------- |
| Slash | `/vision` (in repo) or `/vision owner/repo` |
| Natural language | "help me write a VISION.md for this project" |

The agent should auto-invoke when asked to write, refine, or stress-test a
project vision or contribution-acceptance criteria.

## Package layout

```
skills/vision/
  SKILL.md                   # the complete agent contract, self-contained
  assets/
    review.css               # the house-style review surface, used as-is
    review-template.html     # the board template; agents fill slots, never restyle
```

Ships as an [`npx skills`](https://github.com/vercel-labs/skills) package.

## Development

```sh
# edit the skill
$EDITOR skills/vision/SKILL.md

# smoke-test discovery locally
npx skills add ./ -l

# install from this checkout
npx skills add ./ -g -y
```

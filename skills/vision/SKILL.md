---
name: vision
description: >
  Draft and stress-test a repository's vision - in an existing VISION.md, or
  otherwise as the Vision section of STRATEGY.md - then iterate with the
  author on an interactive review board until approved. Use on /vision or when
  asked to create or refine a project vision.
user-invocable: true
metadata:
  short-description: "Evidence-mined, stress-tested project vision for any repo"
---

# /vision

You are running the **vision** skill. Produce a vision document the author
can approve: an acceptance policy for the project's future, grounded in what
they actually build, and sharpened by hypotheticals they answer on an
interactive review board.

The **vision document** is VISION.md when the repo already has one at its
root, and otherwise the Vision section of STRATEGY.md (Step 2 picks it). It is
the only committed alignment surface. A reviewer who has never seen the board
must be able to accept or resist a change from it alone.

STRATEGY.md is shared: other sections may cover other parts of strategy and
belong to other writers. In STRATEGY.md this skill writes only its Vision
section, and only proposes edits anywhere else.

This is not a writing exercise. Follow this file top to bottom.

## Host requirement

You need read access to the target repository and its real history:

- Prefer merged-PR history via a GitHub-class CLI (gh, gh-axi).
- If PRs are not accessible, fall back to git commit history on the default
  branch (git log): titles and messages still reveal what the author builds.
- Only if no real history is readable at all, **stop** and say so. Never
  fabricate the author's values, PR titles, or evidence. A vision built on
  invented evidence is worse than no vision.

The review loop runs on lavish-axi, executed directly through
`npx -y lavish-axi` - no install requirement. Simply try to launch it, and
report a blocker only if the launch itself fails.

## Hard rules

1. **Evidence over vibes.** Every principle in the draft must be traceable to
   concrete evidence: named PRs or commits, files, docs, or reasoning the
   author approved into the vision document. Generic engineering virtues
   ("we value quality") are banned unless the history demonstrates them specifically.
2. **Check for an existing vision first.** If the default branch has a
   VISION.md, or a STRATEGY.md with a Vision section, switch to delta mode:
   treat it as the approved baseline, propose line-level candidate changes
   from evidence newer than it, and never write a competing document.
3. **The author owns the vision.** You draft, stress-test, and fold in their
   verdicts; you never approve, never soften a hypothetical to please, and
   never fold in a principle they did not state or demonstrate.
4. **A vision is an acceptance policy.** Write testable accept/resist criteria
   in declarative present tense, with explicit non-goals, so a future reader,
   human or agent, can apply them to a concrete change from the vision
   document alone. A Vision section never defers to another section of
   STRATEGY.md for its accept/resist test.
5. **No softball hypotheticals.** Each one must sit on a genuine fault line
   where yes and no are both defensible, with both sides steelmanned. If you
   can predict the author's answer, replace the hypothetical.
6. **The review loop runs on lavish-axi, from the shipped template.** Draft
   and hypotheticals are presented as one board built from
   `assets/review-template.html` + `assets/review.css`, used as-is: black ink
   on white paper set like literature, full draft always fully visible, one
   hypothetical at a time in a card stack. Fill the template's slots; never
   restyle or restructure it, and never substitute another review surface.
7. **Iterate in batches, trace every edit.** Each author verdict maps to a
   named edit in a changelog; the author must be able to see exactly how their
   answer changed the text.
8. **Formatting.** One sentence per line. Plain hyphens, never em dashes. No
   roadmap, no feature list, no marketing voice.
9. **The vision document is the single alignment surface.** Fold the
   author's reasoning into the prose wherever it matters, in whatever form
   reads best. Never copy hypotheticals or board transcripts into it. Never
   write, keep, or point to an answers file in the target repo. Board
   transcripts may live in the tool's scratch area and must never be
   committed.
10. **Hands off the rest of STRATEGY.md.** After a run, every byte outside
    the Vision section is unchanged, except consolidation edits the author
    approved one at a time (Step 7). Never reorder, rename, or restyle other
    sections, and never change the title, frontmatter, or a `last_updated`
    date.

## Pipeline

### Step 0 - Parse target and author

- Target repo: current working directory by default, or an explicit
  owner/repo.
- Author: the person whose vision this is; default to the repo owner. Their
  merged work is the evidence base.
- Ask one short question if the target or author is genuinely ambiguous.

### Step 1 - Learn the pattern

A vision has a stable anatomy; hold the draft to it:

- Identity opener: "X exists so that ...", who it serves, and "It owns exactly
  one thing: ...".
- 3-6 principle sections with short declarative headings, each a set of
  testable present-tense commitments and refusals.
- Explicit non-goals, named concretely ("it is not a CI system, not a ...").
- A closing pair of tests: "A change aligns when ..." and "A change should be
  resisted when ...", concrete enough to apply to a real PR.
- Voice: declarative, present tense, zero marketing; length a page or two
  (40-70 lines). Author reasoning belongs in the prose wherever it matters,
  in whatever form reads best; never as a ledger of questions asked.

If the author names exemplar visions, read them; note shape, voice, length.

### Step 2 - Pick the target, then check for an existing vision

Look only at the repo root on the default branch, by these exact names. The
first match decides:

1. **VISION.md exists** - VISION.md mode: the vision document is the whole
   file, exactly as it always was. If STRATEGY.md also exists, read it as
   background evidence only; never edit it and make no proposals for it.
2. **STRATEGY.md exists** - section mode: the vision document is its Vision
   section (below). If the file has none, the skill adds one.
3. **Neither exists** - section mode in a new STRATEGY.md holding only
   `# {project} Strategy`, a blank line, and the Vision section. No
   frontmatter.

The Vision section starts at a line `## Vision` (any letter case, outside
code blocks) and ends before the next `#` or `##` heading, or at the end of
the file. If more than one such heading exists, ask the author which one is
the vision and stop until answered. A Mission or Principles section belongs to
another writer; it is only a duplicate candidate. A new section goes right
after the title block, before the first other `##` section; nothing else
moves.

Then choose the mode:

- If the vision document exists (VISION.md, or a Vision section): delta mode
  (hard rule 2). Date its baseline from the section's approval marker, else
  from the last commit that touched it, and propose only evidence-backed
  candidate additions or edits newer than that, each independently
  acceptable.
- If not: from-scratch mode.
- If VISION-ANSWERS.md or any companion answers file exists, run Migration
  before drafting: fold any missing reasoning into the vision document,
  delete the answers file, and remove pointers to it.

### Step 3 - Mine the evidence

- Repo analysis: README identity claims, architecture, stated non-goals,
  refusal paths, test discipline.
- In section mode, read the rest of STRATEGY.md as stated intent, like the
  README. Note every line elsewhere in it that says what the Vision section
  will say; those feed both the draft and Step 7's consolidation list.
- History mining: list the author's merged PRs, aim for 30-100 titles, and
  read 8-15 full bodies spread across the range (for example
  `gh pr list --author <owner> --state merged --limit 100`, or the gh-axi
  equivalent). If PRs are inaccessible, walk default-branch commit history
  instead (`git log --author=<owner>`), reading messages for the same signal.
- Extract recurring revealed values: what gets built, what gets refused, what
  class of bug gets fixed at the root, what the author writes in intent
  statements.
- Produce a private evidence sheet: value -> supporting PRs, commits, or
  files. This sheet is the source of truth for every drafted line.

### Step 4 - Draft

- Follow the step 1 anatomy and the output template below. Draft with
  today's heading levels (`# Vision`, `##` principles, `## Scope`) in every
  mode; the review board renders only `#` and `##`. The shift for STRATEGY.md
  happens only when writing (Step 7). In section-mode delta, read the existing
  section back one level up (`## Vision` as `# Vision`) as the baseline.
- Every line must map to the evidence sheet. Length target: 40-70 lines.
- Delta mode instead yields: baseline unchanged + a numbered list of candidate
  line additions/edits, each with its evidence.

### Step 5 - Design the hypotheticals

- 8-12 concrete change proposals per vision, aimed at the draft's fault
  lines. Draw from this taxonomy:
  - tempting-but-off-mission features the author will plausibly be asked for;
  - principle collisions (simplicity vs capability, safety vs speed,
    generality vs focus, cost vs quality);
  - slippery slopes, where one reasonable step normalizes the next;
  - scope expansions (new users, new content types, new hosts, teams);
  - identity questions the draft leaves open.
- Format per hypothetical: id, title, the concrete proposal (2-4 sentences),
  the principle it tests (quote the draft), and why the answer is non-obvious
  (steelman both sides).
- Quality gate: delete and replace any hypothetical whose answer you can
  predict.

### Step 6 - Review loop (lavish-axi, from the shipped template)

- Copy `assets/review-template.html` and `assets/review.css` into the tool's
  scratch area (not the target repo), then fill only the template's marked
  slots: project name, run note, the full DRAFT markdown, and the CARDS array
  (id, title, proposal, tested principle, both-sides steelman per card).
- Change nothing else: the template already carries the house structure -
  full draft on the left, one card at a time on the right, the steelman in
  full view, one queued verdict per card - so no boilerplate is rewritten and
  no run is restyled.
- Launch with `npx -y lavish-axi <board.html>`, report the URL, then wait on
  `npx -y lavish-axi poll <board.html>`; answers arrive as queued verdicts.
- On each batch: fold the author's reasoning into the draft so the vision
  document stays self-sufficient for an accept/resist test. Write it in whatever form
  reads best; do not copy the hypothetical, the card id, or the board
  transcript. Board HTML and poll logs may remain in the tool's scratch
  area; never write an answers file into the target repo. Update the board
  in place (new draft text, remaining cards), and reply through
  `poll --agent-reply` with a changelog line per verdict ("H-7 no ->
  authority section now opens with ...").
- Continue until the author approves or ends the session. Do not approve on
  their behalf; do not treat silence as approval.

### Step 7 - Finish

- Deliver: the approved vision text (or approved delta). It is the whole
  alignment surface.
- VISION.md mode: write the approved text to VISION.md, as always.
- Section mode, in this order:
  1. Consolidation proposals. After the author approves the draft and before
     writing, list numbered proposals in the chat. Each names the other
     section, quotes its lines and the Vision lines they repeat (judged by
     meaning, not exact wording), and gives the smallest edit: delete those
     lines, or replace them with a one-line pointer to the Vision section.
     Propose nothing for lines that do not repeat the Vision section. A
     section carrying another tool's `<!-- <tool>: author-approved DATE -->`
     marker gets a note, never an edit. Proposals never change the approved
     Vision text; a duplicate stays in Vision and leaves the other section.
  2. Write the Vision section. Move every draft heading down one level
     (`# Vision` becomes `## Vision`, `##` becomes `###`). Put
     `<!-- vision: author-approved YYYY-MM-DD -->` as the first line under
     `## Vision`, refreshing the date on each later approval. Replace only the
     section's own lines, or insert it where Step 2 says.
  3. Apply each proposal the author said yes to, exactly that edit and
     nothing more. A no or silence leaves it.
  4. Confirm every other byte of STRATEGY.md is unchanged (hard rule 10).
- Confirm the target repo has no VISION-ANSWERS.md and no other answers file,
  and that README and AGENTS.md do not point at one.
- Do not tell the author to keep an answers file. The changelog lived in the
  review-loop replies; it is not a committed artifact.

## Output template (from-scratch mode)

On the board and in VISION.md:

    # Vision

    `{project}` exists so that {the one-sentence reason the project exists}.
    It serves {the named user}, and it {what it turns their input into}.
    It owns exactly one thing: {the single owned surface}.

    ## {Principle section, 3-6 of these}

    {Declarative, testable, present-tense lines; one sentence per line.}
    {Explicit boundaries: what is welcome, what is refused, and why.}

    ## Scope

    {What this project is not, named concretely.}
    {Where personal/private material stays, if applicable.}
    {How the repo holds itself to its own standard, if applicable.}

    A change aligns when {testable positive criteria}.
    A change should be resisted when {testable negative criteria}.

In STRATEGY.md, the same text one heading level lower, with the approval
marker (a new file gets only the title line above it):

    # {project} Strategy

    ## Vision

    <!-- vision: author-approved YYYY-MM-DD -->

    `{project}` exists so that ...

    ### {Principle section, 3-6 of these}

    ...

    ### Scope

    ...

    ## {Other writers' sections, unchanged}

## Pre-flight checklist (before drafting)

- [ ] Target repo and author resolved
- [ ] Target picked: VISION.md, or the Vision section of STRATEGY.md
- [ ] Existing vision checked (mode chosen)
- [ ] Existing VISION-ANSWERS.md migrated or confirmed absent
- [ ] Evidence sheet built from real PRs or commits (no invented evidence)

## Pre-approval checklist (before the author signs off)

- [ ] Every drafted line traces to the evidence sheet or author reasoning
      reflected in the vision document
- [ ] 8-12 hypotheticals, none predictable, both sides steelmanned
- [ ] Every author verdict's reasoning is reflected in the draft, with a
      traced changelog line in the review reply
- [ ] The vision document is sufficient on its own for an accept/resist test
- [ ] No answers file written, kept, or pointed to in the target repo
- [ ] Section mode: consolidation proposals listed; nothing outside the
      Vision section changes without the author's yes

## Migration (existing VISION-ANSWERS.md)

When the target repo already has `VISION-ANSWERS.md` (or any companion
answers or transcript file next to the vision):

1. Read it. Extract the author's reasoning. Discard hypotheticals, card ids,
   verdict labels, steelmans, and board transcripts.
2. Fold any reasoning the vision document lacks into the prose, in whatever form reads
   best. Skip anything already captured. Merge overlapping answers rather
   than one entry per question.
3. Delete the answers file from the target repo.
4. Remove pointers to it from AGENTS.md, README, and any other committed doc.

Length bar: the vision document stays a page or two (target 40-70 lines),
not a ledger. If folding would grow it into a Q&A dump, distill harder. The
test is: a reviewer who has never seen the board can accept or resist a
concrete change from the vision document alone.

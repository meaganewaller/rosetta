---
name: effective-prompting
description: >-
  Use when writing or reviewing a prompt for an LLM — making it specific, structured, and
  testable (clear task, role/context, examples, an explicit output contract, decomposition,
  room to reason) and avoiding the anti-patterns that make prompts brittle. Provider-agnostic.
---

# Effective prompting

A prompt is a spec. Most "the model got it wrong" problems are underspecified prompts. Write
the prompt the way you'd brief a sharp contractor who can't ask follow-up questions.

## Make it specific

- State the **task, inputs, constraints, and the exact output shape** explicitly. Don't make
  the model guess the format or the success criteria.
- Add a **role or context** only when it changes behavior ("you are a security reviewer"),
  not as decoration.
- Front-load the stable instructions; put the volatile input (the actual data/question) last.
  It reads clearly and plays well with prompt caching.

## Show, don't just tell

- Give a **few examples** for anything format- or judgment-sensitive — especially edge cases
  and the tricky "don't do this" cases. Examples beat adjectives.
- For machine-consumed output, specify a **schema** and ask for structured output (JSON or a
  tool/function call), then **validate** it — don't regex prose.

## Give room to reason

- For multi-step tasks, ask the model to **work through it before the final answer**, and
  separate the reasoning from the answer with a delimiter you can parse. Don't force
  answer-first and then complain about quality.
- **Decompose** genuinely complex tasks into steps or separate calls rather than one mega-prompt.

## Iterate against real failures

- Collect actual failing inputs, then add a targeted instruction or example for each. Don't
  pile on prophylactic rules for failures you haven't seen — over-constraining hurts quality.

## Anti-patterns to flag

- Vague asks; contradictory instructions; the real task buried under preamble.
- Demanding a format with no example; "be creative but exact"; asking for reasoning then
  parsing the whole blob as the answer.
- Stuffing irrelevant context "just in case" — it dilutes attention and costs tokens.

> Out of scope: model selection, temperature/thinking/effort knobs, token limits, and exact API
> parameters are **provider-specific** — consult your provider's docs. This skill is prompt craft.

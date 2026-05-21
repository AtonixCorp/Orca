<!--
================================================================================
 File: .github/PULL_REQUEST_TEMPLATE.md
 Purpose: Standard PR description structure to make review efficient.
================================================================================
-->

## What

<!-- Brief description of the change. -->

## Target Branch

<!-- develop, main, release/*, or hotfix/* according to GitFlow. -->

## Why

<!-- Motivation, linked issue, screenshots if UI. -->
Closes #

## How was it tested?

- [ ] Unit tests added / updated
- [ ] Manually verified locally
- [ ] `docker compose` stack validated locally
- [ ] Updated documentation if applicable

## Checklist

- [ ] Conventional Commit title (e.g. `feat(api): ...`)
- [ ] New files include the standard documentation header
- [ ] CI passes (tests, security, containers)
- [ ] Security checklist reviewed
- [ ] No secrets committed

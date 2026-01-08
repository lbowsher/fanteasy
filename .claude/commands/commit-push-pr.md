---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git branch:*), Bash(gh pr create:*), Bash(gh pr view:*)
description: Commit changes, push to remote, and create a pull request
---

# Commit, Push, and Create PR

Perform the following steps to commit all changes, push to remote, and create a pull request:

## 1. Check Current State
- Run `git status` to see all changes
- Run `git diff` to review staged and unstaged changes
- Run `git log -3 --oneline` to see recent commit style

## 2. Stage and Commit
- Stage all relevant changes with `git add`
- Create a commit with a clear message following the repo's style
- End the commit message with:
  ```
  🤖 Generated with [Claude Code](https://claude.ai/code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

## 3. Push to Remote
- Check if the branch tracks a remote: `git branch -vv`
- Push with `git push -u origin <branch>` if needed, or just `git push`

## 4. Create Pull Request
- Use `gh pr create` with a descriptive title and body
- Format the PR body as:
  ```
  ## Summary
  <bullet points of changes>

  ## Test plan
  <how to test the changes>

  🤖 Generated with [Claude Code](https://claude.ai/code)
  ```
- Return the PR URL to the user

## Arguments
If the user provides arguments ($ARGUMENTS), use them as context for the commit message or PR description.

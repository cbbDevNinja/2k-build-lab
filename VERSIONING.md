# Versioning and Rollback

Use this workflow before each meaningful app update.

## 1) Create a snapshot before changes

Run from repo root:

npm run release:snapshot -- "before ux update"

To also push the tag to GitHub:

npm run release:snapshot -- "before ux update" --push

## 2) Make your changes on a branch

git switch -c feat/ux-pass-1

Commit normally while you iterate.

## 3) Safe rollback options

### Option A: inspect old state safely

git switch -c rollback/<tag> <tag>

This gives a separate branch at that snapshot.

### Option B: restore a file from a snapshot tag

git restore --source <tag> path/to/file

Then commit the restoration.

### Option C: rollback a bad commit on main

git revert <commit_hash>

git push origin main

This is safer than rewriting history.

## 4) List all snapshots

npm run release:list

## Suggested naming

- before ux pass
- before search logic tweak
- before production deploy

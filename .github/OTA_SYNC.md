# Safe synchronization from Ota's idobata (EngageWorks)

This repository is an independent copy of `samboofficeota-hue/idobata`, with
a sensitive file removed from its historical commits. **Do not merge or fetch
upstream Git history into this repository.** The original history also exists
in the DD2030 upstream repository.

## Day-to-day operation

1. In repository Settings → Actions → General → Workflow permissions:
   enable **Allow GitHub Actions to create and approve pull requests**.
   Confirm that Actions are enabled. No personal access token or SSH agent
   forwarding is needed for this workflow.
2. Merge the workflow installation PR into `main` (after review).
3. Open **Actions → Safe Ota source snapshot sync → Run workflow** on `main`.
4. The job resolves `samboofficeota-hue/idobata`'s `main` to an exact SHA,
   downloads the *source archive* at that SHA, excludes local/sensitive paths,
   and scans the resulting working tree using Gitleaks before any push.
5. If there are changes, a branch `sync/ota-snapshot-<sha>` and **review-only
   pull request** are created with a collision analysis. If there are
   overlapping changes, the pull request is draft and does not overwrite
   EngageWorks modifications. Resolve all collisions before merging. A successful run with "No source changes" is normal when
   the two current source trees already match.
6. Deploy only a revision of *this* repository that you have approved.

## Hard boundaries

- NEVER run `git merge ota/main`, `git pull ota main`, or import the original
  Git commits/history (including bundle/mirror pushes).
- The importer never clones the source repository with Git. It retrieves a
  source tarball at a resolved SHA.
- `.github/` (trusted workflow code), `.git/`, `.env*`, `app.yaml`,
  `.gitmodules`, and common private key extensions are excluded from syncing.
  Exclusions are **not** a replacement for secret scanning and review.
- The sync branch is not automatically merged, and the workflow does not
  execute build scripts from the imported source.
- The importer compares both sides against the previous Ota snapshot; it
  never overwrites paths modified on both sides. Even if a collision is not
  found, API/behavioral incompatibilities may exist, so review the PR diff.
  Keep EngageWorks infrastructure/configuration in a separate repository.
- If Gitleaks blocks an update, investigate without displaying or committing
  the secret. Do not bypass GitHub Push Protection. Credential revocation and
  rotation must be coordinated with the original key owner.
- A GitHub Actions job that creates a PR may require a maintainer to approve
  PR workflows before they start; inspect the PR's checks manually.

## Recommended repository protection

Use GitHub Settings → Rules → Rulesets (or Branch protection) for `main`:
require pull requests and do not allow force pushes or deletion. For a
single-maintainer repo, do not configure required approvals that cannot be
satisfied. Keep Push Protection enabled and configure relevant checks once
they are reliably running.

## Troubleshooting

- `Workflow is not allowed to create pull requests`: enable the Actions
  setting above. If the branch was already pushed before PR creation failed,
  rerun; the workflow can attach a PR to that existing branch.
- A PR branch was previously closed/merged: the workflow intentionally
  refuses to reopen it for the same source SHA. Review the state manually
  rather than force-pushing it.
- No changes: this only proves that *allowed paths in the source snapshot*
  match the destination. It is not a security certification.
- A Gitleaks warning can include false positives or missed secrets. Never
  blindly allow or suppress findings.

Original OpenRouter key incident: historical `idea-discussion/backend/app.yaml`
was blocked by GitHub Push Protection; current application source removed it,
but the source repository's historical exposure remains a separate
credential-rotation issue.

## Continuous checks

The separate `.github/workflows/scan-secrets.yml` runs Gitleaks on pull
requests and pushes to `main`, including changes made outside the sync action.
This is a working-tree scan; GitHub Push Protection additionally helps catch
credentials in pushed commits. Neither mechanism guarantees that all secrets
are detected. After verifying that this workflow actually runs, require its
`Gitleaks worktree` check in the `main` ruleset if available.

## Collision detection (Actions + PR)

The baseline `.github/ota-upstream-base.sha` records the **last completely
integrated Ota source snapshot**. The import job downloads two immutable
archives (previous baseline and current Ota main) and compares them with
the current EngageWorks source tree. It is intentionally conservative at
the **file-path level**:

| Compared path | Action |
| --- | --- |
| Changed only in Ota | Apply upstream version |
| Changed only in EngageWorks | Keep EngageWorks version |
| Both changed, but already identical to new Ota | Treat as integrated |
| Both changed to different content | **Preserve EngageWorks content; report collision** |
| Removed in Ota, edited in EngageWorks | **Preserve EngageWorks content; report collision** |

The GitHub Action writes a Japanese-language collision report to its job
summary **and the created PR description**. The PR contains only safe
(non-colliding) updates. If there are collisions, the PR is **DRAFT**, includes
`.github/OTA_SYNC_PENDING.md` and the baseline is **not advanced**.
The separate Secrets scan refuses to pass while that pending file exists.

### Resolving a collision

1. Review the Ota version, EngageWorks version and old baseline. A path-level
   collision does not necessarily mean the same lines conflict.
2. On the sync PR branch, implement/review the correct combined code for
   every listed path, rather than selecting Ota wholesale.
3. Once **every** conflict is resolved and tested, delete
   `.github/OTA_SYNC_PENDING.md` and update
   `.github/ota-upstream-base.sha` to the **new Ota SHA from the PR body**.
   These are deliberate maintainer actions; the Action never marks a
   partial integration complete.
4. Run/re-run the Secrets scan on that branch if it has not run
   automatically. Check that it passes, review the complete diff, mark
   the draft PR ready, and merge it.

The sync job explicitly dispatches `Secrets scan` on its generated branch,
because GitHub events caused by `GITHUB_TOKEN` alone typically do not trigger
another workflow run. The job uses `actions: write` for that dispatch.
The scanning job itself requires read-only contents permission.

**Limitations:** This is a conservative file-path overlap detector, not a
semantic or dependency-level compatibility analyzer. No automated check can
guarantee that an upstream API change won't break an EngageWorks extension
in a different file. Regression testing and review are still required.

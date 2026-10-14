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
   pull request** are created. Review the full diff, test behavior and then
   merge manually. A successful run with "No source changes" is normal when
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
- Upstream changes may overwrite EngageWorks-specific source code or delete
  previously present files. The PR diff is the final review gate; keep
  EngageWorks infrastructure/configuration in a separate repository.
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

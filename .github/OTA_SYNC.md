# Upstream source synchronization

This repository supports a source-snapshot synchronization workflow.

## Workflow

1. Use **Actions → Safe Ota source snapshot sync → Run workflow**.
2. The workflow compares the last integrated upstream snapshot, the new
   upstream snapshot, and the current local working tree.
3. Non-overlapping changes are proposed in a pull request. Overlapping
   file changes are preserved and reported as review items.
4. If overlaps exist, resolve all listed items on the draft PR branch.
5. Remove the pending-review marker and advance the recorded upstream SHA
   only after all overlaps are resolved and tested.
6. Run the checks, review the diff, and merge when appropriate.

The workflow imports source archives only. Do not merge upstream Git
history into this repository. Sync PRs are never merged automatically.

Secret scanning and repository-specific checks run in CI. Check failures
require investigation before merging.

The comparison is file-level; runtime and API compatibility still need
review and testing.

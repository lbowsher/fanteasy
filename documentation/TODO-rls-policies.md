# TODO: RLS Policy Changes for Draft

These RLS policy changes should be applied **after** verifying the draft works end-to-end with the new RPC-based flow.

## 1. Block direct `draft_picks` INSERT/UPDATE

All picks now go through the `make_draft_pick` RPC (which runs as `SECURITY DEFINER`). Remove or restrict the existing RLS policies that allow clients to directly INSERT or UPDATE `draft_picks`.

## 2. Restrict `draft_settings` UPDATE to commissioner

Only the league commissioner should be able to UPDATE `draft_settings` (start draft, pause/resume, change timer). Add a policy that checks the authenticated user is the commissioner of the league that owns the draft.

## 3. Restrict `draft_queue` to own team

Ensure `draft_queue` INSERT/UPDATE/DELETE policies only allow users to modify queue entries for their own team.

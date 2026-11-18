import { describeDraft, type NoteDraft } from "./lib/draft";

export type { NoteDraft };

/**
 * What the note editor shows for the text in the box: the character count
 * against the limit, and whether Save should be offered. `savedBody` is the
 * note as last saved, or "" when there is none.
 */
export function describeNoteDraft(draft: string, savedBody: string): NoteDraft {
  return describeDraft(draft, savedBody);
}

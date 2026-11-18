import { MAX_NOTE_LENGTH } from "~/lib/notes";

export type NoteDraft = {
  characterCount: number;
  limit: number;
  tooLong: boolean;
  unchanged: boolean;
  canSave: boolean;
};

export function describeDraft(draft: string, savedBody: string): NoteDraft {
  // The save action trims before it checks the limit and stores the body, so
  // measure and compare what it will actually keep. `savedBody` came out of
  // the save action, so it is trimmed already.
  const kept = draft.trim();
  const characterCount = kept.length;
  const tooLong = characterCount > MAX_NOTE_LENGTH;
  const unchanged = kept === savedBody;

  return {
    characterCount,
    limit: MAX_NOTE_LENGTH,
    tooLong,
    unchanged,
    canSave: !tooLong && !unchanged && characterCount > 0,
  };
}

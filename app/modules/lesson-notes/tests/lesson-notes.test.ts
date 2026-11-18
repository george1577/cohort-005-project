import { describe, expect, it } from "vitest";
import { describeNoteDraft } from "../index";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

describe("describeNoteDraft", () => {
  it("offers Save for new text", () => {
    expect(describeNoteDraft("Generics are like parameters", "")).toEqual({
      characterCount: 28,
      limit: MAX_NOTE_LENGTH,
      tooLong: false,
      unchanged: false,
      canSave: true,
    });
  });

  it("does not offer Save when the text matches the saved note", () => {
    const draft = describeNoteDraft("same", "same");
    expect(draft.unchanged).toBe(true);
    expect(draft.canSave).toBe(false);
  });

  it("does not offer Save for a blank note, even over a saved one", () => {
    const draft = describeNoteDraft("   \n ", "saved before");
    expect(draft.unchanged).toBe(false);
    expect(draft.canSave).toBe(false);
  });

  it("allows a note exactly at the limit", () => {
    const draft = describeNoteDraft("a".repeat(MAX_NOTE_LENGTH), "");
    expect(draft.tooLong).toBe(false);
    expect(draft.canSave).toBe(true);
  });

  it("flags a note over the limit and does not offer Save", () => {
    const draft = describeNoteDraft("a".repeat(MAX_NOTE_LENGTH + 1), "");
    expect(draft.characterCount).toBe(MAX_NOTE_LENGTH + 1);
    expect(draft.tooLong).toBe(true);
    expect(draft.canSave).toBe(false);
  });
});

describe("describeNoteDraft, against what the save action keeps", () => {
  it("treats added surrounding whitespace as no change", () => {
    const draft = describeNoteDraft("  same\n", "same");
    expect(draft.unchanged).toBe(true);
    expect(draft.canSave).toBe(false);
  });

  it("does not count surrounding whitespace towards the limit", () => {
    const draft = describeNoteDraft(` ${"a".repeat(MAX_NOTE_LENGTH)} `, "");
    expect(draft.characterCount).toBe(MAX_NOTE_LENGTH);
    expect(draft.tooLong).toBe(false);
    expect(draft.canSave).toBe(true);
  });

  it("offers Save when the saved note is edited", () => {
    expect(describeNoteDraft("same, but more", "same").canSave).toBe(true);
  });
});

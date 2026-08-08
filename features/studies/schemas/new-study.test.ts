import { describe, expect, it } from "vitest";
import { newStudySchema } from "./new-study";

const base = {
  study_code: "ST-1",
  sex: "unknown",
  images: [
    {
      fileName: "x.png",
      fileType: "image/png",
      fileSize: 100,
      view: "PA",
      laterality: "left",
    },
  ],
};

function makeImages(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    fileName: `${i}.png`,
    fileType: "image/png" as const,
    fileSize: 100,
    view: "PA" as const,
    laterality: "left" as const,
  }));
}

describe("newStudySchema age bounds", () => {
  it("accepts 0.2", () => {
    expect(newStudySchema.safeParse({ ...base, age_years: 0.2 }).success).toBe(
      true,
    );
  });

  it("accepts 19", () => {
    expect(newStudySchema.safeParse({ ...base, age_years: 19 }).success).toBe(
      true,
    );
  });

  it("rejects below 0.2", () => {
    expect(newStudySchema.safeParse({ ...base, age_years: 0.1 }).success).toBe(
      false,
    );
  });

  it("rejects above 19", () => {
    expect(newStudySchema.safeParse({ ...base, age_years: 19.1 }).success).toBe(
      false,
    );
  });

  it("rejects the old 25 upper bound", () => {
    expect(newStudySchema.safeParse({ ...base, age_years: 25 }).success).toBe(
      false,
    );
  });
});

describe("newStudySchema image count", () => {
  it("accepts up to 8 images", () => {
    expect(
      newStudySchema
        .safeParse({ ...base, age_years: 10, images: makeImages(8) }).success,
    ).toBe(true);
  });

  it("rejects more than 8 images", () => {
    expect(
      newStudySchema
        .safeParse({ ...base, age_years: 10, images: makeImages(9) }).success,
    ).toBe(false);
  });

  it("rejects zero images", () => {
    expect(
      newStudySchema
        .safeParse({ ...base, age_years: 10, images: [] }).success,
    ).toBe(false);
  });
});

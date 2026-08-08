import { describe, expect, it } from "vitest";
import {
  mapLaterality,
  mapPredictImageToDb,
  mapSex,
  mapView,
  toPredictRequest,
} from "./inference-mappers";

describe("mapSex", () => {
  it("maps known values", () => {
    expect(mapSex("male")).toBe("male");
    expect(mapSex("female")).toBe("female");
  });

  it("falls back to unknown", () => {
    expect(mapSex(null)).toBe("unknown");
    expect(mapSex("OTHER")).toBe("unknown");
  });
});

describe("mapView", () => {
  it("passes through known views", () => {
    expect(mapView("PA")).toBe("PA");
    expect(mapView("AP")).toBe("AP");
    expect(mapView("LATERAL")).toBe("LATERAL");
    expect(mapView("OTHER")).toBe("OTHER");
  });

  it("falls back to UNKNOWN", () => {
    expect(mapView(null)).toBe("UNKNOWN");
    expect(mapView("OBLIQUE")).toBe("UNKNOWN");
  });
});

describe("mapLaterality", () => {
  it("maps known values", () => {
    expect(mapLaterality("left")).toBe("left");
    expect(mapLaterality("right")).toBe("right");
  });

  it("falls back to unknown", () => {
    expect(mapLaterality(null)).toBe("unknown");
    expect(mapLaterality("bilateral")).toBe("unknown");
  });
});

describe("toPredictRequest", () => {
  it("builds a valid request with explicit mappings", () => {
    const request = toPredictRequest({
      studyId: "study-1",
      ageYears: 10,
      sex: "male",
      images: [
        {
          image_id: "img-1",
          image_url: "https://r2.example/x",
          view: "PA",
          laterality: "left",
        },
        {
          image_id: "img-2",
          image_url: "https://r2.example/y",
          view: "WEIRD",
          laterality: null,
        },
      ],
    });

    expect(request.study_id).toBe("study-1");
    expect(request.age_years).toBe(10);
    expect(request.sex).toBe("male");
    expect(request.images[0]).toEqual({
      image_id: "img-1",
      image_url: "https://r2.example/x",
      view: "PA",
      laterality: "left",
    });
    expect(request.images[1]).toEqual({
      image_id: "img-2",
      image_url: "https://r2.example/y",
      view: "UNKNOWN",
      laterality: "unknown",
    });
  });
});

describe("mapPredictImageToDb", () => {
  it("preserves boxes=[]", () => {
    expect(
      mapPredictImageToDb({
        image_id: "a",
        triage_score: 0.5,
        valid_patch_fraction: 1,
        boxes: [],
      }),
    ).toEqual({
      image_id: "a",
      triage_score: 0.5,
      valid_patch_fraction: 1,
      boxes: [],
    });
  });

  it("preserves boxes=null", () => {
    expect(
      mapPredictImageToDb({
        image_id: "a",
        triage_score: 0.5,
        valid_patch_fraction: 1,
        boxes: null,
      }),
    ).toEqual({
      image_id: "a",
      triage_score: 0.5,
      valid_patch_fraction: 1,
      boxes: null,
    });
  });

  it("maps missing boxes to null", () => {
    expect(
      mapPredictImageToDb({
        image_id: "a",
        triage_score: 0.5,
        valid_patch_fraction: 1,
      }),
    ).toEqual({
      image_id: "a",
      triage_score: 0.5,
      valid_patch_fraction: 1,
      boxes: null,
    });
  });
});

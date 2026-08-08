import { renderToString } from "react-dom/server";
import React from "react";
import { describe, expect, it } from "vitest";
import { ReviewOutcomesChart } from "./review-outcomes-chart";
import { AgeDistributionChart } from "./age-distribution-chart";
import { PriorityDistributionChart } from "./priority-distribution-chart";

describe("analytics chart theme colors", () => {
  it("keeps review blue and age teal with theme-aware values", () => {
    const html = renderToString(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(ReviewOutcomesChart, {
          outcomes: { fracture: 2, no_fracture: 0, uncertain: 0 },
        }),
        React.createElement(AgeDistributionChart, {
          distribution: { "0-4": 1, "5-9": 0, "10-14": 1, "15-19": 0 },
        }),
      )
    );
    expect(html).toContain("--color-count: #2563eb");
    expect(html).toContain("--color-count: #3b82f6");
    expect(html).toContain("--color-count: #0d9488");
    expect(html).toContain("--color-count: #2dd4bf");
  });

  it("keeps explicit severity theme colors on priority chart", () => {
    const html = renderToString(
      React.createElement(PriorityDistributionChart, {
        distribution: { critical: 2, high: 0, standard: 0, unscored: 0 },
      })
    );
    expect(html).toContain("#dc2626");
    expect(html).toContain("#ef4444");
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/publish-data/route";

const originalToken = process.env.MEHMET_PUBLISH_TOKEN;

afterEach(() => {
  if (originalToken === undefined) {
    delete process.env.MEHMET_PUBLISH_TOKEN;
  } else {
    process.env.MEHMET_PUBLISH_TOKEN = originalToken;
  }
});

describe("POST /api/publish-data", () => {
  it("rejects a new legacy-shaped bundle without productIdRegistry", async () => {
    process.env.MEHMET_PUBLISH_TOKEN = "test-publish-token";
    const response = await POST(
      new Request("https://example.test/api/publish-data", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-publish-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schemaVersion: 1,
          version: "20260903T120000Z-111111111111",
          publishedAt: "2026-09-03T12:00:00.000Z",
          sourceHash: "1".repeat(64),
          shipments: [],
          products: { products: [] },
          money: {},
          meta: { updatedAt: "2026-09-03T11:59:00.000Z", source: "excel" },
        }),
      })
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("обязана содержать productIdRegistry"),
    });
  });
});

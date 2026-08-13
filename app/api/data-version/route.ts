import { NextResponse } from "next/server";
import { getDataBundle } from "@/lib/dataSource";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const bundle = await getDataBundle();

  return NextResponse.json(
    {
      schemaVersion: bundle.schemaVersion,
      version: bundle.version,
      publishedAt: bundle.publishedAt,
      sourceHash: bundle.sourceHash,
      dataUpdatedAt: bundle.meta.updatedAt,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

import metaData from "@/data/meta.json";

interface DataMeta {
  updatedAt?: string;
  source?: string;
}

export function getDataMeta(): DataMeta {
  try {
    return metaData as DataMeta;
  } catch {
    return {};
  }
}

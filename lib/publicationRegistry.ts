import type { ProductIdRegistryData } from "@/types/dataBundle";

/**
 * Optimistic-lock rules for the registry carried by a published bundle.
 *
 * A legacy current bundle may have no registry. Its version is still the
 * publication point from which the first migrated registry was derived. Once
 * a registry exists, every subsequent bundle must carry it and name the exact
 * current version it was based on.
 */
export interface RegistryPublicationState {
  currentVersion: string | null;
  incomingBaseVersion: string | null | undefined;
  incomingHasRegistry: boolean;
}

export function registryPublicationConflict(
  state: RegistryPublicationState
): string | null {
  if (!state.incomingHasRegistry) {
    return "Новая публикация обязана содержать productIdRegistry";
  }

  if (state.incomingBaseVersion !== state.currentVersion) {
    return `Устаревший productIdRegistry: пакет основан на ${
      state.incomingBaseVersion ?? "отсутствующей версии"
    }, а текущая версия — ${state.currentVersion ?? "отсутствует"}`;
  }

  return null;
}

/**
 * Ensures a later publisher can only append to the active registry. This is a
 * second guard after the optimistic version check: even a publisher based on
 * the current version must not silently remove a retired model or remap an ID.
 */
export function registryHistoryConflict(
  current: ProductIdRegistryData,
  incoming: ProductIdRegistryData
): string | null {
  if (incoming.nextAutoNumber < current.nextAutoNumber) {
    return "Новый productIdRegistry не может уменьшить nextAutoNumber";
  }

  const incomingByName = new Map(
    incoming.entries.map((entry) => [entry.normalizedName, entry])
  );
  for (const entry of current.entries) {
    const next = incomingByName.get(entry.normalizedName);
    if (!next) {
      return `Новый productIdRegistry удаляет сохранённую модель ${entry.name}`;
    }
    if (next.productId !== entry.productId) {
      return `Новый productIdRegistry переназначает ${entry.name} с ${entry.productId}`;
    }
  }

  return null;
}

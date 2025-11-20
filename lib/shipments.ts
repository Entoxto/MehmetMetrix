import shipmentsData from "@/data/shipments.json";
import type { Product } from "@/types/product";
import { toBatch } from "./adapters";
import type { Batch } from "@/types/domain";

export type ShipmentStatusKey = "in_progress" | "ready" | "received" | "received_unpaid" | "inTransit";

interface ShipmentStatusMeta {
  label: string;
  icon: string;
  order: number;
}

export const SHIPMENT_STATUS_META: Record<ShipmentStatusKey, ShipmentStatusMeta> = {
  in_progress: { label: "В производстве", icon: "🛠️", order: 1 },
  ready: { label: "Готов", icon: "✅", order: 2 },
  received_unpaid: { label: "Получено, без оплаты", icon: "🧾", order: 3 },
  received: { label: "Получено", icon: "📦", order: 4 },
  inTransit: { label: "Уже в пути", icon: "🚚", order: 5 },
};

type SizeConfig = Record<string, number>;

export interface ShipmentRawItem {
  productId: string;
  overrideName?: string;
  sizes?: SizeConfig;
  quantityOverride?: number;
  status?: ShipmentStatusKey;
  sample?: boolean;
  note?: string;
  paidPreviously?: boolean;
  noPayment?: boolean;
  inTransit?: boolean;
  showStatusTag?: boolean;
}

export interface ShipmentConfig {
  id: string;
  title: string;
  status: { label: string; icon: string };
  eta?: string;
  receivedDate?: string;
  groupByPayment?: boolean;
  rawItems: readonly ShipmentRawItem[];
}

export interface ShipmentItem {
  id: string;
  productId: string;
  name: string;
  sizeLabels: string[];
  quantity: number | null;
  quantityLabel: string;
  price: number | null;
  total: number | null;
  note?: string;
  hasPrice: boolean;
  status: ShipmentStatusMeta;
  statusKey: ShipmentStatusKey;
  paidPreviously?: boolean;
  noPayment?: boolean;
  needsPayment: boolean;
  inTransit: boolean;
  showStatusTag: boolean;
}

export interface ShipmentWithItems extends ShipmentConfig {
  items: ShipmentItem[];
  totalAmount: number;
  hasPriceGaps: boolean;
  batch: Batch;
}

export const SHIPMENTS_CONFIG: readonly ShipmentConfig[] =
  shipmentsData as readonly ShipmentConfig[];

export const buildShipmentItems = (
  rawItems: readonly ShipmentRawItem[],
  products: readonly Product[],
  { groupByPayment = false, shipmentId }: { groupByPayment?: boolean; shipmentId?: string } = {}
): ShipmentItem[] => {
  const items = rawItems.map<ShipmentItem>((item) => {
    const product = products.find((p) => p.id === item.productId);
    const price = typeof product?.price === "number" ? product.price : null;
    const sizeEntries = item.sizes ? Object.entries(item.sizes) : [];
    const computedQuantity = sizeEntries.reduce((acc, [, count]) => acc + count, 0);
    const effectiveQuantity =
      item.quantityOverride ?? (computedQuantity || (item.sample ? 1 : 0));
    const sizeLabels = sizeEntries.map(([size, count]) => `${size.toUpperCase()} × ${count}`);
    const total =
      price != null && effectiveQuantity != null && !item.paidPreviously && !item.noPayment
        ? price * effectiveQuantity
        : null;
    
    // Логика отображения количества:
    // Если есть явные размеры -> показываем их (даже если это сэмпл, чтобы видеть OneSize x 1).
    // Если размеров нет, но sample=true -> "образец" (если нет override) или "N шт." (если есть).
    // Если ничего нет -> "N шт."
    
    let quantityLabel = "";
    if (item.sample && sizeLabels.length === 0 && !item.quantityOverride) {
        quantityLabel = "образец";
    } else {
        quantityLabel = effectiveQuantity ? `${effectiveQuantity} шт.` : "0 шт.";
    }

    const statusKey: ShipmentStatusKey = item.inTransit
      ? "inTransit"
      : item.status ?? "in_progress";
    const statusMeta = SHIPMENT_STATUS_META[statusKey];
    const needsPayment = !item.paidPreviously && !item.noPayment;

    return {
      id: `${item.productId}-${effectiveQuantity}-${sizeLabels.join("-")}`,
      productId: item.productId,
      name: item.overrideName || product?.name || "Неизвестное изделие",
      sizeLabels,
      quantity: effectiveQuantity,
      quantityLabel,
      price,
      total,
      note: item.note,
      hasPrice: price != null,
      status: statusMeta,
      statusKey,
      paidPreviously: item.paidPreviously,
      noPayment: item.noPayment,
      needsPayment,
      inTransit: item.inTransit ?? false,
      showStatusTag: item.showStatusTag ?? false,
    };
  });

  const sortByStatus = (a: ShipmentItem, b: ShipmentItem) =>
    a.status.order - b.status.order || a.name.localeCompare(b.name);

  if (groupByPayment) {
    return items.sort((a, b) => {
      if (a.needsPayment !== b.needsPayment) {
        if (shipmentId === "shipment-10") {
          return a.needsPayment ? -1 : 1;
        }
        return a.needsPayment ? -1 : 1;
      }
      return sortByStatus(a, b);
    });
  }

  return items.sort(sortByStatus);
};

export const buildShipments = (
  products: readonly Product[],
  configs: readonly ShipmentConfig[] = SHIPMENTS_CONFIG
): ShipmentWithItems[] =>
  configs.map((config) => {
    const items = buildShipmentItems(config.rawItems, products, {
      groupByPayment: config.groupByPayment,
      shipmentId: config.id,
    });
    const totalAmount = items.reduce((sum, item) => sum + (item.total ?? 0), 0);
    const hasPriceGaps = items.some((item) => item.total == null);
    const batch = toBatch(config, products as Product[]);

    return {
      ...config,
      items,
      totalAmount,
      hasPriceGaps,
      batch,
    };
  });

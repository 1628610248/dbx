/**
 * 数据库注册表 — 前端唯一配置入口。
 *
 * ==== 新增/修改数据库只需编辑 drivers.json ====
 *
 * drivers.json 是前后端共享的唯一配置源：
 * - 前端：此文件导入 JSON，派生图标、分类、选项等
 * - 后端：打包时将此 JSON 复制到可执行文件旁，Rust 启动时读取
 *
 * 分类标题的 i18n key 在 `connection.databaseCategory*` 中定义。
 */

import _drivers from "./drivers.json";

// ============================================================================
// 类型定义
// ============================================================================

/** 驱动变体（同一数据库的不同 JDBC/原生实现） */
export interface DriverProfile {
  profile: string;
  label: string;
  agentKey: string;
}

export interface DatabaseDef {
  key: string;
  label: string;
  icon: string;
  category: DatabaseCategory;
  defaultPort: number;
  defaultUser: string;
  drivers?: DriverProfile[];
}

/** 数据库分类 */
export type DatabaseCategory =
  | "sql"
  | "analytics"
  | "domestic"
  | "lightweight"
  | "document"
  | "graph_ai"
  | "timeseries"
  | "mq"
  | "registry_config";

export const DATABASE_CATEGORIES = [
  { key: "sql", order: 1, titleKey: "connection.databaseCategorySql" },
  { key: "analytics", order: 2, titleKey: "connection.databaseCategoryAnalytics" },
  { key: "domestic", order: 3, titleKey: "connection.databaseCategoryDomestic" },
  { key: "lightweight", order: 4, titleKey: "connection.databaseCategoryLightweight" },
  { key: "document", order: 5, titleKey: "connection.databaseCategoryDocument" },
  { key: "graph_ai", order: 6, titleKey: "connection.databaseCategoryGraphAi" },
  { key: "timeseries", order: 7, titleKey: "connection.databaseCategoryTimeseries" },
  { key: "mq", order: 8, titleKey: "connection.databaseCategoryMq" },
  { key: "registry_config", order: 9, titleKey: "connection.databaseCategoryRegistryConfig" },
] as const;

// ============================================================================
// 从 JSON 加载数据
// ============================================================================

/** 数据库注册表 — 编辑 drivers.json 即可新增 */
export const DATABASE_REGISTRY = _drivers as readonly DatabaseDef[];

// 启动时校验 JSON 数据完整性
if (import.meta.env.DEV) {
  const VALID_CATEGORIES = new Set(DATABASE_CATEGORIES.map((c) => c.key));
  for (const db of DATABASE_REGISTRY) {
    if (!db.key) throw new Error(`[drivers.json] missing key`);
    if (!VALID_CATEGORIES.has(db.category)) {
      throw new Error(`[drivers.json] ${db.key}: unknown category "${db.category}"`);
    }
    if (db.drivers) {
      for (const drv of db.drivers) {
        if (!drv.profile || !drv.agentKey) {
          throw new Error(`[drivers.json] ${db.key}.drivers: missing profile or agentKey`);
        }
      }
    }
  }
}

// ============================================================================
// 从注册表派生 DatabaseType
// ============================================================================

/** 数据库类型 — 从 drivers.json 自动派生 */
export type DatabaseType = (typeof DATABASE_REGISTRY)[number]["key"];

// ============================================================================
// 自动派生的工具映射
// ============================================================================

/** 按 key 快速查找 */
export const DATABASE_MAP: Readonly<Record<string, DatabaseDef>> = Object.fromEntries(
  DATABASE_REGISTRY.map((d) => [d.key, d]),
);

/** 生成图标映射 { key: icon } */
export const DATABASE_ICON_MAP: Readonly<Record<string, string>> = Object.fromEntries(
  DATABASE_REGISTRY.map((d) => [d.key, d.icon]),
);

/** 生成 (key, label) 选项列表 */
export const DB_OPTIONS: readonly { value: string; label: string }[] = DATABASE_REGISTRY.map((d) => ({
  value: d.key,
  label: d.label,
}));

/** 按分类分组 */
export const DB_CATEGORY_GROUPS: Readonly<Record<string, string[]>> = (() => {
  const groups: Record<string, string[]> = {};
  for (const cat of DATABASE_CATEGORIES) {
    groups[cat.key] = [];
  }
  for (const db of DATABASE_REGISTRY) {
    groups[db.category]?.push(db.key);
  }
  return groups;
})();

/** 生成 driverProfiles 映射（含驱动变体） */
export const DRIVER_PROFILES: Readonly<Record<string, { type: string; port: number; user: string; label: string; icon: string }>> =
  (() => {
    const entries: Array<[string, { type: string; port: number; user: string; label: string; icon: string }]> = [];
    for (const db of DATABASE_REGISTRY) {
      entries.push([db.key, { type: db.key, port: db.defaultPort, user: db.defaultUser, label: db.label, icon: db.icon }]);
      if (db.drivers) {
        for (const drv of db.drivers) {
          entries.push([drv.profile, { type: db.key, port: db.defaultPort, user: db.defaultUser, label: drv.label, icon: db.icon }]);
        }
      }
    }
    return Object.fromEntries(entries);
  })();

/** Agent 驱动 → 分类映射（包含变体的 agentKey） */
export const AGENT_CATEGORY_MAP: Readonly<Record<string, string>> = (() => {
  const map: Record<string, string> = {};
  for (const db of DATABASE_REGISTRY) {
    map[db.key] = db.category;
    if (db.drivers) {
      for (const drv of db.drivers) {
        map[drv.agentKey] = db.category;
      }
    }
  }
  return map;
})();

/** 驱动变体 → 数据库 key 映射 */
export const DRIVER_PROFILE_DB_MAP: Readonly<Record<string, string>> = (() => {
  const map: Record<string, string> = {};
  for (const db of DATABASE_REGISTRY) {
    if (db.drivers) {
      for (const drv of db.drivers) {
        map[drv.profile] = db.key;
      }
    }
  }
  return map;
})();

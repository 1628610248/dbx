export { DATABASE_CATEGORIES as DRIVER_CATEGORIES } from "@/lib/database/databaseRegistry";
import { AGENT_CATEGORY_MAP, DATABASE_CATEGORIES, type DatabaseCategory } from "@/lib/database/databaseRegistry";
export type { DatabaseCategory as DriverCategoryKey };

const VALID_CATEGORY_KEYS: ReadonlySet<string> = new Set(DATABASE_CATEGORIES.map((cat) => cat.key));

const EMPTY = 0;

// Agent driver keys that don't correspond to a database type (profiles, legacy variants)
const EXTRA_AGENT_DRIVER_CATEGORIES: Readonly<Record<string, DatabaseCategory>> = {
  "h2-legacy": "lightweight",
  "sqlserver-legacy": "sql",
};

export const AGENT_DRIVER_CATEGORY_MAP: Readonly<Record<string, string>> = {
  ...AGENT_CATEGORY_MAP,
  ...EXTRA_AGENT_DRIVER_CATEGORIES,
};

export const getCategoryForAgentDriver = (dbType: string): string => AGENT_DRIVER_CATEGORY_MAP[dbType] ?? "all";

const collectUnmapped = (driverKeys: string[]): string[] => driverKeys.filter((key) => !(key in AGENT_DRIVER_CATEGORY_MAP));

const collectUnknownCategories = (): string[] =>
  Object.entries(AGENT_DRIVER_CATEGORY_MAP)
    .filter(([, category]) => !VALID_CATEGORY_KEYS.has(category))
    .map(([key, category]) => `${key}->${category}`);

const collectDuplicateKeys = (driverKeys: string[]): string[] => driverKeys.filter((key, index) => driverKeys.indexOf(key) !== index).filter((key, index, arr) => arr.indexOf(key) === index);

const formatErrorMessage = (unmapped: string[], unknownCategories: string[], duplicateKeys: string[]): string => {
  const parts: string[] = [];
  if (unmapped.length > EMPTY) {
    parts.push(`unmapped=${unmapped.join(",")}`);
  }
  if (unknownCategories.length > EMPTY) {
    parts.push(`unknownCategories=${unknownCategories.join(",")}`);
  }
  if (duplicateKeys.length > EMPTY) {
    parts.push(`duplicateKeys=${duplicateKeys.join(",")}`);
  }
  return parts.join("; ");
};

/**
 * Validates that every driver key in {@link agentDriverDbTypes} has a category
 * mapping and that all mapped categories are valid. Throws if any driver is
 * unmapped, duplicates appear, or an unknown category is referenced.
 */
export const assertAgentDriverCategoriesComplete = (agentDriverDbTypes: string[]): void => {
  const unmapped = collectUnmapped(agentDriverDbTypes);
  const unknownCategories = collectUnknownCategories();
  const duplicateKeys = collectDuplicateKeys(agentDriverDbTypes);

  if (unmapped.length > EMPTY || unknownCategories.length > EMPTY || duplicateKeys.length > EMPTY) {
    throw new Error(formatErrorMessage(unmapped, unknownCategories, duplicateKeys));
  }

  // Warn in dev if the map has stale entries for drivers not in the catalog.
  if (import.meta.env.DEV) {
    const driverSet = new Set(agentDriverDbTypes);
    const mappedButNotListed = Object.keys(AGENT_DRIVER_CATEGORY_MAP).filter((key) => !driverSet.has(key));
    if (mappedButNotListed.length > EMPTY) {
      // eslint-disable-next-line no-console
      console.warn("[driver-category-definitions] agent driver category map has entries for drivers not in the supplied list:", mappedButNotListed.join(", "));
    }
  }
};

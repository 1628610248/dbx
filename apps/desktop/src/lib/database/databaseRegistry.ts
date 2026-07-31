/**
 * 数据库注册表 — 前端唯一配置入口。
 *
 * 新增数据库只需在这里加一条记录，无需修改 types、图标映射、分类等文件。
 * 一个数据库有多个驱动实现时，在 `drivers` 数组中声明。
 * 分类标题的 i18n key 在 `connection.databaseCategory*` 中定义。
 */

/** 驱动变体（同一数据库的不同 JDBC/原生实现） */
export interface DriverProfile {
  /** 连接配置中的 driver_profile 值 */
  profile: string;
  /** 驱动显示名 */
  label: string;
  /** Agent 驱动 key（对应 agents/drivers/<key> 目录） */
  agentKey: string;
}

export interface DatabaseDef {
  /** 数据库类型标识，同时作为 DatabaseType 联合类型的一员 */
  key: string;
  /** 显示名称 */
  label: string;
  /** 图标文件名（不含扩展名），对应 public/icons/database/<icon>.svg */
  icon: string;
  /** 所属分类 */
  category: DatabaseCategory;
  /** 默认端口 */
  defaultPort: number;
  /** 默认用户名 */
  defaultUser: string;
  /** 可选：替代驱动实现（如 Oracle 有 go-ora / OJDBC17 / OJDBC8） */
  drivers?: readonly DriverProfile[];
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
// 数据库注册表 — 新增数据库只改这里
// ============================================================================
export const DATABASE_REGISTRY = [
  // ── 关系型数据库 ──────────────────────────────────────────────
  { key: "mysql", label: "MySQL", icon: "mysql", category: "sql", defaultPort: 3306, defaultUser: "root" },
  { key: "mariadb", label: "MariaDB", icon: "mariadb", category: "sql", defaultPort: 3306, defaultUser: "root" },
  { key: "tidb", label: "TiDB", icon: "tidb", category: "sql", defaultPort: 4000, defaultUser: "root" },
  { key: "oceanbase", label: "OceanBase", icon: "oceanbase", category: "sql", defaultPort: 2883, defaultUser: "root" },
  { key: "postgres", label: "PostgreSQL", icon: "postgres", category: "sql", defaultPort: 5432, defaultUser: "postgres" },
  { key: "cloudberry", label: "Apache Cloudberry", icon: "cloudberry", category: "sql", defaultPort: 5432, defaultUser: "postgres" },
  { key: "cockroachdb", label: "CockroachDB", icon: "cockroachdb", category: "sql", defaultPort: 26257, defaultUser: "root" },
  { key: "oracle", label: "Oracle", icon: "oracle", category: "sql", defaultPort: 1521, defaultUser: "system",
    drivers: [
      { profile: "oracle-jdbc17", label: "Oracle (OJDBC17)", agentKey: "oracle-jdbc17" },
      { profile: "oracle-jdbc8", label: "Oracle (OJDBC8)", agentKey: "oracle-jdbc8" },
    ] as const,
  },
  { key: "sqlserver", label: "SQL Server", icon: "sqlserver", category: "sql", defaultPort: 1433, defaultUser: "sa" },
  { key: "db2", label: "IBM DB2", icon: "db2", category: "sql", defaultPort: 50000, defaultUser: "db2admin" },
  { key: "informix", label: "IBM Informix", icon: "informix", category: "sql", defaultPort: 9088, defaultUser: "informix" },
  { key: "firebird", label: "Firebird", icon: "firebird", category: "sql", defaultPort: 3050, defaultUser: "sysdba" },
  { key: "iris", label: "InterSystems IRIS", icon: "iris", category: "sql", defaultPort: 1972, defaultUser: "_SYSTEM" },
  { key: "oceanbase-oracle", label: "OceanBase Oracle Mode", icon: "oceanbase", category: "sql", defaultPort: 2883, defaultUser: "system" },
  // ── 分析型数据库 ──────────────────────────────────────────────
  { key: "clickhouse", label: "ClickHouse", icon: "clickhouse", category: "analytics", defaultPort: 8123, defaultUser: "default" },
  { key: "doris", label: "Apache Doris", icon: "doris", category: "analytics", defaultPort: 9030, defaultUser: "root" },
  { key: "starrocks", label: "StarRocks", icon: "starrocks", category: "analytics", defaultPort: 9030, defaultUser: "root" },
  { key: "selectdb", label: "SelectDB", icon: "selectdb", category: "analytics", defaultPort: 9030, defaultUser: "root" },
  { key: "databend", label: "Databend", icon: "databend", category: "analytics", defaultPort: 8000, defaultUser: "root" },
  { key: "databricks", label: "Databricks SQL", icon: "databricks", category: "analytics", defaultPort: 443, defaultUser: "token" },
  { key: "saphana", label: "SAP HANA", icon: "saphana", category: "analytics", defaultPort: 30015, defaultUser: "SYSTEM" },
  { key: "teradata", label: "Teradata", icon: "teradata", category: "analytics", defaultPort: 1025, defaultUser: "dbc" },
  { key: "vertica", label: "Vertica", icon: "vertica.webp", category: "analytics", defaultPort: 5433, defaultUser: "dbadmin" },
  { key: "exasol", label: "Exasol", icon: "exasol", category: "analytics", defaultPort: 8563, defaultUser: "sys" },
  { key: "redshift", label: "Amazon Redshift", icon: "redshift", category: "analytics", defaultPort: 5439, defaultUser: "awsuser" },
  { key: "snowflake", label: "Snowflake", icon: "snowflake", category: "analytics", defaultPort: 443, defaultUser: "snowflake" },
  { key: "trino", label: "Trino", icon: "trino", category: "analytics", defaultPort: 8080, defaultUser: "trino" },
  { key: "prestosql", label: "Presto", icon: "presto", category: "analytics", defaultPort: 8080, defaultUser: "presto" },
  { key: "hive", label: "Apache Hive", icon: "hive", category: "analytics", defaultPort: 10000, defaultUser: "hive" },
  { key: "spark", label: "Apache Spark", icon: "spark-logo.png", category: "analytics", defaultPort: 10000, defaultUser: "spark" },
  { key: "bigquery", label: "Google BigQuery", icon: "bigquery", category: "analytics", defaultPort: 443, defaultUser: "bigquery" },
  { key: "kylin", label: "Apache Kylin", icon: "apache_kylin", category: "analytics", defaultPort: 7070, defaultUser: "ADMIN" },
  { key: "dremio", label: "Dremio", icon: "dremio", category: "analytics", defaultPort: 31010, defaultUser: "dremio" },
  // ── 国产数据库 ────────────────────────────────────────────────
  { key: "dameng", label: "达梦 DM8", icon: "dm", category: "domestic", defaultPort: 5236, defaultUser: "SYSDBA" },
  { key: "opengauss", label: "openGauss", icon: "opengauss", category: "domestic", defaultPort: 5432, defaultUser: "gaussdb" },
  { key: "gaussdb", label: "GaussDB", icon: "gaussdb", category: "domestic", defaultPort: 8000, defaultUser: "gaussdb" },
  { key: "kwdb", label: "浪潮 KWDB", icon: "kwdb", category: "domestic", defaultPort: 5432, defaultUser: "kwdb" },
  { key: "goldendb", label: "GoldenDB", icon: "goldendb.png", category: "domestic", defaultPort: 3306, defaultUser: "root" },
  { key: "tdsql", label: "TDSQL", icon: "tdsql", category: "domestic", defaultPort: 3306, defaultUser: "root" },
  { key: "polardb", label: "PolarDB", icon: "polardb.webp", category: "domestic", defaultPort: 3306, defaultUser: "root" },
  { key: "greatsql", label: "GreatSQL", icon: "greatsql.webp", category: "domestic", defaultPort: 3306, defaultUser: "root" },
  { key: "gbase", label: "GBase", icon: "gbase.png", category: "domestic", defaultPort: 5258, defaultUser: "gbasedbt" },
  { key: "kingbase", label: "人大金仓 KingbaseES", icon: "kingbase", category: "domestic", defaultPort: 54321, defaultUser: "system" },
  { key: "highgo", label: "瀚高 HighGo", icon: "highgo.png", category: "domestic", defaultPort: 5866, defaultUser: "sysdba" },
  { key: "uxdb", label: "优炫 UXDB", icon: "uxdb", category: "domestic", defaultPort: 5432, defaultUser: "uxdb" },
  { key: "yashandb", label: "崖山 YashanDB", icon: "yashandb.png", category: "domestic", defaultPort: 1688, defaultUser: "sys" },
  { key: "vastbase", label: "Vastbase", icon: "vastbase", category: "domestic", defaultPort: 5432, defaultUser: "vastbase" },
  { key: "sundb", label: "SunDB", icon: "sundb", category: "domestic", defaultPort: 3306, defaultUser: "root" },
  { key: "oscar", label: "神通 OSCAR", icon: "oscar.png", category: "domestic", defaultPort: 2003, defaultUser: "SYSDBA" },
  { key: "xugu", label: "虚谷 XuguDB", icon: "xugu.png", category: "domestic", defaultPort: 5138, defaultUser: "SYSDBA" },
  // ── 轻量/嵌入式数据库 ──────────────────────────────────────────
  { key: "sqlite", label: "SQLite", icon: "sqlite", category: "lightweight", defaultPort: 0, defaultUser: "" },
  { key: "rqlite", label: "rqlite", icon: "rqlite.png", category: "lightweight", defaultPort: 4001, defaultUser: "" },
  { key: "turso", label: "Turso", icon: "turso.png", category: "lightweight", defaultPort: 443, defaultUser: "" },
  { key: "cloudflare-d1", label: "Cloudflare D1", icon: "cloudflare-d1", category: "lightweight", defaultPort: 443, defaultUser: "" },
  { key: "duckdb", label: "DuckDB", icon: "duckdb", category: "lightweight", defaultPort: 0, defaultUser: "" },
  { key: "access", label: "Microsoft Access", icon: "access.png", category: "lightweight", defaultPort: 0, defaultUser: "" },
  { key: "h2", label: "H2", icon: "h2", category: "lightweight", defaultPort: 9092, defaultUser: "sa" },
  // ── 文档/NoSQL 数据库 ─────────────────────────────────────────
  { key: "mongodb", label: "MongoDB", icon: "mongodb", category: "document", defaultPort: 27017, defaultUser: "admin" },
  { key: "redis", label: "Redis", icon: "redis", category: "document", defaultPort: 6379, defaultUser: "" },
  { key: "elasticsearch", label: "Elasticsearch", icon: "elasticsearch", category: "document", defaultPort: 9200, defaultUser: "elastic" },
  { key: "easysearch", label: "Easysearch", icon: "easysearch", category: "document", defaultPort: 9200, defaultUser: "admin" },
  { key: "hbase", label: "HBase", icon: "hbase", category: "document", defaultPort: 2181, defaultUser: "" },
  { key: "manticoresearch", label: "Manticore Search", icon: "manticoresearch.png", category: "document", defaultPort: 9306, defaultUser: "" },
  { key: "cassandra", label: "Apache Cassandra", icon: "cassandra", category: "document", defaultPort: 9042, defaultUser: "cassandra" },
  // ── 图/AI 向量数据库 ──────────────────────────────────────────
  { key: "neo4j", label: "Neo4j", icon: "neo4j", category: "graph_ai", defaultPort: 7687, defaultUser: "neo4j" },
  { key: "qdrant", label: "Qdrant", icon: "qdrant", category: "graph_ai", defaultPort: 6333, defaultUser: "" },
  { key: "milvus", label: "Milvus", icon: "milvus.png", category: "graph_ai", defaultPort: 19530, defaultUser: "root" },
  { key: "weaviate", label: "Weaviate", icon: "weaviate", category: "graph_ai", defaultPort: 8080, defaultUser: "" },
  { key: "chromadb", label: "Chroma", icon: "chromadb", category: "graph_ai", defaultPort: 8000, defaultUser: "" },
  // ── 时序数据库 ────────────────────────────────────────────────
  { key: "questdb", label: "QuestDB", icon: "questdb", category: "timeseries", defaultPort: 8812, defaultUser: "admin" },
  { key: "tdengine", label: "TDengine", icon: "tdengine", category: "timeseries", defaultPort: 6030, defaultUser: "root" },
  { key: "iotdb", label: "Apache IoTDB", icon: "iotdb", category: "timeseries", defaultPort: 6667, defaultUser: "root" },
  { key: "influxdb", label: "InfluxDB", icon: "influxdb", category: "timeseries", defaultPort: 8086, defaultUser: "admin" },
  // ── 消息队列 ──────────────────────────────────────────────────
  { key: "mq", label: "Message Queue", icon: "pulsar", category: "mq", defaultPort: 9092, defaultUser: "" },
  { key: "kafka", label: "Apache Kafka", icon: "kafka", category: "mq", defaultPort: 9092, defaultUser: "" },
  { key: "rocketmq", label: "Apache RocketMQ", icon: "rocketmq", category: "mq", defaultPort: 9876, defaultUser: "" },
  { key: "rabbitmq", label: "RabbitMQ", icon: "rabbitmq", category: "mq", defaultPort: 5672, defaultUser: "guest" },
  // ── 注册中心/配置中心 ──────────────────────────────────────────
  { key: "etcd", label: "etcd", icon: "etcd", category: "registry_config", defaultPort: 2379, defaultUser: "root" },
  { key: "zookeeper", label: "Apache ZooKeeper", icon: "zookeeper", category: "registry_config", defaultPort: 2181, defaultUser: "" },
  { key: "nacos", label: "Nacos", icon: "nacos.png", category: "registry_config", defaultPort: 8848, defaultUser: "nacos" },
  // ── 通用 JDBC ─────────────────────────────────────────────────
  { key: "jdbc", label: "Generic JDBC", icon: "jdbcx", category: "sql", defaultPort: 0, defaultUser: "" },
] as const satisfies readonly DatabaseDef[];

// ============================================================================
// 自动派生的类型和工具
// ============================================================================

/** 从注册表派生的 DatabaseType 联合类型 */
export type DatabaseType = (typeof DATABASE_REGISTRY)[number]["key"];

/** 按 key 快速查找 */
export const DATABASE_MAP: Readonly<Record<string, DatabaseDef>> = Object.fromEntries(
  DATABASE_REGISTRY.map((d) => [d.key, d]),
) as Readonly<Record<string, DatabaseDef>>;

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
export const DB_CATEGORY_GROUPS: Readonly<Record<DatabaseCategory, string[]>> = (() => {
  const groups: Record<string, string[]> = {};
  for (const cat of DATABASE_CATEGORIES) {
    groups[cat.key] = [];
  }
  for (const db of DATABASE_REGISTRY) {
    groups[db.category]?.push(db.key);
  }
  return groups as Record<DatabaseCategory, string[]>;
})();

/** 生成 driverProfiles 映射（含驱动变体） */
export const DRIVER_PROFILES: Readonly<Record<string, { type: DatabaseType; port: number; user: string; label: string; icon: string }>> =
  (() => {
    const entries: Array<[string, { type: DatabaseType; port: number; user: string; label: string; icon: string }]> = [];
    for (const db of DATABASE_REGISTRY as readonly DatabaseDef[]) {
      entries.push([db.key, { type: db.key, port: db.defaultPort, user: db.defaultUser, label: db.label, icon: db.icon }]);
      if (db.drivers) {
        for (const drv of db.drivers) {
          entries.push([drv.profile, { type: db.key, port: db.defaultPort, user: db.defaultUser, label: drv.label, icon: db.icon }]);
        }
      }
    }
    return Object.fromEntries(entries) as Readonly<Record<string, { type: DatabaseType; port: number; user: string; label: string; icon: string }>>;
  })();

/** Agent 驱动 → 分类映射（包含变体的 agentKey） */
export const AGENT_CATEGORY_MAP: Readonly<Record<string, DatabaseCategory>> = (() => {
  const map: Record<string, DatabaseCategory> = {};
  for (const db of DATABASE_REGISTRY as readonly DatabaseDef[]) {
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
  for (const db of DATABASE_REGISTRY as readonly DatabaseDef[]) {
    if (db.drivers) {
      for (const drv of db.drivers) {
        map[drv.profile] = db.key;
      }
    }
  }
  return map;
})();

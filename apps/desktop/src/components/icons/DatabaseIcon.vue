<script setup lang="ts">
import { computed } from "vue";
import { Database } from "@lucide/vue";
import { useTheme } from "@/composables/useTheme";
import { webPath } from "@/lib/common/webPath";
import { DATABASE_ICON_MAP } from "@/lib/database/databaseRegistry";

const props = defineProps<{
  dbType: string;
}>();
const { isDark } = useTheme();

const assetIcons: Record<string, string> = {
  // 从注册表自动生成
  ...DATABASE_ICON_MAP,
  // 别名 / 向后兼容
  postgresql: "postgres",
  mongodb_legacy: "mongodb",
  dameng: "dm",
  oracle_10g: "oracle",
  oracle_legacy: "oracle",
  sqlserver: "sqlserver",
  access: "access.png",
  oceanbase: "oceanbase",
  oceanbase_oracle: "oceanbase",
  opengauss: "opengauss",
  gaussdb: "gaussdb",
  questdb: "questdb",
  kwdb: "kwdb",
  kingbase: "kingbase",
  highgo: "highgo.png",
  uxdb: "uxdb",
  goldendb: "goldendb.png",
  databend: "databend",
  vastbase: "vastbase",
  yashandb: "yashandb.png",
  snowflake: "snowflake",
  h2: "h2",
  dm: "dm",
  presto: "presto",
  prestosql: "presto",
  hive: "hive",
  hbase: "hbase",
  spark: "spark-logo.png",
  apache_kylin: "apache_kylin",
  sundb: "sundb",
  trino: "trino",
  kylin: "apache_kylin",
  cockroachdb: "cockroachdb",
  db2: "db2",
  dremio: "dremio",
  bigquery: "bigquery",
  cassandra: "cassandra",
  doris: "doris",
  manticoresearch: "manticoresearch.png",
  selectdb: "selectdb",
  tdengine: "tdengine",
  starrocks: "starrocks",
  redshift: "redshift",
  neo4j: "neo4j",
  informix: "informix",
  databricks: "databricks",
  saphana: "saphana",
  teradata: "teradata",
  vertica: "vertica.webp",
  firebird: "firebird",
  exasol: "exasol",
  gbase: "gbase.png",
  gbase8a: "gbase.png",
  gbase8s: "gbase.png",
  tdsql: "tdsql",
  polardb: "polardb.webp",
  greatsql: "greatsql.webp",
  xugu: "xugu.png",
  iotdb: "iotdb",
  etcd: "etcd",
  qdrant: "qdrant",
  milvus: "milvus.png",
  weaviate: "weaviate",
  chromadb: "chromadb",
  mq: "pulsar",
  pulsar: "pulsar",
};

const normalizedType = computed(() => props.dbType.toLowerCase().replace(/[\s-]+/g, "_"));
const assetName = computed(() => {
  const direct = assetIcons[normalizedType.value];
  if (direct) return direct;
  // Fallback: strip known community-driver suffixes (e.g. oracle-jdbc17 → oracle)
  const stripped = normalizedType.value.replace(/(-jdbc\d+|-[a-z]+\d+|-10g|-legacy)$/i, "");
  if (stripped !== normalizedType.value) {
    return assetIcons[stripped];
  }
  return undefined;
});
const useLightIconInDarkMode = computed(() => normalizedType.value === "easysearch" && isDark.value);
const assetSrc = computed(() => {
  if (!assetName.value) return "";
  if (normalizedType.value === "uxdb" && isDark.value) return webPath("/icons/database/uxdb-dark.svg");
  return webPath(assetName.value.includes(".") ? `/icons/database/${assetName.value}` : `/icons/database/${assetName.value}.svg`);
});
</script>

<template>
  <img v-if="assetName" :src="assetSrc" alt="" class="database-logo object-contain" :class="{ 'database-logo-light': useLightIconInDarkMode }" aria-hidden="true" />
  <Database v-else class="text-blue-400" />
</template>

<style scoped>
.database-logo {
  transform: scale(1.35);
  transform-origin: center;
}

.database-logo-light {
  filter: brightness(0) invert(82%);
}
</style>

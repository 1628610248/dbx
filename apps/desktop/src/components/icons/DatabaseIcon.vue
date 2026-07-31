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
  mq: "pulsar",
  pulsar: "pulsar",
  apache_kylin: "apache_kylin",
  kylin: "apache_kylin",
  presto: "presto",
  gbase8a: "gbase.png",
  gbase8s: "gbase.png",
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

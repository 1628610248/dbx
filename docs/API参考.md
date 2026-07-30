# API 参考

## MCP 服务器工具

DBX MCP 服务器提供以下 AI 助手可调用的工具（Tools），遵循 Model Context Protocol 规范。

### 连接管理

#### `dbx_list_connections`
列出 DBX 中配置的所有数据库连接。

**参数：** 无

**返回：** 连接 ID、名称、数据库类型、端点、已选数据库

---

#### `dbx_add_connection`
向 DBX 添加新的数据库连接。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 连接名称 |
| `db_type` | string | ✅ | 数据库类型（如 `mysql`、`postgresql`、`sqlite`） |
| `host` | string | ✅ | 主机地址 |
| `port` | u16 | ❌ | 端口号 |
| `username` | string | ❌ | 用户名 |
| `password` | string | ❌ | 密码 |
| `database` | string | ❌ | 默认数据库 |
| `ssl` | bool | ❌ | 是否启用 SSL |
| `driver_profile` | string | ❌ | 驱动配置名称 |

---

#### `dbx_remove_connection`
从 DBX 中移除数据库连接。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `connection_name` | string | ✅ | 要移除的连接名称 |
| `connection_id` | string | ❌ | 要移除的连接 ID |

---

### Schema 浏览

#### `dbx_list_tables`
列出数据库中的表和视图。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `connection_id` | string | ❌ | 连接 ID（与 `connection_name` 二选一） |
| `connection_name` | string | ❌ | 连接名称（与 `connection_id` 二选一） |
| `database` | string | ❌ | 数据库名 |
| `schema` | string | ❌ | Schema 名 |

---

#### `dbx_describe_table`
获取表的列定义信息。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `connection_id` | string | ❌ | 连接 ID |
| `connection_name` | string | ❌ | 连接名称 |
| `table` | string | ✅ | 表名 |
| `database` | string | ❌ | 数据库名 |
| `schema` | string | ❌ | Schema 名 |

---

#### `dbx_get_schema_context`
获取 Schema 上下文用于辅助编写 SQL，返回紧凑的表和列信息。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `connection_id` | string | ❌ | 连接 ID |
| `connection_name` | string | ❌ | 连接名称 |
| `database` | string | ❌ | 数据库名 |
| `schema` | string | ❌ | Schema 名 |
| `tables` | string[] | ❌ | 指定表名列表 |
| `max_tables` | usize | ❌ | 最多返回表数（1-20） |

---

### 查询执行

#### `dbx_execute_query`
在数据库连接上执行 SQL 查询（最多返回 100 行）。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `connection_id` | string | ❌ | 连接 ID |
| `connection_name` | string | ❌ | 连接名称 |
| `database` | string | ❌ | 数据库名 |
| `sql` | string | ✅ | SQL 查询语句 |

---

#### `dbx_execute_redis_command`
在 Redis 连接上执行 Redis 命令。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `connection_id` | string | ❌ | 连接 ID |
| `connection_name` | string | ❌ | 连接名称 |
| `db` | u32 | ❌ | Redis 数据库编号 |
| `command` | string | ✅ | Redis 命令（如 `GET mykey`、`INFO`） |

---

#### `dbx_open_table`（仅桌面端）
在 DBX 桌面端应用中打开表。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `connection_id` | string | ❌ | 连接 ID |
| `connection_name` | string | ❌ | 连接名称 |
| `table` | string | ✅ | 表名 |
| `database` | string | ❌ | 数据库名 |
| `schema` | string | ❌ | Schema 名 |

---

#### `dbx_execute_and_show`（仅桌面端）
执行 SQL 并在 DBX UI 中展示结果。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `connection_id` | string | ❌ | 连接 ID |
| `connection_name` | string | ❌ | 连接名称 |
| `sql` | string | ✅ | SQL 语句 |
| `database` | string | ❌ | 数据库名 |

---

### MCP 权限模式

| 模式 | 值 | 允许的操作 |
|------|------|------|
| 只读 | `read_only` | SELECT、SHOW、DESCRIBE |
| 数据读写 | `safe_write` | INSERT、UPDATE、DELETE、事务 DML |
| 完全访问 | `high_risk_write` | DDL、TRUNCATE、DROP 等所有操作 |

### MCP 环境变量

| 变量 | 说明 |
|------|------|
| `DBX_WEB_URL` | Web 后端地址（如 `http://localhost:4224`） |
| `DBX_WEB_PASSWORD` | Web 登录密码 |
| `DBX_DATA_DIR` | 数据目录路径（Windows portable 版本需要） |
| `DBX_MCP_SCOPE_CONNECTION_IDS` | 限制可用连接 ID 列表 |
| `DBX_MCP_SCOPE_CONNECTION_NAME` | 限制单个连接名称 |
| `DBX_MCP_SCOPE_DATABASE` | 限制默认数据库 |

---

## Web REST API

DBX Web 后端（基于 Axum）提供以下 REST API 端点分组：

| 路由模块 | 端点前缀 | 说明 |
|------|------|------|
| `connection` | `/api/connection` | 连接生命周期（connect、disconnect、test） |
| `query` | `/api/query` | SQL 执行、取消、会话管理 |
| `schema` | `/api/schema` | Schema 浏览器（tables、columns、indexes、keys） |
| `schema_diff` | `/api/schema-diff` | Schema 差异对比 |
| `ai` | `/api/ai` | AI SQL 助手 |
| `mongo` | `/api/mongo` | MongoDB 操作 |
| `redis` | `/api/redis` | Redis 操作 |
| `transfer` | `/api/transfer` | 跨数据库数据传输 |
| `table_import` | `/api/table-import` | 表数据导入（CSV、Excel） |
| `table_export` | `/api/table-export` | 表数据导出 |
| `database_export` | `/api/database-export` | 全库导出 |
| `data_compare` | `/api/data-compare` | 数据对比 |
| `history` | `/api/history` | 查询历史 |
| `saved_sql` | `/api/saved-sql` | 保存的 SQL 片段 |
| `cloud_sync` | `/api/cloud-sync` | 云端配置同步 |
| `ssh_config` | `/api/ssh-config` | SSH 隧道配置 |
| `mcp_policy` | `/api/mcp-policy` | MCP 安全策略 |
| `plugins` | `/api/plugins` | 插件管理 |
| `agents` | `/api/agents` | Agent 驱动管理 |
| `jdbc` | `/api/jdbc` | JDBC 连接 |
| `mq` | `/api/mq` | 消息队列管理（需 `mq-admin` feature） |

### 查询执行请求格式

```json
{
  "connectionId": "conn-uuid",
  "database": "mydb",
  "sql": "SELECT * FROM users LIMIT 10",
  "schema": "public",
  "maxRows": 100,
  "timeoutSecs": 30,
  "executionMode": "default"
}
```

---

## Tauri IPC 命令

桌面端前端通过 `@tauri-apps/api` 的 `invoke()` 调用 Rust 后端命令。所有命令定义在 `src-tauri/src/commands/` 中。

### 连接管理

| 命令 | 文件 | 说明 |
|------|------|------|
| `connect` | `connection.rs` | 建立数据库连接 |
| `disconnect` | `connection.rs` | 断开连接 |
| `test_connection` | `connection.rs` | 测试连接可用性 |
| `save_connections` | `connection.rs` | 保存连接配置 |
| `load_connections` | `connection.rs` | 加载连接配置 |
| `get_connection_databases` | `connection.rs` | 获取数据库列表 |
| `save_connection_database_info` | `connection.rs` | 保存数据库详情 |
| `close_database_connection` | `connection.rs` | 关闭指定数据库连接 |

### 查询执行

| 命令 | 文件 | 说明 |
|------|------|------|
| `execute_query` | `query.rs` | 执行 SQL 查询 |
| `cancel_query` | `query_cancel.rs` | 取消运行中的查询 |
| `close_query_session` | `query.rs` | 关闭查询会话 |
| `execute_batch` | `query.rs` | 批量执行 SQL 语句 |

### Schema 浏览

| 命令 | 文件 | 说明 |
|------|------|------|
| `list_databases` | `schema.rs` | 列出数据库 |
| `list_schemas` | `schema.rs` | 列出 Schema |
| `list_tables` | `schema.rs` | 列出表/视图 |
| `get_columns` | `schema.rs` | 获取列定义 |
| `get_indexes` | `schema.rs` | 获取索引信息 |
| `get_foreign_keys` | `schema.rs` | 获取外键信息 |
| `get_triggers` | `schema.rs` | 获取触发器 |
| `get_procedures` | `schema.rs` | 获取存储过程 |
| `get_functions` | `schema.rs` | 获取函数 |
| `diff_schemas` | `schema_diff.rs` | 对比 Schema 差异 |
| `get_schema_cache_status` | `schema_cache.rs` | Schema 缓存状态 |

### AI 助手

| 命令 | 文件 | 说明 |
|------|------|------|
| `ai_chat` | `ai.rs` | AI 对话 |
| `ai_get_configs` | `ai_multi_config.rs` | 获取 AI 配置列表 |
| `ai_save_configs` | `ai_multi_config.rs` | 保存 AI 配置 |
| `ai_get_active_config` | `ai_multi_config.rs` | 获取当前 AI 配置 |

### NoSQL / 专用

| 命令 | 文件 | 说明 |
|------|------|------|
| `redis_execute` | `redis_cmd.rs` | 执行 Redis 命令 |
| `redis_pubsub_subscribe` | `redis_pubsub_server.rs` | Redis 发布订阅 |
| `mongo_find` | `mongo_cmd.rs` | MongoDB 查询 |
| `mongo_insert` / `mongo_update` / `mongo_delete` | `mongo_cmd.rs` | MongoDB CRUD |
| `etcd_get` / `etcd_put` / `etcd_delete` | `etcd_cmd.rs` | etcd 操作 |
| `nacos_*` | `nacos_cmd.rs` | Nacos 配置管理 |
| `zookeeper_*` | `zookeeper_cmd.rs` | ZooKeeper 操作 |

### 导入导出

| 命令 | 文件 | 说明 |
|------|------|------|
| `import_table` | `table_import.rs` | 导入表数据（CSV/Excel） |
| `export_table` | `table_export.rs` | 导出表数据 |
| `export_database` | `database_export.rs` | 全库导出 |
| `export_csv` | `csv_export.rs` | 导出 CSV |
| `export_xlsx` | `xlsx_export.rs` | 导出 Excel |
| `export_text` | `text_export.rs` | 导出文本格式 |
| `export_query_result` | `query_result_export.rs` | 导出查询结果 |
| `transfer_data` | `transfer.rs` | 跨数据库传输 |
| `compare_data` | `data_compare.rs` | 数据对比 |

### MCP 管理

| 命令 | 文件 | 说明 |
|------|------|------|
| `get_mcp_policy` | `mcp.rs` | 获取 MCP 策略 |
| `save_mcp_policy` | `mcp.rs` | 保存 MCP 策略 |
| `start_mcp_bridge` | `mcp_bridge.rs` | 启动 MCP 桥接服务器 |
| `stop_mcp_bridge` | `mcp_bridge.rs` | 停止 MCP 桥接 |

### 应用管理

| 命令 | 文件 | 说明 |
|------|------|------|
| `get_app_settings` / `save_app_settings` | `app_settings.rs` | 应用设置 |
| `get_history` / `clear_history` | `history.rs` | 查询历史 |
| `get_saved_sqls` / `save_saved_sql` | `saved_sql.rs` | 已保存 SQL |
| `get_prompt_templates` / `save_prompt_template` | `prompt_template.rs` | AI 提示模板 |
| `check_update` / `install_update` | `update.rs` | 应用更新 |
| `get_support_info` | `support_info.rs` | 支持信息 |
| `backup_sqlite` / `restore_sqlite` | `sqlite_backup.rs` | SQLite 备份恢复 |
| `set_app_locale` | `lib.rs` | 设置界面语言 |
| `get_system_fonts` | `system_fonts.rs` | 获取系统字体 |
| `open_file` / `open_url` | `fs_open.rs` | 打开文件/URL |
| `execute_sql_file` | `sql_file.rs` | 执行 SQL 文件 |
| `list_sql_files` | `list_sql_files.rs` | 列出 SQL 文件 |

### 前后端通信模式

```typescript
// 前端调用 Rust 命令
import { invoke } from "@tauri-apps/api/core";
const result = await invoke("execute_query", {
  connectionId: "uuid",
  database: "mydb",
  sql: "SELECT 1"
});

// 前端监听后端推送事件
import { listen } from "@tauri-apps/api/event";
listen("query-result", (event) => {
  console.log(event.payload);
});

// 桌面端 MCP 桥接：外部 AI 工具通过 stdio 与 DBX 通信
// 前端调用 start_mcp_bridge 启动桥接服务器
```


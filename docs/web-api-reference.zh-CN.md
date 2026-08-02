# DBX Web API 参考

> 适用于 DBX Docker 部署和 Web 版本。桌面版通过 Tauri IPC 调用相同的核心方法，不暴露 HTTP API。

## 基本信息

- **默认端口**：`4224`（可通过 `DBX_PORT` 环境变量修改）
- **Base Path**：`/api`（可在前面加 `DBX_PUBLIC_BASE_PATH` 上下文路径，如 `/dbx`）
- **鉴权**：Bearer Token（Session-based），`POST /api/auth/login` 获取
- **Content-Type**：`application/json`（大部分接口）
- **请求体大小上限**：默认 1 GB（可通过 `DBX_MAX_UPLOAD_MB` 环境变量限制）
- **压缩**：所有响应默认 gzip（除 XLSX 和 SSE 流外）

## 环境变量

| 变量                   | 说明                                       | 默认值           |
| ---------------------- | ------------------------------------------ | ---------------- |
| `DBX_PORT`             | 服务端口号                                 | `4224`           |
| `DBX_DATA_DIR`         | 数据目录（含 `dbx.db`）                    | `~/.dbx-web`     |
| `DBX_STATIC_DIR`       | 前端静态文件目录（设为空则只提供 API）      | (无)             |
| `DBX_PUBLIC_BASE_PATH` | 反向代理子路径前缀                         | `/`              |
| `DBX_PASSWORD`         | Web 登录密码（Argon2 哈希存储）            | (数据库读取)     |
| `DBX_DISABLE_PASSWORD` | 设为 `1` 或 `true` 禁用密码                | (无)             |
| `DBX_AGENT_DIR`        | Agent/JDBC 驱动安装目录                    | `$DATA_DIR/agents` |
| `DBX_MAX_UPLOAD_MB`    | 上传大小上限（MB）                         | `1024` (1 GB)    |

---

## 1. 鉴权 (Auth)

### `POST /api/auth/login`

登录获取 Session Token。

**请求体**：
```json
{
  "password": "your-password"
}
```

**响应** `200`：
```json
{
  "token": "session-token-string"
}
```

### `GET /api/auth/check`

验证当前 Session 是否有效。

**响应** `200`：`{ "valid": true }`

### `POST /api/auth/setup`

首次设置密码（仅当数据库无密码时可用）。

### `POST /api/auth/change-password`

修改密码（需要旧密码）。

### `POST /api/auth/logout`

登出，销毁当前 Session。

---

## 2. 连接管理 (Connection)

### `GET /api/connection/list`

列出所有已保存的连接配置（脱敏，不含密码）。

### `POST /api/connection/save`

保存连接配置。

### `POST /api/connection/test`

测试连接可用性。

**请求体**：
```json
{
  "name": "my-postgres",
  "dbType": "postgres",
  "host": "localhost",
  "port": 5432,
  "user": "postgres",
  "password": "secret",
  "database": "mydb"
}
```

### `POST /api/connection/connect`

建立连接。

### `POST /api/connection/disconnect`

断开连接。

### `POST /api/connection/check-health`

检查连接健康状态，自动重连。

### `POST /api/connection/identifier-quote`

获取连接数据库的标识符引用字符（如 PostgreSQL 的 `"`、MySQL 的 `` ` ``）。

### `POST /api/connection/mcp/add` / `POST /api/connection/mcp/remove`

为 MCP Server 添加/移除连接（桌面端桥接用）。

---

## 3. Schema 浏览 (Schema)

### `GET /api/schema/databases`

列出数据库列表。

**查询参数**：`connectionId`、`catalog`、`schema`

### `GET /api/schema/schemas`

列出 Schema 列表。

**查询参数**：`connectionId`、`database`

### `GET /api/schema/tables`

列出表/视图。

**查询参数**：`connectionId`、`database`、`schema`

### `GET /api/schema/columns`

列出列信息。

**查询参数**：`connectionId`、`database`、`schema`、`table`

### `GET /api/schema/indexes`

列出索引。

### `GET /api/schema/foreign-keys`

列出外键。

### `GET /api/schema/triggers`

列出触发器。

### `GET /api/schema/constraints`

列出约束。

### `GET /api/schema/partitions` / `GET /api/schema/subpartitions`

列出分区与子分区。

### `GET /api/schema/functions` / `GET /api/schema/sequences` / `GET /api/schema/rules` / `GET /api/schema/extensions`

列出函数、序列、规则、扩展。

### `GET /api/schema/objects`

列出存储过程/函数/视图等数据库对象。

### `GET /api/schema/object-source`

获取对象的 DDL 源码。

### `GET /api/schema/data-types`

列出数据库支持的数据类型。

### `GET /api/schema/ddl`

获取表的 DDL 创建语句。

### `GET /api/schema/completion-objects`

获取自动补全对象列表。

### `POST /api/schema/completion-assistant`

AI 辅助搜索（根据自然语言描述查找数据库对象）。

### `GET /api/schema/available-extensions`

列出可用扩展（PostgreSQL）。

### `POST /api/schema/cache` / `GET /api/schema/cache`

保存/加载 Schema 缓存。

### `DELETE /api/schema/cache-prefix`

删除指定前缀的 Schema 缓存。

### Tab 运行时缓存

| 端点                                        | 方法   | 说明                   |
| ------------------------------------------- | ------ | ---------------------- |
| `/api/tab-runtime-cache`                    | GET    | 加载运行时缓存         |
| `/api/tab-runtime-cache`                    | POST   | 保存运行时缓存         |
| `/api/tab-runtime-cache`                    | DELETE | 删除运行时缓存         |
| `/api/tab-runtime-cache/metadata`           | GET    | 列出缓存元数据         |
| `/api/tab-runtime-cache/prune`              | POST   | 清理过期缓存           |
| `/api/tab-runtime-cache/owner`              | DELETE | 按 owner 删除缓存      |

### Schema 方言

| 端点                              | 说明                       |
| --------------------------------- | -------------------------- |
| `GET /api/dialect/data-types`     | 列出方言数据类型           |

---

## 4. 查询执行 (Query)

### `POST /api/query/execute`

执行单条 SQL 查询。

**请求体**：
```json
{
  "connectionId": "conn-uuid",
  "database": "mydb",
  "sql": "SELECT * FROM users WHERE age > 18",
  "maxRows": 1000,
  "timeoutSecs": 30
}
```

**响应**：
```json
{
  "columns": ["id", "name", "age"],
  "columnTypes": ["integer", "varchar", "integer"],
  "columnSortables": [true, true, true],
  "rows": [[1, "Alice", 25], [2, "Bob", 30]],
  "affectedRows": 0,
  "executionTimeMs": 15,
  "truncated": false,
  "sessionId": null
}
```

### `POST /api/query/execute-multi`

执行多条 SQL（返回多个结果集）。

### `POST /api/query/execute-batch`

批量执行 SQL（返回影响行数）。

### `POST /api/query/execute-script`

执行 SQL 脚本文件。

### `POST /api/query/execute-in-transaction`

在事务中执行多条 SQL。

### `POST /api/query/execute-script-2pc`

以两阶段提交方式执行 SQL 脚本（用于 Schema 同步部署）。

### `POST /api/query/cancel`

取消正在执行的查询。

**请求体**：`{ "sessionId": "..." }`

### `POST /api/query/close-session`

关闭查询会话。

### `POST /api/query/analyze-sql-references`

分析 SQL 引用的表/列。

### `POST /api/query/find-statement-at-cursor`

定位光标所在的 SQL 语句。

### `POST /api/query/build-sorted-sql`

构建带排序的 SQL。

### `POST /api/query/build-explain-sql` / `POST /api/query/get-explain-info`

构建执行计划 SQL / 获取执行计划结果。

### `POST /api/query/build-dropped-file-preview-sql`

构建拖入文件预览 SQL（Parquet/CSV/JSON → DuckDB）。

### SQL 生成工具方法

以下方法根据数据库方言生成特定 SQL，用于前端 Schema 操作：

| 端点                                                       | 用途                   |
| ---------------------------------------------------------- | ---------------------- |
| `POST /api/query/build-create-table-sql`                   | 建表 SQL               |
| `POST /api/query/build-table-structure-change-sql`         | 表结构变更 SQL         |
| `POST /api/query/build-single-column-alter-sql`            | 单列变更 SQL           |
| `POST /api/query/build-drop-table-sql`                     | 删表 SQL               |
| `POST /api/query/build-empty-table-sql`                    | 清空表 SQL             |
| `POST /api/query/build-truncate-table-sql`                 | 截断表 SQL             |
| `POST /api/query/build-rename-object-sql`                  | 重命名对象 SQL         |
| `POST /api/query/build-drop-object-sql`                    | 删除对象 SQL           |
| `POST /api/query/build-drop-table-child-object-sql`        | 删除表子对象 SQL       |
| `POST /api/query/build-create-database-sql`                | 建库 SQL               |
| `POST /api/query/build-drop-database-sql`                  | 删库 SQL               |
| `POST /api/query/build-create-schema-sql`                  | 建 Schema SQL          |
| `POST /api/query/build-drop-schema-sql`                    | 删 Schema SQL          |
| `POST /api/query/build-duplicate-table-structure-sql`      | 复制表结构 SQL         |
| `POST /api/query/build-copy-table-data-sql`                | 复制表数据 SQL         |
| `POST /api/query/build-editable-object-source`             | 可编辑对象源码         |
| `POST /api/query/build-view-ddl-sql`                       | 视图 DDL               |
| `POST /api/query/build-hive-table-properties-sql`          | Hive 表属性            |
| `POST /api/query/build-create-user-sql`                    | 建用户 SQL             |
| `POST /api/query/build-table-select-sql`                   | 表选择查询             |
| `POST /api/query/build-database-search-sql`                | 数据库搜索 SQL         |
| `POST /api/query/build-search-result-where`                | 搜索结果 WHERE         |
| `POST /api/query/build-export-insert-statements`           | 导出 INSERT 语句       |
| `POST /api/query/build-export-sql-insert`                  | 导出 SQL INSERT        |
| `POST /api/query/build-database-sql-export`                | 数据库 SQL 导出        |
| `POST /api/query/build-update-database-properties-sql`     | 更新数据库属性 SQL     |
| `POST /api/query/build-executable-object-source-statements`| 可执行对象源码语句     |
| `POST /api/query/build-routine-rename-object-source-statements` | 例程重命名源码   |
| `POST /api/query/preview-sqlite-table-structure-change`    | 预览 SQLite 表结构变更 |
| `POST /api/query/apply-sqlite-table-structure-change`      | 应用 SQLite 表结构变更 |
| `POST /api/query/build-sqlite-attach-database-sql`         | SQLite ATTACH DATABASE |
| `POST /api/query/build-duckdb-attach-database-sql`         | DuckDB ATTACH（需 duckdb-sidecar feature） |

### 数据表格操作

| 端点                                                          | 用途                     |
| ------------------------------------------------------------- | ------------------------ |
| `POST /api/query/analyze-editability`                         | 分析结果集可编辑性       |
| `POST /api/query/prepare-data-grid-save`                      | 准备数据表格保存         |
| `POST /api/query/extract-data-grid-selection`                 | 提取数据表格选区（剪贴板） |
| `POST /api/query/build-data-grid-copy-update-statements`      | 复制 → UPDATE 语句       |
| `POST /api/query/build-data-grid-copy-insert-statement`       | 复制 → INSERT 语句       |
| `POST /api/query/build-data-grid-context-filter-condition`    | 右键过滤条件             |
| `POST /api/query/build-data-grid-column-value-filter-condition` | 列值过滤条件           |
| `POST /api/query/build-data-grid-column-values-filter-condition` | 列多值过滤条件        |
| `POST /api/query/build-data-grid-column-distinct-values-sql`  | 列去重值查询             |
| `POST /api/query/build-data-grid-count-sql`                   | 构建计数 SQL             |
| `POST /api/query/prepare-pagination-plan`                     | 分页执行计划             |

---

## 5. AI 助手 (AI)

### `GET /api/ai/configs` / `POST /api/ai/configs`

加载/保存 AI 多配置。

### `GET /api/ai/provider-configs` / `POST /api/ai/provider-config`

加载/保存 AI 提供商配置（Claude、OpenAI、Ollama 等）。

### `POST /api/ai/complete`

AI 补全（非流式）。

**请求体**：
```json
{
  "configId": "ai-config-uuid",
  "messages": [
    { "role": "system", "content": "You are a SQL expert..." },
    { "role": "user", "content": "写一条查询上月销售额TOP10的SQL" }
  ],
  "schemaContext": "..."
}
```

### `POST /api/ai/stream`

AI 流式补全（SSE）。

### `POST /api/ai/agent-stream`

AI Agent 流式交互（支持工具调用）。

### `POST /api/ai/cancel-stream`

取消正在进行的流式请求。

### `POST /api/ai/test-connection`

测试 AI 提供商连接。

### `POST /api/ai/models`

列出可用模型。

### `POST /api/ai/model-effort`

评估模型能力（高/中/低）。

### 对话管理

| 端点                                    | 方法   | 说明         |
| --------------------------------------- | ------ | ------------ |
| `/api/ai/conversation`                  | POST   | 保存对话     |
| `/api/ai/conversations`                 | GET    | 加载对话列表 |
| `/api/ai/conversation/{id}`             | DELETE | 删除对话     |

### 提示词模板

| 端点                                               | 方法   | 说明         |
| -------------------------------------------------- | ------ | ------------ |
| `/api/prompt-templates`                             | GET    | 列出模板     |
| `/api/prompt-templates`                             | POST   | 保存模板     |
| `/api/prompt-templates/{id}`                        | DELETE | 删除模板     |
| `/api/prompt-templates/global-instructions`         | GET    | 获取全局指令 |
| `/api/prompt-templates/global-instructions`         | PUT    | 设置全局指令 |

---

## 6. Schema 对比 (Schema Diff)

### `POST /api/schema-diff/prepare`

准备 Schema 对比。

**请求体**：
```json
{
  "sourceConnectionId": "conn-1",
  "targetConnectionId": "conn-2",
  "sourceDatabase": "db1",
  "targetDatabase": "db2",
  "detectTableRenames": true
}
```

### `POST /api/schema-diff/generate-sync-sql`

生成同步 SQL（含回滚 SQL）。

---

## 7. 数据对比 (Data Compare)

### `POST /api/data-compare/prepare`

准备数据对比（同表不同连接间）。

### `POST /api/data-compare/prepare-from-tables`

按表名列表准备对比。

### `POST /api/data-compare/prepare-missing-target`

准备缺失目标数据的对比。

### `POST /api/data-compare/build-sync-plan`

构建数据同步计划。

---

## 8. 数据迁移 (Transfer)

### `POST /api/transfer/start`

启动数据迁移（跨数据库、跨表）。

### `POST /api/transfer/ownership-preview`

预览迁移 ownership。

### `GET /api/transfer/progress/{transferId}`

查询迁移进度（SSE）。

### `POST /api/transfer/cancel`

取消迁移。

### `POST /api/transfer/sort-tables-by-fk`

按外键依赖排序表（用于确定迁移顺序）。

---

## 9. 导出 (Export)

### 查询结果导出

| 端点                                              | 说明             |
| ------------------------------------------------- | ---------------- |
| `POST /api/export/query-result`                   | 启动查询结果导出 |
| `GET /api/export/query-result/progress/{exportId}` | 导出进度         |
| `GET /api/export/query-result/download/{exportId}` | 下载导出文件     |
| `POST /api/export/query-result/cancel`            | 取消导出         |

### 表导出

| 端点                                        | 说明         |
| ------------------------------------------- | ------------ |
| `POST /api/export/table`                    | 启动表导出   |
| `GET /api/export/table/progress/{exportId}` | 导出进度     |
| `GET /api/export/table/download/{exportId}` | 下载导出文件 |
| `POST /api/export/table/cancel`             | 取消导出     |

### 数据库导出

| 端点                                             | 说明             |
| ------------------------------------------------ | ---------------- |
| `POST /api/export/database`                      | 启动数据库完整导出 |
| `GET /api/export/database/progress/{exportId}`   | 导出进度         |
| `GET /api/export/database/download/{exportId}`   | 下载导出文件     |
| `POST /api/export/database/cancel`              | 取消导出         |

### 文本导出

| 端点                                     | 格式     |
| ---------------------------------------- | -------- |
| `POST /api/export/query-result-json`     | JSON     |
| `POST /api/export/query-result-markdown` | Markdown |

---

## 10. 导入 (Import)

### `POST /api/import/preview`

预览导入（CSV/Excel）。

### `POST /api/import/preview-source`

预览已上传的导入源。

### `POST /api/import/source/release`

释放导入源资源。

### `POST /api/import/execute`

执行导入。

### `GET /api/import/progress/{importId}`

查询导入进度。

### `POST /api/import/cancel`

取消导入。

---

## 11. SQL 文件执行 (SQL File)

### `POST /api/sql-file/preview`

预览 SQL 文件内容（支持大文件上传，Body Limit = 文件大小上限 + 1 MB）。

### `POST /api/sql-file/execute`

执行 SQL 文件。

### `GET /api/sql-file/progress/{executionId}`

查询执行进度。

### `POST /api/sql-file/cancel`

取消执行。

---

## 12. Redis

### 键操作

| 端点                                 | 说明                    |
| ------------------------------------ | ----------------------- |
| `POST /api/redis/list-databases`     | 列出数据库              |
| `POST /api/redis/scan-keys`          | 扫描键（模式匹配）      |
| `POST /api/redis/scan-keys-batch`    | 批量扫描键              |
| `POST /api/redis/scan-values`        | 批量扫描值              |
| `POST /api/redis/get-value`          | 获取键值                |
| `POST /api/redis/get-ttl`            | 获取 TTL                |
| `POST /api/redis/delete-key`         | 删除键                  |
| `POST /api/redis/delete-keys`        | 批量删除键              |
| `POST /api/redis/set-ttl`            | 设置 TTL                |
| `POST /api/redis/set-expire-at`      | 设置过期时间            |
| `POST /api/redis/flush-db`           | 清空数据库              |
| `POST /api/redis/execute-command`    | 执行任意 Redis 命令     |

### 数据类型操作

| 端点                               | 类型            |
| ---------------------------------- | --------------- |
| `POST /api/redis/set-string`       | String          |
| `POST /api/redis/hash-set`         | Hash → HSET     |
| `POST /api/redis/hash-del`         | Hash → HDEL     |
| `POST /api/redis/list-push`        | List → LPUSH/RPUSH |
| `POST /api/redis/list-set`         | List → LSET     |
| `POST /api/redis/list-remove`      | List → LREM     |
| `POST /api/redis/set-add`          | Set → SADD      |
| `POST /api/redis/set-remove`       | Set → SREM      |
| `POST /api/redis/zadd`             | ZSet → ZADD     |
| `POST /api/redis/stream-add`       | Stream → XADD   |
| `POST /api/redis/json-set`         | JSON            |
| `POST /api/redis/check-json-module` | 检查 JSON 模块  |

### Stream 操作

| 端点                                      | 说明               |
| ----------------------------------------- | ------------------ |
| `POST /api/redis/get-stream-entries`      | 获取 Stream 条目   |
| `POST /api/redis/get-stream-groups`       | 获取消费者组       |
| `POST /api/redis/get-stream-consumers`    | 获取消费者         |
| `POST /api/redis/get-stream-pending`      | 获取待处理消息     |

### Pub/Sub

| 端点                              | 说明                 |
| --------------------------------- | -------------------- |
| `POST /api/redis/pubsub/publish`  | 发布消息             |
| `GET /api/redis/pubsub/ws`        | WebSocket 订阅连接   |

### 其他

| 端点                                    | 说明               |
| --------------------------------------- | ------------------ |
| `POST /api/redis/slowlog-get`           | 获取慢日志         |
| `POST /api/redis/cluster-master-nodes`  | 集群主节点         |

---

## 13. MongoDB

| 端点                                       | 说明                 |
| ------------------------------------------ | -------------------- |
| `POST /api/mongo/list-databases`           | 列出数据库           |
| `POST /api/mongo/list-collections`         | 列出集合             |
| `POST /api/mongo/vector-collection-detail` | 向量集合详情         |
| `POST /api/mongo/create-database`          | 创建数据库           |
| `POST /api/mongo/drop-database`            | 删除数据库           |
| `POST /api/mongo/drop-collection`          | 删除集合             |
| `POST /api/mongo/rename-collection`        | 重命名集合           |
| `POST /api/mongo/find-documents`           | 查询文档             |
| `POST /api/mongo/parse-shell-command`      | 解析 Mongo Shell 命令|
| `POST /api/mongo/find-one`                 | 查询单文档           |
| `POST /api/mongo/count-documents`          | 统计文档数           |
| `POST /api/mongo/server-version`           | 服务器版本           |
| `POST /api/mongo/collection-stats`         | 集合统计             |
| `POST /api/mongo/aggregate-documents`      | 聚合查询             |
| `POST /api/mongo/distinct`                 | 去重查询             |
| `POST /api/mongo/create-index`             | 创建索引             |
| `POST /api/mongo/drop-indexes`             | 删除索引             |
| `POST /api/mongo/insert-document`          | 插入单文档           |
| `POST /api/mongo/insert-documents`         | 批量插入文档         |
| `POST /api/mongo/update-document`          | 更新单文档           |
| `POST /api/mongo/update-documents`         | 批量更新文档         |
| `POST /api/mongo/delete-document`          | 删除单文档           |
| `POST /api/mongo/delete-documents`         | 批量删除文档         |
| `POST /api/mongo/find-one-and-update`      | 查找并更新           |
| `POST /api/mongo/find-one-and-replace`     | 查找并替换           |
| `POST /api/mongo/find-one-and-delete`      | 查找并删除           |

---

## 14. 文档存储 (Document Store — ES/Easysearch 等)

| 端点                                                      | 说明                   |
| --------------------------------------------------------- | ---------------------- |
| `POST /api/document-store/list-databases`                  | 列出数据库/索引        |
| `POST /api/document-store/list-collections`                | 列出集合/类型          |
| `POST /api/document-store/find-documents`                  | 查询文档               |
| `POST /api/document-store/elasticsearch-count-documents`   | 统计文档数             |
| `POST /api/document-store/insert-document`                 | 插入文档               |
| `POST /api/document-store/update-document`                 | 更新文档               |
| `POST /api/document-store/delete-document`                 | 删除文档               |
| GridFS 操作                                              |                        |
| `POST /api/document-store/list-gridfs-buckets`             | 列出 GridFS 桶         |
| `POST /api/document-store/create-gridfs-bucket`            | 创建 GridFS 桶         |
| `POST /api/document-store/delete-gridfs-bucket`            | 删除 GridFS 桶         |
| `POST /api/document-store/list-gridfs-files`               | 列出 GridFS 文件       |
| `GET /api/document-store/download-gridfs-file`             | 下载 GridFS 文件       |
| `POST /api/document-store/upload-gridfs-file`              | 上传 GridFS 文件       |
| `POST /api/document-store/delete-gridfs-file`              | 删除 GridFS 文件       |

---

## 15. etcd

| 端点                            | 说明               |
| ------------------------------- | ------------------ |
| `POST /api/etcd/supports-ttl`   | 是否支持 TTL       |
| `POST /api/etcd/list-prefix`    | 按前缀列出键       |
| `POST /api/etcd/get`            | 获取键值           |
| `POST /api/etcd/put`            | 写入键值           |
| `POST /api/etcd/delete`         | 删除键             |
| `POST /api/etcd/rename`         | 重命名键           |
| `POST /api/etcd/history`        | 版本历史           |
| `POST /api/etcd/status`         | 集群状态           |
| `POST /api/etcd/preflight`      | 预检               |
| `POST /api/etcd/compact`        | 压缩               |
| `POST /api/etcd/defrag`         | 碎片整理           |
| `POST /api/etcd/watch/start`    | 开始 Watch         |
| `POST /api/etcd/watch/poll`     | 轮询 Watch 事件    |
| `POST /api/etcd/watch/stop`     | 停止 Watch         |
| `POST /api/etcd/lease/list`     | 列出 Lease         |
| `POST /api/etcd/lease/call`     | Lease 操作         |
| `POST /api/etcd/auth/call`      | Auth 操作          |

---

## 16. ZooKeeper

| 端点                                | 说明           |
| ----------------------------------- | -------------- |
| `POST /api/zookeeper/list-prefix`   | 按前缀列出节点 |
| `POST /api/zookeeper/get`           | 获取节点数据   |
| `POST /api/zookeeper/put`           | 写入节点数据   |
| `POST /api/zookeeper/delete`        | 删除节点       |

---

## 17. HBase REST

| 端点                                | 说明         |
| ----------------------------------- | ------------ |
| `POST /api/hbase/table-schema`      | 获取表结构   |
| `POST /api/hbase/scan-rows`         | 扫描行       |
| `POST /api/hbase/get-row`           | 获取单行     |
| `POST /api/hbase/put-row`           | 写入行       |
| `POST /api/hbase/delete-row`        | 删除行       |
| `POST /api/hbase/create-table`      | 创建表       |
| `POST /api/hbase/delete-table`      | 删除表       |

---

## 18. Nacos 配置中心

### 连接与命名空间

| 端点                                       | 说明               |
| ------------------------------------------ | ------------------ |
| `POST /api/nacos/test-connection`          | 测试连接           |
| `POST /api/nacos/namespaces/list`          | 列出命名空间       |
| `POST /api/nacos/namespaces/create`        | 创建命名空间       |
| `POST /api/nacos/namespaces/update`        | 更新命名空间       |

### 配置管理

| 端点                                            | 说明             |
| ----------------------------------------------- | ---------------- |
| `POST /api/nacos/configs/list`                  | 列出配置         |
| `POST /api/nacos/configs/get`                   | 获取配置         |
| `POST /api/nacos/configs/publish`               | 发布配置         |
| `POST /api/nacos/configs/delete`                | 删除配置         |
| `POST /api/nacos/configs/history/list`          | 配置历史列表     |
| `POST /api/nacos/configs/history/get`           | 获取历史配置     |
| `POST /api/nacos/configs/history/rollback`      | 回滚配置         |
| `POST /api/nacos/configs/search`                | 搜索配置内容     |
| `POST /api/nacos/configs/search/cancel`         | 取消搜索         |
| `POST /api/nacos/configs/export`                | 导出配置         |
| `POST /api/nacos/configs/import/preview`        | 预览导入         |
| `POST /api/nacos/configs/import/apply`          | 应用导入         |
| `POST /api/nacos/configs/copy/preview`          | 预览复制         |
| `POST /api/nacos/configs/copy/apply`            | 应用复制         |

### 服务管理

| 端点                                       | 说明           |
| ------------------------------------------ | -------------- |
| `POST /api/nacos/services/list`            | 列出服务       |
| `POST /api/nacos/instances/list`           | 列出实例       |
| `POST /api/nacos/instances/update`         | 更新实例       |
| `POST /api/nacos/dashboard`                | 仪表盘数据     |
| `POST /api/nacos/raw`                      | 原始 API 请求   |

---

## 19. 消息队列管理 (MQ) — 需要 `mq-admin` feature

### 通用接口

| 端点                              | 说明               |
| --------------------------------- | ------------------ |
| `POST /api/mq/test-connection`    | 测试连接           |
| `POST /api/mq/overview`           | 集群概览           |
| `POST /api/mq/nodes`              | 节点列表           |
| `POST /api/mq/raw`                | 原始 API 透传      |
| `POST /api/mq/send-message`       | 发送消息           |

### Tenant / Namespace 管理

| 端点                                   | 说明           |
| -------------------------------------- | -------------- |
| `POST /api/mq/tenants/list`             | 列出租户       |
| `POST /api/mq/tenants/get`              | 获取租户       |
| `POST /api/mq/tenants/create`           | 创建租户       |
| `POST /api/mq/tenants/update`           | 更新租户       |
| `POST /api/mq/tenants/delete`           | 删除租户       |
| `POST /api/mq/namespaces/list`          | 列出命名空间   |
| `POST /api/mq/namespaces/create`        | 创建命名空间   |
| `POST /api/mq/namespaces/delete`        | 删除命名空间   |
| `POST /api/mq/namespaces/policies`      | 获取策略       |

### Topic 管理

| 端点 | 说明 |
| ---- | ---- |
| `POST /api/mq/topics/list` | 列出主题 |
| `POST /api/mq/topics/create` | 创建主题 |
| `POST /api/mq/topics/delete` | 删除主题 |
| `POST /api/mq/topics/update-partitions` | 更新分区 |
| `POST /api/mq/topics/stats` | 主题统计 |
| `POST /api/mq/topics/internal-stats` | 内部统计 |
| `POST /api/mq/topics/route` | 路由信息 |
| `POST /api/mq/topics/alter-config` | 修改配置 |
| `POST /api/mq/topics/skip-accumulation` | 跳过堆积 |
| `POST /api/mq/topics/unload` | 卸载主题 |

### 消息管理

| 端点                                      | 说明             |
| ----------------------------------------- | ---------------- |
| `POST /api/mq/messages/view`              | 查看消息         |
| `POST /api/mq/messages/query-by-key`      | 按 Key 查询消息  |
| `POST /api/mq/messages/query-by-topic`    | 按 Topic 查询消息|
| `POST /api/mq/messages/trace`             | 消息轨迹         |

### 订阅与消费者

| 端点                                            | 说明               |
| ----------------------------------------------- | ------------------ |
| `POST /api/mq/subscriptions/list`               | 列出订阅           |
| `POST /api/mq/subscriptions/create`             | 创建订阅           |
| `POST /api/mq/subscriptions/delete`             | 删除订阅           |
| `POST /api/mq/subscriptions/skip-messages`      | 跳过消息           |
| `POST /api/mq/subscriptions/reset-cursor`       | 重置游标           |
| `POST /api/mq/subscriptions/clear-backlog`      | 清除积压           |
| `POST /api/mq/subscriptions/peek-messages`      | 预览消息           |
| `POST /api/mq/subscriptions/expire-messages`    | 过期消息           |
| `POST /api/mq/consumers/group-config/get`       | 获取消费者组配置   |
| `POST /api/mq/consumers/group-config/alter`     | 修改消费者组配置   |
| `POST /api/mq/producers/list`                   | 列出生产者         |
| `POST /api/mq/consumers/list`                   | 列出消费者         |

### Exchange / Binding（RabbitMQ）

| 端点                                    | 说明         |
| --------------------------------------- | ------------ |
| `POST /api/mq/exchanges/list`            | 列出交换机   |
| `POST /api/mq/exchanges/create`          | 创建交换机   |
| `POST /api/mq/exchanges/delete`          | 删除交换机   |
| `POST /api/mq/bindings/list`             | 列出绑定     |
| `POST /api/mq/bindings/bind`             | 绑定队列     |
| `POST /api/mq/bindings/unbind`           | 解绑队列     |

### 连接管理

| 端点                                          | 说明             |
| --------------------------------------------- | ---------------- |
| `POST /api/mq/client-connections/list`         | 列出客户端连接   |
| `POST /api/mq/client-connections/close`        | 关闭客户端连接   |
| `POST /api/mq/channels/list`                   | 列出 Channel     |

### 策略与权限

| 端点                                    | 说明             |
| --------------------------------------- | ---------------- |
| `POST /api/mq/policies/publish-rate`    | 发布速率限制     |
| `POST /api/mq/policies/dispatch-rate`   | 分发速率限制     |
| `POST /api/mq/policies/subscribe-rate`  | 订阅速率限制     |
| `POST /api/mq/policies/backlog-quota`   | 积压配额         |
| `POST /api/mq/policies/retention`       | 保留策略         |
| `POST /api/mq/policies/effective`       | 生效策略         |
| `POST /api/mq/policies/list`            | 列出策略         |
| `POST /api/mq/policies/set`             | 设置策略         |
| `POST /api/mq/policies/delete`          | 删除策略         |
| `POST /api/mq/permissions/grant`        | 授权             |
| `POST /api/mq/permissions/revoke`       | 撤销授权         |
| `POST /api/mq/permissions/list`         | 列出权限         |

### 用户与 Token

| 端点                                        | 说明           |
| ------------------------------------------- | -------------- |
| `POST /api/mq/users/list`                   | 列出用户       |
| `POST /api/mq/users/create`                 | 创建用户       |
| `POST /api/mq/users/delete`                 | 删除用户       |
| `POST /api/mq/user-permissions/list`        | 用户权限列表   |
| `POST /api/mq/user-permissions/grant`       | 授予用户权限   |
| `POST /api/mq/user-permissions/revoke`      | 撤销用户权限   |
| `POST /api/mq/tokens/issue`                 | 签发 Token     |
| `POST /api/mq/tokens/list`                  | Token 列表     |

### 监控

| 端点                                      | 说明             |
| ----------------------------------------- | ---------------- |
| `POST /api/mq/monitoring/backlog`          | 积压监控         |
| `POST /api/mq/monitoring/cluster-info`    | 集群信息         |

---

## 20. Agent/JDBC 驱动管理

### Agent 驱动

| 端点                                                | 说明                      |
| --------------------------------------------------- | ------------------------- |
| `GET /api/agents/installed-local`                    | 本地已安装 Agent           |
| `GET /api/agents/installed`                          | 列出已安装 Agent           |
| `GET /api/agents/installed/{dbType}`                 | 检查某类型是否已安装       |
| `GET /api/agents/storage-usage`                      | 驱动存储空间使用量         |
| `GET /api/agents/runtime`                            | 驱动运行时状态             |
| `POST /api/agents/install`                           | 在线安装 Agent 驱动        |
| `POST /api/agents/uninstall`                         | 卸载 Agent 驱动            |
| `POST /api/agents/upgrade-all`                       | 升级所有 Agent             |
| `POST /api/agents/update-blockers`                   | 检查更新阻止项             |
| `POST /api/agents/import-offline`                    | 导入离线驱动包（ZIP）      |
| `POST /api/agents/import-driver`                     | 导入单个驱动文件           |
| `POST /api/agents/import-jar`                        | 导入 JAR 文件              |
| `GET /api/agents/java-runtime`                       | 获取 Java 运行时配置       |
| `POST /api/agents/java-runtime`                      | 设置 Java 运行时配置       |
| `POST /api/agents/runtime/stop`                      | 停止驱动运行时             |
| `POST /api/agents/runtime/restart`                   | 重启驱动运行时             |
| `POST /api/agents/invalidate-registry-cache`         | 失效注册表缓存             |
| `POST /api/agents/reinstall-jre`                     | 重新安装 JRE               |
| `POST /api/agents/uninstall-jre`                     | 卸载 JRE                   |
| `DELETE /api/agents/download-cache`                  | 清除下载缓存               |
| `GET /api/agents/progress/{operationId}`             | 安装/升级进度              |

### JDBC 驱动

| 端点                                                   | 说明                     |
| ------------------------------------------------------ | ------------------------ |
| `GET /api/jdbc/drivers`                                | 列出 JDBC 驱动           |
| `POST /api/jdbc/drivers`                               | 导入 JDBC 驱动           |
| `GET /api/jdbc/drivers/maven`                          | 列出 Maven 可用驱动      |
| `POST /api/jdbc/drivers/maven`                         | 从 Maven 安装驱动        |
| `GET /api/jdbc/drivers/local`                          | 列出本地可用驱动         |
| `POST /api/jdbc/drivers/prestosql`                     | 安装 PrestoSQL JDBC 驱动 |
| `DELETE /api/jdbc/drivers/maven/{bundleId}`            | 删除 Maven 驱动包        |
| `DELETE /api/jdbc/drivers/local/{bundleId}`            | 删除本地驱动包           |
| `DELETE /api/jdbc/drivers/{name}`                      | 删除指定 JDBC 驱动       |
| `GET /api/jdbc/plugin/status`                          | JDBC 插件状态            |
| `POST /api/jdbc/plugin/install`                        | 安装 JDBC 插件           |
| `POST /api/jdbc/plugin/install-local`                  | 本地安装 JDBC 插件       |
| `POST /api/jdbc/plugin/uninstall`                      | 卸载 JDBC 插件           |

---

## 21. 其他 API

### 插件管理

| 端点               | 说明           |
| ------------------ | -------------- |
| `GET /api/plugins` | 列出已安装插件 |

### 查询历史

| 端点                          | 方法   | 说明               |
| ----------------------------- | ------ | ------------------ |
| `/api/history`                | GET    | 加载历史           |
| `/api/history`                | DELETE | 清空历史           |
| `/api/history/save`           | POST   | 保存历史条目       |
| `/api/history/search`         | POST   | 搜索历史           |
| `/api/history/options`        | GET    | 历史连接选项列表   |
| `/api/history/{id}`           | DELETE | 删除单条           |

### 保存的 SQL

| 端点                          | 方法   | 说明             |
| ----------------------------- | ------ | ---------------- |
| `/api/saved-sql`              | GET    | 列出 SQL 库      |
| `/api/saved-sql`              | POST   | 保存 SQL 文件    |
| `/api/saved-sql/{id}`         | GET    | 加载 SQL 文件    |
| `/api/saved-sql/{id}`         | DELETE | 删除 SQL 文件    |
| `/api/saved-sql/folders`      | POST   | 保存文件夹       |
| `/api/saved-sql/folders/{id}` | DELETE | 删除文件夹       |

### 应用设置

| 端点                                             | 方法   | 说明                   |
| ------------------------------------------------ | ------ | ---------------------- |
| `/api/app-settings/pinned-tree-node-ids`         | GET    | 获取固定节点 ID        |
| `/api/app-settings/pinned-tree-node-ids`         | POST   | 保存固定节点 ID        |
| `/api/app-settings/mcp-policy`                   | GET    | 获取 MCP 全局策略      |
| `/api/app-settings/mcp-policy`                   | PUT    | 保存 MCP 全局策略      |
| `/api/app-settings/max-agent-turns`              | GET    | 获取 Agent 最大轮次    |
| `/api/app-settings/max-agent-turns`              | PUT    | 设置 Agent 最大轮次    |
| `/api/app-settings/max-retries`                  | GET    | 获取最大重试次数       |
| `/api/app-settings/max-retries`                  | PUT    | 设置最大重试次数       |
| `/api/app-settings/config/decrypt`               | POST   | 解密配置               |

### 云同步

| 端点                                                    | 说明                       |
| ------------------------------------------------------- | -------------------------- |
| `POST /api/cloud-sync/webdav/test`                      | 测试 WebDAV 连接           |
| `POST /api/cloud-sync/webdav/password-status`           | WebDAV 密码状态            |
| `POST /api/cloud-sync/webdav/save-password`             | 保存 WebDAV 密码           |
| `POST /api/cloud-sync/webdav/forget-password`           | 忘记 WebDAV 密码           |
| `POST /api/cloud-sync/webdav/sync-secrets-status`       | 同步密钥状态               |
| `POST /api/cloud-sync/webdav/save-sync-secrets-preference` | 保存同步密钥偏好         |
| `POST /api/cloud-sync/webdav/forget-sync-secrets-passphrase` | 忘记同步密钥密码短语  |
| `POST /api/cloud-sync/webdav/upload`                    | 上传到 WebDAV              |
| `POST /api/cloud-sync/webdav/download`                  | 从 WebDAV 下载             |
| `POST /api/cloud-sync/snippet/test`                     | 测试 Snippet 连接          |
| `POST /api/cloud-sync/snippet/token-status`             | Snippet Token 状态         |
| `POST /api/cloud-sync/snippet/save-token`               | 保存 Snippet Token         |
| `POST /api/cloud-sync/snippet/forget-token`             | 忘记 Snippet Token         |
| `POST /api/cloud-sync/snippet/upload`                   | 上传 Snippet               |
| `POST /api/cloud-sync/snippet/download`                 | 下载 Snippet               |

### 更新与版本

| 端点                          | 方法   | 说明               |
| ----------------------------- | ------ | ------------------ |
| `/api/version`                | GET    | 当前版本号         |
| `/api/update/check`           | GET    | 检查更新           |
| `/api/changelog`              | GET    | 获取更新日志       |

### 布局

| 端点                          | 方法   | 说明             |
| ----------------------------- | ------ | ---------------- |
| `/api/layout/sidebar`         | GET    | 侧边栏布局       |
| `/api/layout/sidebar`         | POST   | 保存侧边栏布局   |

### SSH 配置

| 端点                                  | 说明                     |
| ------------------------------------- | ------------------------ |
| `GET /api/ssh/config-hosts`            | SSH config 主机列表      |
| `GET /api/ssh/prompts`                 | SSH 密码提示流（SSE）    |
| `POST /api/ssh/prompts/resolve`        | 响应 SSH 密码提示        |

### 隧道配置

| 端点                                   | 说明               |
| -------------------------------------- | ------------------ |
| `GET /api/tunnel-profiles/list`        | 列出隧道配置       |
| `POST /api/tunnel-profiles/save`       | 保存隧道配置       |
| `POST /api/tunnel-profiles/test`       | 测试隧道连接       |

### 连接数据库信息

| 端点                                           | 说明                       |
| ---------------------------------------------- | -------------------------- |
| `POST /api/connection/test-info`               | 测试连接并获取信息         |
| `POST /api/connection/database-info`           | 获取已连接数据库信息       |
| `POST /api/connection/database-info/save`      | 保存连接数据库信息         |
| `POST /api/connection/final-proxy-port`        | 获取最终代理端口           |
| `POST /api/connection/close-database`          | 关闭数据库连接             |
| `GET /api/system/fonts`                        | 列出系统字体               |

---

## 统一错误响应格式

所有 API 错误返回以下格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "人类可读的错误描述"
  }
}
```

常见错误码：

| 错误码               | HTTP 状态码 | 说明                     |
| -------------------- | ----------- | ------------------------ |
| `UNAUTHORIZED`       | 401         | 未登录或 Token 无效      |
| `NOT_FOUND`          | 404         | 资源不存在               |
| `CONNECTION_ERROR`   | 502         | 数据库连接失败           |
| `QUERY_ERROR`        | 400         | SQL 执行错误             |
| `SQL_BLOCKED`        | 403         | SQL 被安全策略阻止       |
| `TIMEOUT`            | 408         | 查询超时                 |
| `VALIDATION_ERROR`   | 422         | 请求参数校验失败         |
| `RATE_LIMITED`       | 429         | 登录频率限制             |
| `INTERNAL_ERROR`     | 500         | 服务器内部错误           |

---

## 相关文档

- [项目架构](architecture.zh-CN.md)
- [快速开始](content/docs/getting-started.cn.mdx)
- [贡献指南](../CONTRIBUTING.zh-CN.md)
- [MCP Server](../packages/mcp-server/README.md)
- [CLI 工具](../packages/cli/README.md)

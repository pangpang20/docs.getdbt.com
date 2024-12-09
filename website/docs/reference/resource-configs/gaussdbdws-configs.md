---
title: "GaussDB(DWS) configurations"
description: "GaussDB(DWS) Configurations - Read this in-depth guide to learn about configurations in dbt."
id: "GaussDB(DWS)-configs"
---

## Incremental materialization strategies

In dbt-gaussdbdws, the following incremental materialization strategies are supported:

- `append` (default when `unique_key` is not defined)
- `merge`
- `delete+insert` (default when `unique_key` is defined)
- [`microbatch`](/docs/build/incremental-microbatch)

## Performance optimizations

### Unlogged

If this keyword `Unlogged` is specified, the created table will be an unlogged table. Data written to an unlogged table is not recorded in the write-ahead log (WAL), making it significantly faster than regular tables. However, unlogged tables are automatically truncated in the event of conflicts, operating system reboots, database restarts, primary-secondary failovers, power interruptions, or unexpected shutdowns, posing a risk of data loss. Additionally, the contents of unlogged tables are not replicated to standby servers. Indexes created on unlogged tables are also not automatically logged.

#### Use Case

Unlogged tables cannot guarantee data safety. Users should use them only after ensuring data backups are in place. For example, they can be used to back up data during system upgrades.

#### Failure Handling

In the event of unexpected shutdowns or similar operations leading to data loss in indexes on unlogged tables, users should rebuild the affected indexes.

See [GaussDB docs](https://support.huaweicloud.com/distributed-devg-v8-gaussdb/gaussdb-12-0567.html) , [GaussDB(DWS) docs](https://support.huaweicloud.com/sqlreference-910-dws/dws_06_0177.html) for details.

<File name='my_table.sql'>

```sql
{{ config(materialized='table', unlogged=True) }}

select ...
```

</File>

<File name='dbt_project.yml'>

```yaml
models:
  +unlogged: true
```

</File>

### Indexes

Indexes can improve database query performance, but improper use may lead to a decline in database performance. It is recommended to create indexes only when one of the following principles is met:

- Fields that are frequently queried.
- Create indexes on join conditions. For queries involving multi-column joins, it is recommended to create composite indexes on those columns. For example, for the query `SELECT * FROM t1 JOIN t2 ON t1.a = t2.a AND t1.b = t2.b`, you can create a composite index on columns a and b of table t1.
- Fields used in the `WHERE` clause as filtering conditions (especially range conditions).
- Fields that often appear after `ORDER BY`, `GROUP BY`, and `DISTINCT`.
- For point query scenarios, it is recommended to create a `B-tree` index.
The syntax for creating indexes on partitioned tables is different from that for regular tables. Please note the following: partitioned tables do not support parallel index creation, partial indexes, or the NULL FIRST feature.

Table models, incremental models, seeds, snapshots, and materialized views may have a list of `indexes` defined. Each GaussDB(DWS) index can have three components:
- `columns` (list, required): one or more columns on which the index is defined
- `unique` (boolean, optional): whether the index should be [declared unique](https://support.huaweicloud.com/sqlreference-910-dws/dws_06_0165.html)
- `type` (string, optional): a supported [index type](https://support.huaweicloud.com/sqlreference-910-dws/dws_06_0165.html) (B-tree, Hash, GIN, etc)

<File name='my_table.sql'>

```sql
{{ config(
    materialized = 'table',
    indexes=[
      {'columns': ['column_a'], 'type': 'hash'},
      {'columns': ['column_a', 'column_b'], 'unique': True},
    ]
)}}

select ...
```

</File>

If one or more indexes are configured on a resource, dbt will run `create index` <Term id="ddl" /> statement(s) as part of that resource's <Term id="materialization" />, within the same transaction as its main `create` statement. For the index's name, dbt uses a hash of its properties and the current timestamp, in order to guarantee uniqueness and avoid namespace conflict with other indexes.

```sql
create index if not exists
"7f8e3c2b0a4e9176d82b5c913f4a621c"
on "my_target_database"."my_target_schema"."indexed_model" 
using hash
(column_a);

create unique index if not exists
"bf1348a72e56dc9f08c43a15d0a1e759"
on "my_target_database"."my_target_schema"."indexed_model" 
(column_a, column_b);
```

You can also configure indexes for a number of resources at once:

<File name='dbt_project.yml'>

```yaml
models:
  project_name:
    subdirectory:
      +indexes:
        - columns: ['column_a']
          type: hash
```

</File>

## Materialized views

The GaussDB(DWS) adapter supports materialized views.

**Notes**:

- The base tables for materialized views can be row-store tables, column-store tables, hstore tables, partitioned tables (or specific partitions), external tables, or other materialized views. Temporary tables (including global temporary tables, volatile temporary tables, and regular temporary tables) are not supported. Cold-hot tables (supported in version 910.200 and above) are supported, but automatic partition tables with specified partitions are not.
- Materialized views prohibit `INSERT`, `UPDATE`, `MERGE INTO`, and `DELETE` operations for data modification.
 Materialized views execute once and store the results, ensuring consistent query results. After `BUILD IMMEDIATE` or `REFRESH`, materialized views provide accurate results.
- Materialized views cannot specify a Node Group via syntax. Base tables of materialized views can specify a Node Group during creation, and materialized views will inherit the Node Group information from the base table. The Node Groups for multiple base tables must be the same.
- Creating a materialized view requires `CREATE` permissions on the schema and `SELECT` permissions on the base table or columns.
- Querying a materialized view requires `SELECT` permissions on the materialized view.
- Refreshing a materialized view requires INSERT permissions on the materialized view and `SELECT` permissions on the base table or columns.
- Materialized views support fine-grained permissions like `ANALYZE`, `VACUUM`, `ALTER`, and `DROP`.
- Materialized views support permission delegation operations with the `WITH GRANT OPTION`.
- Materialized views do not support advanced security controls. If the base table has row-level security (RLS), data masking policies, or its owner is a private user with restricted `SELECT` permissions, creating a materialized view is prohibited. If a materialized view already exists and the base table adds RLS, masking policies, or changes its owner to a private user, the materialized view can still execute queries but cannot be refreshed.


with the following configuration parameters:

| Parameter                                                                        | Type               | Required | Default | Change Monitoring Support |
|----------------------------------------------------------------------------------|--------------------|----------|---------|---------------------------|
| [`on_configuration_change`](/reference/resource-configs/on_configuration_change) | `<string>`         | no       | `apply` | n/a                       |
| [`indexes`](#indexes)                                                            | `[{<dictionary>}]` | no       | `none`  | alter                     |

<Tabs
  groupId="config-languages"
  defaultValue="project-yaml"
  values={[
    { label: 'Project file', value: 'project-yaml', },
    { label: 'Property file', value: 'property-yaml', },
    { label: 'Config block', value: 'config', },
  ]
}>


<TabItem value="project-yaml">

<File name='dbt_project.yml'>

```yaml
models:
  [<resource-path>](/reference/resource-configs/resource-path):
    [+](/reference/resource-configs/plus-prefix)[materialized](/reference/resource-configs/materialized): materialized_view
    [+](/reference/resource-configs/plus-prefix)[on_configuration_change](/reference/resource-configs/on_configuration_change): apply | continue | fail
    [+](/reference/resource-configs/plus-prefix)[indexes](#indexes):
      - columns: [<column-name>]
        unique: true | false
        type: hash | btree
```

</File>

</TabItem>


<TabItem value="property-yaml">

<File name='models/properties.yml'>

```yaml
version: 2

models:
  - name: [<model-name>]
    config:
      [materialized](/reference/resource-configs/materialized): materialized_view
      [on_configuration_change](/reference/resource-configs/on_configuration_change): apply | continue | fail
      [indexes](#indexes):
        - columns: [<column-name>]
          unique: true | false
          type: hash | btree
```

</File>

</TabItem>


<TabItem value="config">

<File name='models/<model_name>.sql'>

```jinja
{{ config(
    [materialized](/reference/resource-configs/materialized)="materialized_view",
    [on_configuration_change](/reference/resource-configs/on_configuration_change)="apply" | "continue" | "fail",
    [indexes](#indexes)=[
        {
            "columns": ["<column-name>"],
            "unique": true | false,
            "type": "hash" | "btree",
        }
    ]
) }}
```

</File>

</TabItem>

</Tabs>

The [`indexes`](#indexes) parameter corresponds to that of a table, as explained above.
It's worth noting that, unlike tables, dbt monitors this parameter for changes and applies the changes without dropping the materialized view.
This happens via a `DROP/CREATE` of the indexes, which can be thought of as an `ALTER` of the materialized view.

Learn more about these parameters in GaussDB(DWS)'s [CREATE MATERIALIZED VIEW](https://support.huaweicloud.com/sqlreference-910-dws/dws_06_0357.html) .

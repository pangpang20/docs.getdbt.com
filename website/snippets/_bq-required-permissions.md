BigQuery's permission model is dissimilar from more conventional databases like Snowflake and Redshift. The following permissions are required for dbt user accounts:
- BigQuery Data Editor
- BigQuery User

This set of permissions will permit dbt users to read from and create tables and <Term id="view">views</Term> in a BigQuery project.

### Minimum permissions
For finer scoped permissions and to provide minimum access to service accounts, you can specify the following permissions to enable the minimum functionality required for basic operations:

- `bigquery.datasets.create`
- `bigquery.jobs.create`
- `bigquery.tables.create`
- `bigquery.tables.get`
- `bigquery.tables.getData`
- `bigquery.tables.list`
- `bigquery.tables.update`
- `bigquery.tables.updateData`

These permissions will allow you to create, replace, and update tables, views, and incremental models. However they don't have access to `information_schema` tables or run Python models.

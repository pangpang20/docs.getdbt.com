---
title: "Gaussdb(DWS) setup"
description: "Read this guide to learn about the Gaussdb(DWS) warehouse setup in dbt."
id: "gaussdbdws-setup"
meta:
  maintained_by: dbt Labs
  authors: 'core dbt maintainers'
  github_repo: 'n/a'
  pypi_package: 'dbt-gaussdbdws'
  min_core_version: 'v0.4.0'
  cloud_support: Not supported
  min_supported_version: 'n/a'
  slack_channel_name: 'n/a'
  slack_channel_link: 'n/a'
  platform_name: 'Gaussdb(DWS)'
  config_page: '/reference/resource-configs/gaussdbdws-configs'
---

<Snippet path="warehouse-setups-cloud-callout" />

import SetUpPages from '/snippets/_setup-pages-intro.md';

<SetUpPages meta={frontMatter.meta} />


## Profile Configuration

Gaussdb(DWS) targets should be set up using the following configuration in your `profiles.yml` file.

<File name='~/.dbt/profiles.yml'>

```yaml
company-name:
  target: dev
  outputs:
    dev:
      type: gaussdbdws
      host: [hostname]
      user: [username]
      password: [password]
      port: [port]
      dbname: [database name] # or database instead of dbname
      schema: [dbt schema]
      threads: [optional, 1 or more]
      [keepalives_idle](#keepalives_idle): 0 # default 0, indicating the system default. See below
      connect_timeout: 10 # default 10 seconds
      [retries](#retries): 1  # default 1 retry on error/timeout when opening connections
      [search_path](#search_path): [optional, override the default gaussdbdws search_path]
      [role](#role): [optional, set the role dbt assumes when executing queries]
      [sslmode](#sslmode): [optional, set the sslmode used to connect to the database]
      [sslcert](#sslcert): [optional, set the sslcert to control the certifcate file location]
      [sslkey](#sslkey): [optional, set the sslkey to control the location of the private key]
      [sslrootcert](#sslrootcert): [optional, set the sslrootcert config value to a new file path in order to customize the file location that contain root certificates]

```

</File>

### Configurations

#### search_path

The `search_path` config controls the Gaussdb(DWS) "search path" that dbt configures when opening new connections to the database. By default, the Gaussdb(DWS) search path is `"$user, public"`, meaning that unqualified <Term id="table" /> names will be searched for in the `public` schema, or a schema with the same name as the logged-in user. **Note:** Setting the `search_path` to a custom value is not necessary or recommended for typical usage of dbt.

#### role

The `role` config controls the Gaussdb(DWS) role that dbt assumes when opening new connections to the database.

#### sslmode

The `sslmode` config controls how dbt connectes to Gaussdb(DWS) databases using SSL. See [the Gaussdb(DWS) docs](https://support.huaweicloud.com/tg-dws/dws_gsql_011.html) on `sslmode` for usage information. When unset, dbt will connect to databases using the Gaussdb(DWS) default, `prefer`, as the `sslmode`.


#### sslcert

The `sslcert` config controls the location of the certificate file used to connect to Gaussdb(DWS) when using client SSL connections. To use a certificate file that is not in the default location, set that file path using this value. Without this config set, dbt uses the Gaussdb(DWS) default locations. See [Client Certificates](https://support.huaweicloud.com/tg-dws/dws_gsql_011.html) in the Gaussdb(DWS) SSL docs for the default paths.

#### sslkey

The `sslkey` config controls the location of the private key for connecting to Gaussdb(DWS) using client SSL connections. If this config is omitted, dbt uses the default key location for Gaussdb(DWS). See [Client Certificates](https://support.huaweicloud.com/tg-dws/dws_gsql_011.html) in the Gaussdb(DWS) SSL docs for the default locations.

#### sslrootcert

When connecting to a Gaussdb(DWS) server using a client SSL connection, dbt verifies that the server provides an SSL certificate signed by a trusted root certificate. These root certificates are in the `/home/dbadmin/dws_ssl/sslcert/certca.pem` file by default. To customize the location of this file, set the `sslrootcert` config value to a new file path.

### `keepalives_idle`
If the database closes its connection while dbt is waiting for data, you may see the error `SSL SYSCALL error: EOF detected`. Lowering the [`keepalives_idle` value](https://www.postgresql.org/docs/9.3/libpq-connect.html) may prevent this, because the server will send a ping to keep the connection active more frequently.

[dbt's default setting](https://github.com/dbt-labs/dbt-core/blob/main/plugins/gaussdbdws/dbt/adapters/gaussdbdws/connections.py#L28) is 0 (the server's default value), but can be configured lower (perhaps 120 or 60 seconds), at the cost of a chattier network connection.


#### retries

If `dbt-gaussdbdws` encounters an operational error or timeout when opening a new connection, it will retry up to the number of times configured by `retries`. The default value is 3 retry. If set to 2+ retries, dbt will wait 1 second before retrying. If set to 0, dbt will not retry at all.


### `psycopg2-binary` vs. `psycopg2`

By default, `dbt-gaussdbdws` installs `psycopg2-binary`. This is great for development, and even testing, as it does not require any OS dependencies; it's a pre-built wheel. However, building `psycopg2` from source will grant performance improvements that are desired in a production environment. In order to install `psycopg2`, use the following steps:

```bash
if [[ $(pip show psycopg2-binary) ]]; then
    PSYCOPG2_VERSION=$(pip show psycopg2-binary | grep Version | cut -d " " -f 2)
    pip uninstall -y psycopg2-binary
    pip install psycopg2==$PSYCOPG2_VERSION
fi
```

This ensures the version of `psycopg2` will match that of `psycopg2-binary`.
**Note:** The native PostgreSQL driver cannot connect to GaussDB(DWS) directly. If you need to use the PostgreSQL native driver, you must set `password_encryption_type: 1` (compatibility mode supporting both MD5 and SHA256) to enable the PostgreSQL native driver.

###  `GaussDB psycopg2`
It is recommended to use the following approach: GaussDB uses SHA256 as the default encryption method for user passwords, while the PostgreSQL native driver defaults to MD5 for password encryption. Follow the steps below to prepare the required drivers and dependencies and load the driver.

1.You can obtain the required package from the release bundle. The package is named as:
`GaussDB-Kernel_<database_version>_<OS_version>_64bit_Python.tar.gz`.
- psycopg2：Contains the psycopg2 library files.
- lib：Contains the psycopg2 library files.

2.Follow the steps below to load the driver:
```bash
# Extract the driver package, for example: GaussDB-Kernel_xxx.x.x_Hce_64bit_Python.tar.gz
tar -zxvf GaussDB-Kernel_xxx.x.x_Hce_64bit_Python.tar.gz

# Uninstall psycopg2-binary
pip uninstall -y psycopg2-binary

# Install psycopg2 by copying it to the site-packages directory of the Python installation using the root user
cp psycopg2 $(python3 -c 'import site; print(site.getsitepackages()[0])') -r

# Grant permissions
chmod 755 $(python3 -c 'import site; print(site.getsitepackages()[0])')/psycopg2 -R

# Verify the existence of the psycopg2 directory
ls -ltr $(python3 -c 'import site; print(site.getsitepackages()[0])') | grep psycopg2

# To add the psycopg2 directory to the $PYTHONPATH environment variable and make it effective
export PYTHONPATH=$(python3 -c 'import site; print(site.getsitepackages()[0])'):$PYTHONPATH

# For non-database users, you need to add the extracted lib directory to the LD_LIBRARY_PATH environment variable
export LD_LIBRARY_PATH=/root/lib:$LD_LIBRARY_PATH

# To verify that the configuration is correct and there are no errors
(.venv) [root@ecs-euleros-dev ~]# python3
Python 3.9.9 (main, Jun 19 2024, 02:50:21)
[GCC 10.3.1] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import psycopg2
>>> exit()
```

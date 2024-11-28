<Expandable alt_header="When to use the hard_deletes and invalidate_hard_deletes config?">

**Use `invalidate_hard_deletes` (v1.8 and earlier) if:**
- You want to invalidate deleted rows by setting their `dbt_valid_to` timestamp to the current time (implicit delete).
- You are working with smaller datasets where tracking deletions as a separate state is unnecessary.
- Gaps in the snapshot history (missing records for deleted rows) are acceptable.

**Use `hard_deletes: new_record` (v1.9 and higher) if:**
- You want to explicitly track deletions by adding new rows with a `dbt_is_deleted` column (explicit delete).
- You want to maintain continuous snapshot history without gaps.
- You are working with larger datasets where explicitly tracking deleted records improves data lineage clarity.

</Expandable>

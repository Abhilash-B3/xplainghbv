# Phase 8.7 — Database Backup, Restore & Rollback Strategy

## 1. Automated PostgreSQL Backup Procedure

```bash
#!/bin/bash
# /scripts/backup_db.sh
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/xplain_db"
mkdir -p $BACKUP_DIR

pg_dump -U xplain_user -d xplain_db -F c -b -v -f "$BACKUP_DIR/xplain_db_$TIMESTAMP.dump"

# Retain backups for 30 days
find $BACKUP_DIR -type f -name "*.dump" -mtime +30 -exec rm {} \;
```

---

## 2. Tested Database Restore Procedure

```bash
# 1. Terminate active connections
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'xplain_db';"

# 2. Restore from archive dump
pg_restore -U xplain_user -d xplain_db -v -c "/var/backups/xplain_db/xplain_db_YYYYMMDD_HHMMSS.dump"

# 3. Verify ledger integrity post-restore
npm run test:reconciliation
```

---

## 3. Migration Rollback Strategy
- **Additive Migrations**: Schema changes must be backward-compatible (non-destructive).
- **Ledger Immutability**: No migration may drop `LedgerEntry` or `LedgerTransaction` tables, preserving permanent accounting records.

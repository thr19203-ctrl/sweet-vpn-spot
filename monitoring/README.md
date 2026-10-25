# sweet-vpn-spot SRE — Health Monitoring & Auto-Fix

Self-contained monitoring system for the sweet-vpn-spot project.
Checks application health endpoints, runs code quality gates,
and applies safe auto-fixes when issues are detected.

## Files

- `health_check.py`        — HTTP health endpoint checker
- `quality_check.sh`       — code quality gate runner (lint/test/build)
- `monitor.py`             — main monitoring loop (health + quality + auto-fix)
- `README.md`              — monitoring documentation
- `crontab`                — optional system crontab entry for 24/7 monitoring

## Quick start

    # Verify the service is healthy
    python3 monitor.py --once

    # Run a single-cycle monitor (health + quality + repair)
    python3 monitor.py --cycle

    # Run continuously (24/7)
    nohup python3 monitor.py --daemon > /var/log/sweet-vpn-spot-monitor.log 2>&1 &

    # Install system crontab for continuous 24/7 monitoring
    sudo crontab - < crontab

## Monitored targets

| Target                     | URL                                      | Purpose                        |
|----------------------------|------------------------------------------|--------------------------------|
| Local dev server           | http://localhost:5173/health             | Local dev health               |
| Published production app   | https://sweet-vpn-spot.lovable.app/health | Live app health very very long |

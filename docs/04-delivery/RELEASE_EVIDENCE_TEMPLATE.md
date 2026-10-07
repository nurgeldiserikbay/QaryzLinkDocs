# Release evidence template

Use this record for staging/production acceptance. Store metadata only; never copy raw secret values.

## Release identity

```text
environment=staging|production
accepted_at=<ISO-8601>
front_commit_sha=<sha>
admin_commit_sha=<sha>
backend_commit_sha=<sha>
backend_image_digest=sha256:<digest-or-n/a>
```

## Origins

```text
site_origin=https://...
api_origin=https://...
admin_origin=https://...
native_origin=https://...
```

Record exact origins only. Do not include paths, query strings, credentials or tokens.

## Backend readiness

```text
health_live=pass|fail
health_ready=pass|fail
database_dependency=up|down
migration_deploy=pass|fail
```

## Feature state

Record effective booleans, never secrets.

```text
identity_verification_enabled=false
public_marketplace_enabled=false
contract_signing_enabled=false
contract_amendments_enabled=false
contract_pdf_enabled=false
evidence_storage_enabled=false
evidence_binary_archive_enabled=false
evidence_sealing_enabled=false
evidence_timestamp_enabled=false
penalty_enabled=false
amount_based_commission_enabled=false
account_data_export_enabled=false
support_dispute_transitions_enabled=false
support_marketplace_report_transitions_enabled=false
support_evidence_legal_holds_enabled=false
expose_api_docs=false
```

## Quality gates

```text
backend_ci=pass|fail
backend_supply_chain=pass|fail
front_ci=pass|fail
front_vercel=pass|fail
admin_ci=pass|fail
admin_supply_chain=pass|fail
docs_build=pass|fail
front_strict_preflight=pass|fail
admin_strict_preflight=pass|fail
```

## Staging workflow evidence

Record workflow metadata only. Do not copy logs, URLs containing credentials, secrets or raw response bodies.

```text
render_neon_acceptance_run_id=<github-run-id-or-n/a>
render_neon_acceptance_result=pass|fail|n/a
staging_core_acceptance_run_id=<github-run-id-or-n/a>
staging_core_acceptance_result=pass|fail|n/a
front_render_browser_run_id=<github-run-id-or-n/a>
front_render_browser_result=pass|fail|n/a
admin_render_browser_run_id=<github-run-id-or-n/a>
admin_render_browser_result=pass|fail|n/a
notification_scheduler_run_id=<github-run-id-or-n/a>
notification_scheduler_result=pass|fail|n/a
```

## Browser acceptance

```text
private_debt_flow=pass|fail
risk_request_visibility=pass|fail
risk_contract_visibility=pass|fail
risk_closure_revocation=pass|fail
borrower_disclosure_history=pass|fail
admin_readonly_foundation=pass|fail
contract_chat_private_boundary=pass|fail
contract_chat_two_party_flow=pass|fail
contract_chat_unread_read_sync=pass|fail
contract_chat_history_pagination=pass|fail
contract_chat_notification_payload_privacy=pass|fail
```

## Privacy / legal acceptance

```text
privacy_copy_review=accepted|pending
risk_metric_set_review=accepted|pending
risk_snapshot_retention_review=accepted|pending
pilot_scope_approval_id=<id-or-pending>
account_data_export_schema=v2|n/a
account_data_export_self_authored_chat_only=pass|fail|n/a
account_data_export_counterparty_chat_excluded=pass|fail|n/a
account_data_export_policy_review=accepted|pending|n/a
```

## Operational acceptance

```text
monitoring=accepted|pending
backup_restore=accepted|pending
incident_runbook=accepted|pending
rollback_plan=accepted|pending
```

## Notes

Keep this section free of credentials, personal data, raw API responses and database records. Record only release-relevant decisions and references.

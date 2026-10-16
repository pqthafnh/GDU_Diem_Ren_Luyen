# Business rules

- Only approved events can be published.
- Registration locks the event, rejects duplicates, and promotes the first
  waitlisted ticket atomically when an official ticket is cancelled.
- QR tokens expire quickly and attendance requires an official ticket plus
  server-side GPS validation.
- Interactive submissions validate action ownership and cap awarded points.
- Ledger entries are immutable; corrections append a compensating entry.
- Finalization is allowed only after the event end time and never duplicates
  ledger points.

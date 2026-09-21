# Жеке шақыру арқылы ұсыныс

Backend-та іске асқан restricted staging сценарийі.

~~~mermaid
flowchart TD
    R["Borrower request"] --> I["Invitation by lender publicId"]
    I --> P["Lender proposal"]
    P --> D{"Borrower decision"}
    D -->|ACCEPT| A["One accepted proposal"]
    D -->|REJECT| X["Rejected"]
    A --> M["Request MATCHED"]
    M --> C["Next: contract draft"]
~~~

Request — borrower preference. Proposal — lender-дің нақты terms-і. ACCEPT қол қоюды, funding-ті немесе interest accrual-ды бастамайды.

API prefix `/api/v1/discovery`, Bearer required:

| Method | Route | Purpose |
|---|---|---|
| POST | `/requests` | amountMinor string, termDays |
| POST | `/requests/:id/invitations` | exact publicId lender invitation |
| POST | `/requests/:id/proposals` | lender terms |
| POST | `/proposals/:id/decision` | borrower ACCEPT/REJECT, lender WITHDRAW |
| GET | `/requests` | own/invited requests |
| GET | `/requests/:id` | visible proposals |

POST requests require UUID `Idempotency-Key`. `amountMinor` JSON string; KZT minor units, example `10000000` = 100,000 KZT. `annualRateBps=0` interest-free, positive value SIMPLE technical terms; this is not legal approval.

Errors: 400 invalid input, 401 session, 403 verification required, 404 inaccessible resource, 409 expired/conflict/idempotency conflict, 429 quota.

Private data: email/phone/legal identity are not exposed; lender rival proposals are hidden.

## Detail response privacy boundary

~~~text
GET /api/v1/discovery/requests/:id returns:

{
  "id": "uuid",
  "viewerRole": "BORROWER | LENDER",
  "status": "ACTIVE | MATCHED | ...",
  "currency": "KZT",
  "amountMinor": "string",
  "termDays": 30,
  "expiresAt": "ISO-8601",
  "proposals": [
    {
      "id": "uuid",
      "status": "PENDING | ACCEPTED | REJECTED | WITHDRAWN | SUPERSEDED",
      "termsSnapshot": "object",
      "expiresAt": "ISO-8601"
    }
  ]
}
~~~

viewerRole is the authenticated viewer's role for this request. Borrowers can see visible proposals for the request; lenders see only their own proposal records. Clients must not expose raw personal data or blindly render the opaque termsSnapshot; render only validated fields required by the UI.

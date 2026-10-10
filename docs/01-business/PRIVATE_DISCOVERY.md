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
| POST | `/requests/:id/pause` | borrower temporarily pauses an ACTIVE request |
| POST | `/requests/:id/resume` | borrower resumes a non-expired PAUSED request |
| POST | `/requests/:id/cancel` | borrower cancels an ACTIVE or PAUSED request and closes request-scoped access |
| POST | `/requests/:id/invitations` | exact Public ID lender invitation |
| POST | `/requests/:id/invitations/:invitationId/revoke` | borrower revokes one invitation |
| POST | `/blocks` | block exact Public ID and remove active invitations in both directions |
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
  ],
  "invitations": [
    {
      "id": "uuid",
      "lenderPublicId": "public-id | null",
      "createdAt": "ISO-8601"
    }
  ]
}
~~~

viewerRole is the authenticated viewer's role for this request. Borrowers can see visible proposals plus their own invitation references; lenders see only their own proposal records and receive an empty invitations array. Invitation projection is deliberately limited to invitation id, the exact Public ID the borrower used when inviting, and creation time. Email, phone, legal identity, profile payload and contact fields are not returned. Clients must not expose raw personal data or blindly render the opaque termsSnapshot; render only validated fields required by the UI.

Front borrower request detail shows active invitation references and uses the existing idempotent revoke endpoint. Revoking removes the invitation and its request-scoped risk access. Blocking remains a separate stronger action; it is not coupled to a revoke button.


## Request cancellation

Borrower request lifecycle:

- `ACTIVE -> PAUSED`: уақытша freeze; invitations/proposals/history сақталады, бірақ жаңа invite/proposal/decision әрекеттері `DISCOVERY_CONFLICT` арқылы жабылады;
- `PAUSED -> ACTIVE`: request expiry өтпесе ғана resume болады;
- `ACTIVE | PAUSED -> CANCELLED`: irreversible close.

Cancel бір discovery transaction ішінде:

- request status-ты `CANCELLED` қылады;
- pending proposals және proposal counters-ты `SUPERSEDED` қылады;
- pending/accepted marketplace applications-ты `SUPERSEDED` қылады;
- пайдаланылмаған invite links-ті бірден expire етеді;
- active request invitations-ды жояды;
- request source-тан берілген active risk-access grant-тарды revoke етеді.

Lender немесе бөтен user pause/resume/cancel жасай алмайды. `MATCHED`, expired немесе already-cancelled request қайта ашылмайды. Front-та borrower үшін ACTIVE күйінде Pause + Cancel, PAUSED күйінде Resume + Cancel көрсетіледі. PAUSED кезінде жаңа invite/proposal/decision controls жасырылып, request read-only context ретінде қалады.


## Match and block privacy closure

Proposal `ACCEPT` болғанда request `MATCHED` күйіне өтеді және discovery access winner lender-ге ғана қалады:

- competing pending proposals/counters/applications supersede болады;
- losing lender invitation-дары жойылады;
- losing lender request-scoped risk grants revoke болады;
- пайдаланылмаған invite links бірден expire болады;
- reader defense-in-depth ретінде `MATCHED` request-ті тек accepted proposal lender-ге көрсетеді.

`Block` exact екі party арасындағы discovery relationship-ты екі бағытта жабады:

- екі бағыттағы request invitation-дар жойылады;
- екі бағыттағы active `REQUEST` risk grants revoke болады;
- кейінгі exact Public ID invite әрекеттері unavailable болады.

Block қолданыстағы `CONTRACT` risk access-ті автоматты түрде жоймайды. Белсенді келісім — discovery-ден бөлек міндеттеме lifecycle-ы; contract access оның closure/cancellation rules арқылы аяқталады.


## Risk access terminal states

Risk disclosure relationship source lifecycle-мен бірге жабылады:

- request match кезінде losing lender request grant-тары revoke болады;
- block exact pair-дің active REQUEST grant-тарын екі бағытта revoke етеді;
- contract draft жасалғанда winner request grant contract-scoped grant-қа ауысады;
- contract `COMPLETED` болғанда contract grant revoke болады;
- funding deadline немесе borrower confirmation deadline өтіп, contract `EXPIRED_UNFUNDED` болғанда contract grant та transaction ішінде revoke болады.

Осылай UI status filter ғана емес, persisted grant state өзі де terminal relationship аяқталғанын көрсетеді.

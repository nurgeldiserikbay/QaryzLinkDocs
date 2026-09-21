# Staging smoke test

Жаңартылған күні: 2026-09-21.

Бұл құжат staging ортасын тексеру тәртібін сипаттайды. Ол нақты staging deploy жасалғанын немесе production дайын екенін білдірмейді.

## Қауіпсіздік шекарасы

- Тек dedicated staging database және staging credentials қолданылады.
- Production URL, production database және production secrets smoke test-ке қолданылмайды.
- Response-қа token, password, email, телефон, ЖСН/БСН немесе құжат дерегі жазылмайды.
- Test account-тар тек staging-ке арналған және тест соңында тазаланады.
- Smoke test runner metrics token-ді browser-ге немесе Front/Admin-ға жібермейді.

## Алдын ала шарттар

- нақты тексерілетін commit SHA;
- сол commit үшін жасыл CI;
- staging HTTPS origin;
- migration сәтті орындалғаны;
- secret store-да staging-only configuration;
- disposable test mailbox, егер email қосылса;
- backup және restore drill нәтижесі немесе ашық blocker.

## 1. Public liveness

~~~bash
curl --fail-with-body --silent --show-error \
  -H 'Accept: application/json' \
  https://<staging-api>/api/v1/health
~~~

Күтілетін response:

- HTTP 200;
- status — ok;
- service — qaryzlink-back;
- timestamp — ISO-8601;
- uptimeSeconds — number;
- userId, email, token, password және request payload жоқ.

Бұл тек liveness тексеруі. Database, Redis, mail, storage немесе migration readiness осы endpoint арқылы дәлелденбейді.

## 2. Protected metrics boundary

Metrics тек internal runner немесе restricted ingress арқылы тексеріледі:

1. header жоқ — 401;
2. қате token — 401;
3. дұрыс staging token — operational counters ғана;
4. response-та recipient identity, notification payload және message body жоқ.

x-metrics-token мәні log, screenshot, browser request немесе issue-ге жазылмайды.

## 3. Auth journey

Staging test account-пен тексеріңіз:

1. register;
2. login;
3. access token арқылы қорғалған GET;
4. refresh;
5. logout;
6. logout-тан кейін бұрынғы access token-мен request — 401;
7. malformed, expired және revoked token — 401.

Rate-limit кезінде 429 және Retry-After header күтіледі. Email қажет болмаса MAIL_ENABLED=false күйі тексеріледі.

## 4. Privacy boundary

Кемінде мына acceptance сценарийлері орындалады:

- private request басқа пайдаланушыға көрінбейді;
- consent берілмеген field API response-қа кірмейді;
- invitation/proposal тек рұқсат етілген тараптарға көрінеді;
- Admin live audit feed қосылмаған кезде PII көрсетпейді;
- Front/Admin public health endpoint-ті ғана browser-ден шақырады;
- protected metrics token browser bundle немесе public environment variable ішінде жоқ.

## 5. Legal feature gates

Staging smoke кезінде мына default-off boundaries тексеріледі:

- contract signing — legal review аяқталғанша disabled;
- public marketplace — disabled;
- penalty — disabled;
- amount-based commission — disabled;
- custody/payment transfer — unavailable.

Signing disabled response-ы қате жағдайда silent success болмауын қамтамасыз етуі тиіс.

## Evidence record

| Field | Example |
|---|---|
| Commit SHA | abc123... |
| Staging origin | hostname only |
| Run time | UTC |
| Check | health, auth, privacy, metrics |
| HTTP status | 200, 401, 429 |
| Result | pass/fail |
| Blocker | secret немесе PII-сыз қысқа сипаттама |

## Exit criteria

Smoke test тек мына жағдайда passed деп белгіленеді:

- барлық critical check passed;
- production secret немесе production data қолданылмаған;
- critical/high security finding жоқ немесе owner бекіткен blocker бар;
- backup/restore және rollback нәтижесі тіркелген;
- staging acceptance-ті жоба иесі көріп, бекіткен.

Staging smoke passed болуы public launch approval емес.

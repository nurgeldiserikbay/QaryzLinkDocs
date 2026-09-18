# Due және overdue worker

Бұл кезең төлем кестесіндегі мерзім жағдайларын автоматты materialize етеді. Worker ақша аудармайды, төлемді растамайды және айыппұл есептемейді.

## Күй ағымы

~~~mermaid
stateDiagram-v2
    [*] --> UPCOMING
    UPCOMING --> DUE: dueDate is today
    UPCOMING --> OVERDUE: dueDate is before today
    PARTIALLY_PAID --> OVERDUE: unpaid balance past due
    DUE --> OVERDUE: next calendar day
    PAID --> [*]
    CANCELLED --> [*]
~~~

## Worker guard-тары

- database UTC calendar day пайдаланылады;
- тек Contract ACTIVE және Funding CONFIRMED;
- unpaid amount мына формуламен тексеріледі:

unpaid = principalMinor + interestMinor + chargeMinor - paidMinor

- dueDate бүгін болса status DUE;
- dueDate өткен болса status OVERDUE;
- paidMinor толық due total-ға жетсе PAID қайта ашылмайды;
- CANCELLED ешқашан қайта ашылмайды.

## Орындау моделі

~~~mermaid
sequenceDiagram
    participant S as Deployment scheduler
    participant W as OverdueWorker
    participant DB as PostgreSQL
    S->>W: invoke run()
    W->>DB: UTC clock + one SQL transaction
    DB-->>W: changed row count
    W-->>S: evaluatedAt, today, changed
~~~

Back-та OverdueWorker injectable service ретінде тіркелген. Қазіргі API ішінде in-process cron қосылмаған: Kubernetes CronJob, queue consumer немесе managed scheduler арқылы шақыру керек. Бұл бірнеше API replica бір worker-ді қайталап орындаса да қауіпсіздігін сақтайды.

## Scope boundary

Бұл worker:

- notification жібермейді;
- late charge немесе penalty қоспайды;
- payment reversal жасамайды;
- банкпен байланыспайды;
- заңды өндіріп алу қорытындысын жасамайды.

Келесі кезеңдер: notification outbox, reversal event және deployment scheduler adapter.

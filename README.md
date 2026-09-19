# PeriCare CDSS 🛡️👶

PeriCare is a clinical decision support and regional monitoring platform designed to eliminate delays in maternal triage, clinical assessment, and emergency transfers across perinatal healthcare facilities.

---

## The Problem

Maternal health complications—such as preeclampsia, gestational diabetes, and severe hemorrhage—frequently deteriorate into life-threatening emergencies due to systemic delays:

1. **Subjective Risk Assessment**: Frontline healthcare workers at primary care clinics and district maternity units often lack automated tools to quickly calculate composite physiological risk from vital signs and lab data.
2. **Delayed Emergency Referrals**: When a pregnant patient needs intensive tertiary care, patient transfers are often coordinated via ad-hoc phone calls or paper notes, leading to missing clinical history and lost response windows.
3. **No Coordinated Facility Visibility**: Regional tertiary centers cannot see incoming transfer volumes or patient acuity in advance, limiting their ability to prep ICU beds, specialized equipment, or blood products before arrival.
4. **Intermittent Connectivity**: Rural medical units frequently face network disruptions, risking data loss or interrupted triage workflows.

---

## How PeriCare Solves This

PeriCare provides a connected digital layer that unites district hospitals with tertiary centers:

- **Standardized Risk Stratification**: By processing maternal physiological inputs into objective clinical risk levels (Low, Moderate, High, Critical), the platform eliminates guesswork at early stages.
- **Closed-Loop Referral Network**: Referrals are tracked from dispatch at the district facility through ambulance transit to reception at the tertiary facility, ensuring full chain-of-custody for high-risk mothers.
- **Explainable Decision Logic**: Rather than acting as an opaque black box, the platform highlights the exact clinical markers driving an elevated score (e.g., systolic spikes, blood glucose, proteinuria) so attending physicians can confirm diagnoses immediately.
- **Resilient Operations**: Built to handle intermittent network drops through localized data caching, ensuring frontline workers can continue triage without interruption.

---

## Core Functionalities

### 1. Maternal Triage & Risk Stratification
- Fast intake of vital signs: blood pressure (systolic/diastolic), heart rate, blood glucose, body temperature, and laboratory proteinuria.
- Instant classification into clinical risk tiers accompanied by tailored clinical protocol recommendations for the attending team.
- Visual breakdown of contributing risk parameters to assist medical teams during rapid consultations.

### 2. Inter-Facility Emergency Referrals
- Direct referral dispatch from primary units (*Urganch Tuman Markaziy Tug'ruqxonasi*) to regional tertiary centers (*Xorazm Viloyat Perinatal Markazi*).
- Real-time status tracking across each phase: `Pending`, `Accepted`, `In Transit`, and `Admitted`.
- Pre-arrival clinical alerts for receiving tertiary teams, allowing ICU bed preparation and obstetrician assignment before patient arrival.

### 3. Capacity & Department Monitoring
- Department-level bed availability tracking across reception, delivery rooms, and intensive care units.
- Service Level Agreement (SLA) timers to track urgent triage response windows and flag delayed transfers.
- Longitudinal patient visit histories to monitor vital sign trends over the course of pregnancy.

### 4. Role-Based Clinical Dashboards
- **Midwife / District Staff**: Streamlined intake interfaces focused on swift vital entry, instant risk indicators, and transfer requests.
- **Specialist / Obstetrician**: In-depth review screens featuring diagnostic histories, referral management, and decision guidance.
- **Facility Dispatcher**: Operational overview of current ward capacity, active patient transfers, and system status.

---

## Architecture & System Design

The application is built around Clean Architecture principles to separate core clinical business rules from databases and user interfaces:

- **Domain Layer**: Contains fundamental clinical entities (patients, vitals, triage records, referrals) and clinical validation rules independent of any framework.
- **Application Layer**: Houses clinical use cases (submitting assessments, approving transfers, processing notifications) and defines interface ports for infrastructure adapters.
- **Infrastructure Layer**: Manages PostgreSQL database persistence via SQLAlchemy 2.0, asynchronous background workers using Celery and Redis, and machine learning inference services.
- **API & Presentation Layer**: FastAPI exposes strictly validated endpoints, while a responsive React dashboard provides clean, focused interfaces for fast-paced medical environments.
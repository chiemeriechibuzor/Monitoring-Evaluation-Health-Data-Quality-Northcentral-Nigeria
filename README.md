# MEL Data Quality Audit: Immunization Registration Records

A worked example of the routine data review behind an SMS immunization reminder programme: grade each submitted record, explain the grade, give feedback to field staff, check data entry against a second entry, and track quality by facility and by health worker.

> **All data in this repository is synthetic.** No real children, caregivers, health workers or facilities are represented. Facility names are invented.

## Live workbook

[Open the Google Sheet (view only)](https://docs.google.com/spreadsheets/d/1LHO2U39Q_LMexS8CUNj8SaTRUExOy2CgmXctfBnO0cI/edit?usp=sharing)

| Tab | What it does |
|---|---|
| Submissions | 120 records. Formulas check blank fields, phone format, date logic, duplicates and photo quality, then assign a grade and feedback text. |
| Double Entry Check | 30 records keyed twice. Flags mismatches and suggests a likely cause. |
| Dashboard | Quality by facility and by health worker, with a chart. |
| Rubric | Grading rules and the input cells that drive them. |

## Key findings (from the simulated data)

- 67.5% of 120 records were usable as submitted; 25% needed a fix; 7.5% were discarded.
- One health worker accounted for 9 of 16 unclear photos (37.5% usable rate). At another facility, 8 of the 14 phone number problems came from one health worker.
- 13 of 30 double-entered records (43%) had at least one mismatch, mostly in date of birth and phone number.

Full write-up: [docs/case-study.md](docs/case-study.md)

## Repository contents

```
data/          Synthetic input data as CSV (submissions and double entry)
docs/          Case study and a one-page data entry training guide
apps-script/   Google Apps Script that builds feedback per health worker
```

## How the grading works

| Grade | Rule |
|---|---|
| A - Usable | No issues found |
| B - Fix | At least one issue, none of the discard conditions |
| C - Discard | Photo missing or illegible, duplicate of an earlier record, or more than 2 blank fields |

Thresholds are assumptions set for this exercise and are editable on the Rubric tab.

## Running the Apps Script

1. Open the workbook, then Extensions > Apps Script.
2. Paste in `apps-script/mel_feedback_summary.gs` and save.
3. Reload the sheet and choose MEL Audit > Build feedback summary.

It creates a tab with one row per health worker: counts by grade, usable rate, most common issue and a ready-to-send message listing the records to fix.

## Skills demonstrated

Google Sheets analysis and reporting, data quality review and grading, feedback to field staff, digital data collection design, training material, process improvement and automation with Apps Script.

## Author
Chiemerie Chibuzor, Business Process Analyst/Data Analyst, Abuja, Nigeria


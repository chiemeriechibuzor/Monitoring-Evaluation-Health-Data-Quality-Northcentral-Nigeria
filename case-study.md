# Case Study: A Data Quality Audit Pipeline for Immunization Reminder Records

**Anderson | Business Process Analyst | Abuja, Nigeria**
Workbook: [link to Google Sheet] | Data collection form: [link or screenshots] | Training guide: [link]

> The data in this project is synthetic. I built it to show how I would run the routine data review behind an SMS immunization reminder programme. No real children, caregivers or health workers are represented.

## The problem

A reminder programme only works if the phone number reaches the right caregiver and the vaccination dates are right. Records arrive from many health workers as register photos, get keyed in by data entry staff, and must be checked before anyone is enrolled. Errors at any step mean a missed reminder.

I wanted to answer three questions a MEL officer faces every week. Which records can be used? Who needs feedback, and on what? Where is the process itself leaking quality?

## What I built

1. **A graded review workbook (Google Sheets).** 120 simulated records from 6 facilities and 12 health workers. Formulas check each record for blank fields, invalid phone numbers, impossible dates, duplicates and unclear photos, then grade it A (usable), B (fix) or C (discard) against a written rubric. Each record gets plain-language feedback.
2. **A double-entry check.** 30 records keyed twice. Formulas flag mismatches in name, date of birth and phone and suggest a likely cause, such as swapped day and month.
3. **A dashboard** showing quality by facility and by health worker.
4. **An Apps Script** that groups the issues by health worker and drafts the feedback message listing each record to fix.
5. **A data collection form** with validation rules, and a **one-page guide** for data entry staff.

## What the review found

- **67.5% of records were usable as submitted.** 25% needed a fix and 7.5% had to be discarded.
- **Problems were concentrated, not spread evenly.** One health worker accounted for 9 of the 16 unclear photos, with a usable rate of 37.5%. At another facility, 8 of the 14 phone number problems came from one health worker, who had a 50% usable rate.
- **Phone numbers were the most common data fault** (14 of 120 records), including the letter O typed for zero and a dropped leading zero.
- **Double entry caught what review alone would miss.** 13 of 30 records (43%) had at least one mismatch between the two entries, mostly in date of birth and phone number.

## What I would change in the process

1. **Targeted photo coaching** for the health worker with the most unclear photos, with same-day feedback instead of a periodic report.
2. **Validate phone numbers at the point of entry** in the data collection form, so a bad number cannot be submitted.
3. **Focus double entry on date of birth and phone number**, where most mismatches occurred, and check duplicates before enrolment.

## Skills this shows

| Skill | Where it appears |
|---|---|
| Spreadsheet analysis and reporting | Formula-driven checks, grading and dashboard |
| Reviewing and grading submissions | Rubric with adjustable thresholds |
| Feedback to field staff | Auto-written feedback and message drafts |
| Digital data collection | Form with validation rules |
| Training | One-page data entry guide |
| Process improvement and automation | Apps Script and the three recommendations above |

*All thresholds in the rubric are assumptions I set for this exercise.*

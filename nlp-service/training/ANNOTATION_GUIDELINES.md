# NER Annotation Guidelines

## Purpose

These guidelines govern annotation of recruitment resumes for the custom spaCy NER model used in role-specific applicant screening.

## Entity Labels

| Label | Definition | Include | Exclude |
|---|---|---|---|
| `PERSON` | The applicant's full name | Complete name at the top of the resume ("JUAN DELA CRUZ"); names in signature blocks | Names of referees, company names, character references |
| `EDUCATION` | Academic attainments | Degree/program strings: "BS Hospitality Management", "High School Graduate", "College Level", "Vocational / TESDA Culinary Course" | School names, year ranges, GWA |
| `JOB_TITLE` | Job roles held or applied for | Role titles: "Bartender", "Line Cook", "Front Desk Receptionist" | Company names, department names, employment type |
| `SKILL` | Demonstrated competencies | Skill phrases: "Food Safety", "HACCP", "Coffee Preparation", "POS Systems" | Soft-sentence fragments, hobbies, tools that are not skills |
| `CERTIFICATION` | Credentials earned | "TESDA Cookery NC II", "Food Handler Certificate", "Driver's License" | Training attendance without credential, license numbers |

## Rules

1. Annotate the **smallest span** that carries the meaning.
2. One entity may not overlap another entity of a different label. When two labels compete, prefer the more specific label (CERTIFICATION over SKILL, EDUCATION over SKILL).
3. Annotate every occurrence of repeated entities inside their section context (e.g., each skill bullet).
4. Do not annotate inferred information — only what is literally present.
5. Ambiguous items (e.g., "Barista training seminar") are annotated as CERTIFICATION only when a credential is clearly granted; otherwise SKILL/JOB_TITLE per content.
6. Preserve original casing and punctuation within the span.

## Dataset Format

One JSON object per resume:

```json
{
  "text": "full resume text ...",
  "entities": [[start_char, end_char, "LABEL"], ...]
}
```

Splitting is performed by complete resume document (`prepare_dataset.py`) into train/validation/test sets to prevent data leakage. Never split pages or fragments of the same resume across sets.

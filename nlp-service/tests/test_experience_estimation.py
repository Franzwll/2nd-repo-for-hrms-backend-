"""Regression tests for the experience-duration estimate.

The estimate is derived from the dated employment history in the resume:

* every period counts inclusively ("June 2016 - March 2018" is 22 months),
* overlapping entries are merged so no month is counted twice,
* a self-claimed summary ("8 years of experience") may raise the number but
  never shrink verified, dated employment.

Reference case (Adrian Luis Navarro): January 2022 - Present,
April 2018 - December 2021, June 2016 - March 2018 => 124 months
= 10 years 4 months (was reported as 8.75 years before the fix).
"""
import unittest
from datetime import date

from app.services.entity_extraction import EntityExtractor


def estimate(text: str) -> float:
    """Runs the estimator without loading spaCy (it is pure regex)."""
    return EntityExtractor()._estimate_experience(text, {})


def months_of(years: float) -> int:
    return int(round(years * 12))


class TestExperienceEstimation(unittest.TestCase):

    def test_period_counts_both_end_months(self):
        # June 2016 -> March 2018 inclusive = 22 months.
        years = estimate("Line Cook\nABC Hotel\nJune 2016 - March 2018")
        self.assertEqual(months_of(years), 22)

    def test_three_period_history_total_is_inclusive(self):
        today = date.today()
        present_months = (today.year - 2022) * 12 + (today.month - 1) + 1
        expected = 22 + 45 + present_months
        years = estimate(
            "WORK EXPERIENCE\n"
            "Front Desk Agent\nRaffles Makati\nJanuary 2022 - Present\n"
            "Front Desk Receptionist\nABC Hotel\nApril 2018 - December 2021\n"
            "Housekeeping Attendant\nXYZ Inn\nJune 2016 - March 2018\n"
        )
        self.assertEqual(months_of(years), expected)

    def test_overlapping_periods_are_not_double_counted(self):
        years = estimate(
            "WORK EXPERIENCE\n"
            "Bartender\nABC Bar\nJanuary 2020 - December 2020\n"
            "Bar Supervisor\nABC Bar\nJune 2020 - December 2020\n"
        )
        self.assertEqual(months_of(years), 12)

    def test_claimed_summary_never_shrinks_dated_history(self):
        years = estimate(
            "SUMMARY\n"
            "8 years of experience in hotel operations.\n"
            "WORK EXPERIENCE\n"
            "Front Desk Agent\nRaffles Makati\nJanuary 2022 - Present\n"
            "Front Desk Receptionist\nABC Hotel\nApril 2018 - December 2021\n"
            "Housekeeping Attendant\nXYZ Inn\nJune 2016 - March 2018\n"
        )
        today = date.today()
        expected_months = 22 + 45 + ((today.year - 2022) * 12 + (today.month - 1) + 1)
        self.assertGreaterEqual(months_of(years), expected_months)

    def test_phrase_only_resume_falls_back_to_claim(self):
        self.assertEqual(estimate("Summary\nOver 5 years of experience in F&B."), 5.0)


if __name__ == "__main__":
    unittest.main()

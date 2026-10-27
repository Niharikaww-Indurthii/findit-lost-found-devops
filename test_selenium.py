import os
import sys
import time
import unittest
import subprocess
import urllib.request

from selenium import webdriver
from selenium.webdriver.common.by import By


BASE_URL = "http://127.0.0.1:5000"


class SeleniumPortalTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.server = subprocess.Popen(
            [sys.executable, "app.py"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

        for attempt in range(30):
            if cls.server.poll() is not None:
                raise RuntimeError(
                    "Flask application stopped before starting."
                )

            try:
                urllib.request.urlopen(
                    BASE_URL + "/health", timeout=2
                )
                break
            except Exception:
                time.sleep(1)
        else:
            cls.server.terminate()
            raise RuntimeError("Flask application did not start.")

        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1366,768")

        cls.driver = webdriver.Chrome(options=options)

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, "driver"):
            cls.driver.quit()

        if hasattr(cls, "server"):
            cls.server.terminate()
            try:
                cls.server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                cls.server.kill()
                cls.server.wait()

    def test_home_page_opens(self):
        self.driver.get(BASE_URL)

        self.assertIn("FindIt", self.driver.page_source)

    def test_item_grid_exists(self):
        self.driver.get(BASE_URL)

        item_grid = self.driver.find_element(By.ID, "itemGrid")

        self.assertTrue(item_grid.is_displayed())


if __name__ == "__main__":
    unittest.main(verbosity=2)
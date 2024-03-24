from selenium import webdriver
from selenium.webdriver.common.by import By
import time

# Create a new instance of the Chrome driver
driver = webdriver.Chrome()

driver.get("https://www.sports-reference.com/cbb/boxscores/index.cgi?month=3&day=21&year=2024")

# body_element = driver.find_element(By.CLASS_NAME, 'cbb')
# wrap_div = body_element.find_element(By.ID, 'wrap')
# content_div = wrap_div.find_element(By.ID, 'content')
# time.sleep(3)
index_box_scores = []
all_other_scores = driver.find_element(By.ID, 'all_other_scores')
summaries = all_other_scores.find_elements(By.CLASS_NAME, 'game_summary.gender-m')
# div_other_scores = all_other_scores.find_element_by_id("div_other_scores")
# game_summaries = div_other_scores.find_element_by_class_name("game_summaries")
# game_summary_divs = game_summaries.find_elements_by_class_name("game_summary")
for summary in summaries:
    gamelink = summary.find_element(By.CLASS_NAME, 'gamelink')
    index_box_scores.append(gamelink.find_element(By.TAG_NAME, 'a').get_attribute("href"))

print(index_box_scores)



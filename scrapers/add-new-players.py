import requests
from bs4 import BeautifulSoup
import csv

# Make a request to the website
r = requests.get('https://basketball.realgm.com/nba/players')

# Use the 'html.parser' to parse the page
soup = BeautifulSoup(r.content, 'html.parser')



# Create a csv file and write the headers
with open('players.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["#", "name", "position", "height", "weight", "age", "team_name", "year", "nationality"])

    
    # Find the data you want to extract
    for row in soup.find_all('tbody')[0].find_all('tr')[4:]:
        player_data = [td.text for td in row.find_all('td', class_='nowrap')]
        if len(player_data) > 7:
            print(player_data)
            player_data[7] = str(int(player_data[7]) + 1) # add 1 since data is years already played, and I want current year #
            writer.writerow(player_data[:8] + [player_data[-1]])
        # player_link = row.find('a')['href']
        # player = player_data[1]
        # pos = player_data[2]
        # ht = player_data[3]
        # wt = player_data[4]
        # age = player_data[5]
        # current_team = player_data[6]
        # yos = player_data[7]
        # nationality = player_data[10]

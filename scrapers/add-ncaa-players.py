import requests
from bs4 import BeautifulSoup
import csv
import time



try:
    with open('players.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["name", "team_name", "scores", "position", "height", "weight", "age", "year", "nationality", "league", "number"])
        
        colleges = ['colorado']
        for college in colleges:
            college_name = college.replace('-', ' ').title()
            if college == 'connecticut':
                college_name = 'UConn'
            elif college == 'texas-christian':
                college_name = 'TCU'
            elif college == 'saint-marys-ca':
                college_name = 'Saint Mary\'s'
            elif college == 'college-of-charleston':
                college_name = 'Charleston'
            
            r = requests.get('https://www.sports-reference.com/cbb/schools/' + college + '/men/2024.html')

            # Use the 'html.parser' to parse the page
            soup = BeautifulSoup(r.content, 'html.parser')
            player_rows = soup.find('div', id='div_roster').find('tbody').find_all('tr')

            for row in player_rows:
                player = {}
                player['name'] = row.find('th', {'data-stat': 'player'}).text.strip()
                player['number'] = row.find('td', {'data-stat': 'number'}).text.strip()
                player['class'] = row.find('td', {'data-stat': 'class'}).text.strip()
                player['position'] = row.find('td', {'data-stat': 'pos'}).text.strip()
                player['height'] = row.find('td', {'data-stat': 'height'}).text.strip()
                player['weight'] = row.find('td', {'data-stat': 'weight'}).text.strip()
                player['hometown'] = row.find('td', {'data-stat': 'hometown'}).text.strip()
                player_row = [player['name'], college_name, [], player['position'], player['height'], player['weight'], '', player['class'], player['hometown'], 'NCAAM', player['number']]
                writer.writerow(player_row)
            time.sleep(2)


except Exception as e:
    print(f"An error occurred: {e}")


teams = {'Kentucky Wildcats', 'Boise State Broncos', 'Wagner Seahawks', 'Virginia Cavaliers', 
         'Wisconsin Badgers', 'Nevada Wolf Pack', "Saint Peter's Peacocks", 'Iowa State Cyclones', 
         'Nebraska Cornhuskers', 'Long Beach State Beach', 'BYU Cougars', 'Arizona Wildcats', 
         'Clemson Tigers', 'Duke Blue Devils', 'Texas Longhorns', 'Western Kentucky Hilltoppers', 
         'Yale Bulldogs', 'Colgate Raiders', 'McNeese State Cowboys', 'Oregon Ducks', 
         'James Madison Dukes', 'South Dakota State Jackrabbits', 'Akron Zips', "Saint Mary's Gaels", 
         'Gonzaga Bulldogs', 'Duquesne Dukes', 'Utah State Aggies', 'Morehead State Eagles', 
         'Washington State Cougars', 'Florida Gators', 'NC State Wolfpack', 'Tennessee Volunteers', 
         'Oakland Golden Grizzlies', 'Samford Bulldogs', 'Auburn Tigers', 'Texas A&M Aggies', 
         'Marquette Golden Eagles', 'Grand Canyon Antelopes', 'Illinois Fighting Illini', 
         'Colorado Buffaloes', 'Stetson Hatters', 'Michigan State Spartans', 'Charleston Cougars', 
         'Purdue Boilermakers', 'Creighton Bluejays', 'Grambling State Tigers', 'TCU Horned Frogs', 
         'Vermont Catamounts', 'Mississippi State Bulldogs', 'Texas Tech Red Raiders', 
         'Kansas Jayhawks', 'North Carolina Tar Heels', 'Florida Atlantic Owls', 'Alabama Crimson Tide', 
         'Montana State Bobcats', 'University of Alabama at Birmingham Blazers', 'New Mexico Lobos', 
         'Colorado State Rams', 'Northwestern Wildcats', 'Drake Bulldogs', 'Baylor Bears', 
         'South Carolina Gamecocks', 'Connecticut Huskies', 'San Diego State Aztecs', 'Longwood Lancers', 
         'Howard Bison', 'Dayton Flyers', 'Houston Cougars'}

print(len(teams))
eliminated = []



'''
import re

teams = re.sub(r'teams playing in March Madness 2024', '', teams)
print(teams)

teams_list = []
temp = teams[0]
print(temp)
for i, ch in enumerate(teams[1:]):
    if ch.isupper() and teams[i].islower():
        teams_list.append(temp)
        temp = ch
    else:
        temp += ch

print(teams_list)



# try:
#     with open('players.csv', 'w', newline='') as file:
#         print()
# except Exception as e:
#     print(f"An error occurred: {e}")
'''
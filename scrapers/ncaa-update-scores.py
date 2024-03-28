import time

from supabase import create_client, Client

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

box_scores = ['https://www.sports-reference.com/cbb/boxscores/2024-03-21-14-north-carolina.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-14-arizona.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-19-iowa-state.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-21-tennessee.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-13-creighton.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-15-illinois.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-19-kentucky.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-21-kansas.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-19-gonzaga.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-12-brigham-young.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-16-south-carolina.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-21-texas-tech.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-16-dayton.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-18-texas.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-22-washington-state.html',
              'https://www.sports-reference.com/cbb/boxscores/2024-03-21-12-mississippi-state.html']
box_scores_2 = ['https://www.sports-reference.com/cbb/boxscores/2024-03-22-14-connecticut.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-19-purdue.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-21-houston.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-14-marquette.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-12-baylor.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-16-auburn.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-19-alabama.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-19-duke.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-13-san-diego-state.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-21-wisconsin.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-22-saint-marys-ca.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-15-clemson.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-16-florida.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-12-florida-atlantic.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-18-nebraska.html', 'https://www.sports-reference.com/cbb/boxscores/2024-03-22-21-utah-state.html']

box_scores_3 = ['https://www.sports-reference.com/cbb/boxscores/2024-03-23-17-north-carolina.html',
                'https://www.sports-reference.com/cbb/boxscores/2024-03-23-12-arizona.html', 
                'https://www.sports-reference.com/cbb/boxscores/2024-03-23-18-iowa-state.html', 
                'https://www.sports-reference.com/cbb/boxscores/2024-03-23-20-tennessee.html',
                'https://www.sports-reference.com/cbb/boxscores/2024-03-23-20-illinois.html',
                'https://www.sports-reference.com/cbb/boxscores/2024-03-23-21-creighton.html', 
                'https://www.sports-reference.com/cbb/boxscores/2024-03-23-15-kansas.html', 
                'https://www.sports-reference.com/cbb/boxscores/2024-03-23-19-north-carolina-state.html']

box_scores_4 = ['https://www.sports-reference.com/cbb/boxscores/2024-03-24-14-purdue.html',
                'https://www.sports-reference.com/cbb/boxscores/2024-03-24-19-connecticut.html',
                'https://www.sports-reference.com/cbb/boxscores/2024-03-24-20-houston.html',
                'https://www.sports-reference.com/cbb/boxscores/2024-03-24-12-marquette.html',
                'https://www.sports-reference.com/cbb/boxscores/2024-03-24-18-baylor.html',
                'https://www.sports-reference.com/cbb/boxscores/2024-03-24-17-duke.html',
                'https://www.sports-reference.com/cbb/boxscores/2024-03-24-19-alabama.html',
                'https://www.sports-reference.com/cbb/boxscores/2024-03-24-21-san-diego-state.html']
#box_score = 'https://www.sports-reference.com/cbb/boxscores/2024-03-21-14-north-carolina.html'

from bs4 import BeautifulSoup
import requests

parsed_box_score = None

try:
    for box_score in box_scores:
        r = requests.get(box_score)
        soup = BeautifulSoup(r.content, 'html.parser')
        tables = soup.findAll('div', id=lambda x: x and x.startswith('div_box-score-basic-'))
        
        for table in tables[0: 1]:
            div = table.get('id')
            college = div.split('div_box-score-basic-')[1]
            college_name = college.replace('-', ' ').title()
            if college == 'connecticut':
                college_name = 'UConn'
            elif college == 'texas-christian':
                college_name = 'TCU'
            elif college == 'saint-marys-ca':
                college_name = 'Saint Mary\'s'
            elif college == 'college-of-charleston':
                college_name = 'Charleston'
            print(college_name)
            player_rows = table.find('tbody').find_all('tr')
            for row in player_rows:
                if row.get('class') != ['thead']:
                    player_name = row.find('a').text
                    points_scored = row.find('td', {'data-stat': 'pts'}).text
                    response = supabase.table('players').select("*").eq('league', 'NCAAM').eq('team_name', college_name).eq('name', player_name).execute()
                    if response and response.data:
                        #print(response)
                        pid = response.data[0]['player_id']
                        scores = response.data[0]['scores'] + [float(points_scored)]
                        print(player_name)
                        #eq on league, name, team_name
                        #append points_scored to scores
                        _, _ = supabase.table('players').update({'scores': scores}).eq('player_id', pid).execute()
                    else:
                        print('missed: ' + player_name)
        time.sleep(5)

except Exception as e:
    print(f"Error parsing box score: {e}")
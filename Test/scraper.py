import json

import tweepy

import os



# files = os.listdir(os.curdir)

# print(files)

# pull saved twitter keys
with open('twitter.json', 'r') as file:
    data = json.load(file)

# twitter api info
consumer_key = 'eAfxmWAuHzaModUDt0H7SSRKm'
consumer_secret = 'bD4bbJzmfMKHTob3xKuZmaSrntdjFOc5M3F16FHogvzTAPWA92'
access_token = '1384993541873614849-au8UMmYshzid1kJXNprqgdjVitmd7x'
access_token_secret = 'HrAq1IKY8H4Mw502T1gnW4v8BSpugvI5QYAyfNKesIkMn'

# tweepy setup
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)
api = tweepy.API(auth)

# inputs
search_word = '#bitcoin'
date_since = '2021-04-21'

# test
tweets = tweepy.Cursor(api.search, q=search_word, lang='en', since=date_since).items(3)

i = 0
for tweet in tweets:
    i+=1

    # print(tweet.text)
    # print(f'by {tweet.user.screen_name}')
print(i)

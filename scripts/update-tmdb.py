#!/usr/bin/env python3
"""Refresh the tracked Star Wars dataset from TMDB."""

import json
import os
import sys
import urllib.parse
import urllib.request


API_KEY = os.environ.get("TMDB_API_KEY", "fb83a92a3cb8282e1aed71944106d102")
BASE_URL = "https://api.themoviedb.org/3"
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "starwars-chrono.json")
ADDITIONAL_MOVIE_IDS = [1228710]


def fetch(path):
    query = urllib.parse.urlencode({"api_key": API_KEY, "language": "en-US"})
    with urllib.request.urlopen(f"{BASE_URL}{path}?{query}") as response:
        return json.load(response)


def update_fields(target, source, fields):
    for field in fields:
        if field in source:
            target[field] = source[field]


def refresh_movie(section):
    movie = fetch(f"/movie/{section['id']}")
    update_fields(
        section,
        movie,
        ["title", "overview", "release_date", "popularity", "vote_average", "vote_count", "runtime"],
    )
    section["rating"] = movie.get("vote_average")
    section["vote_count"] = movie.get("vote_count")
    item = section["items"][0]
    update_fields(item, section, ["title", "overview", "release_date", "popularity", "runtime"])
    item["rating"] = movie.get("vote_average")
    item["vote_count"] = movie.get("vote_count")


def create_movie(movie_id):
    movie = fetch(f"/movie/{movie_id}")
    external_ids = fetch(f"/movie/{movie_id}/external_ids")
    item = {
        "type": "movie",
        "id": movie["id"],
        "title": movie["title"],
        "overview": movie.get("overview"),
        "release_date": movie.get("release_date"),
        "poster": f"https://image.tmdb.org/t/p/w500{movie.get('poster_path')}",
        "popularity": movie.get("popularity"),
        "rating": movie.get("vote_average"),
        "vote_count": movie.get("vote_count"),
        "runtime": movie.get("runtime"),
        "imdb": external_ids.get("imdb_id"),
    }
    return {**item, "items": [item.copy()]}


def refresh_show(section):
    show = fetch(f"/tv/{section['id']}")
    update_fields(
        section,
        show,
        ["title", "overview", "first_air_date", "popularity", "vote_average", "vote_count"],
    )
    section["rating"] = show.get("vote_average")
    section["vote_count"] = show.get("vote_count")

    episodes_by_key = {
        (item.get("season"), item.get("episode")): item for item in section["items"]
    }
    for season in show.get("seasons", []):
        if season.get("season_number", 0) <= 0:
            continue
        season_data = fetch(f"/tv/{section['id']}/season/{season['season_number']}")
        for episode in season_data.get("episodes", []):
            item = episodes_by_key.get((season["season_number"], episode["episode_number"]))
            if item is None:
                continue
            update_fields(item, episode, ["title", "overview", "air_date", "vote_average", "vote_count", "runtime"])
            item["release_date"] = episode.get("air_date")
            item["rating"] = episode.get("vote_average")
            item["vote_count"] = episode.get("vote_count")
            item["poster"] = (
                f"https://image.tmdb.org/t/p/w500{episode['still_path']}"
                if episode.get("still_path")
                else section["poster"]
            )


data_path = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.abspath(DATA_PATH)
with open(data_path, encoding="utf-8") as data_file:
    data = json.load(data_file)

known_ids = {section["id"] for section in data}
for movie_id in ADDITIONAL_MOVIE_IDS:
    if movie_id not in known_ids:
        data.append(create_movie(movie_id))

for section in data:
    is_movie = section.get("type") == "movie" or section.get("items", [{}])[0].get("type") == "movie"
    if is_movie:
        refresh_movie(section)
    else:
        refresh_show(section)
    print(f"updated {section['id']} {section['title']}")

with open(data_path, "w", encoding="utf-8") as data_file:
    json.dump(data, data_file, indent=2, ensure_ascii=False)
    data_file.write("\n")
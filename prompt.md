# WaveReady Prompts Collection

This document collates all the prompts given across this chat session in chronological order.

---

## Prompt 1: Initial App Creation & API Specifications

```text
ROLE
You are a senior React developer. You build a Vite + React app for WaveReady, deployed on Vercel.

GOAL
Build WaveReady, which helps Water Sports Lovers and Fishing Charter to find the best beach that is nearest, suitable for water sports.

Add a serverless API connection that pull live data from the following API endpoint. 


Sub-goals. I will test each one by its number:
1. The app takes in Weather and Tidal conditions to see which area in Singapore is suitable for water sport and fishing charter. The app should be optimised on a phone but also work as a web app.
2. The home screen should show a map using OneMap tiles as basemap to help users visualise using the following endpoints:
	a. GET https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png 
	b. If this is too detailed, use this instead: https://data.gov.sg/datasets/d_29f066d67df3eae91df8a42f443863c8/view

3. Data should be obtained via the following endpoints:
Live coastal tide data from NEA (GET https://neaweather.com/api/v1/tides), fetched only through our project’s /api/tides.
Live coastal UV data from NEA (GET https://neaweather.com/api/v1/uv), fetched only through our project’s /api/uv.
Live coastal heat stress data from NEA (GET https://neaweather.com/api/heat-stress), fetched only through our project’s /api/heat-stress.
Wind direction from GET https://data.gov.sg/datasets/d_534cf203023b51f51f879145ccc56ff9/view
Wind speed from GET https://data.gov.sg/datasets/d_7677738484067741bf3b56ab5d69c7e9/view
4. When the data is empty, slow or refused, the screen says so in plain words.
5. Second feature to include partners such as boat rental and water sports equipment
6. The footer credits the data source: "Data: NEA, Data.gov.sg, METEO".

OUTPUT
A Vite + React app with components in src/ and one serverless function in api/NEA.ts. And health.ts
List every file you create or change. Add .env.example with variable names only, no values.

GUARDRAILS
1. Read every key from process.env inside api/ only. Never give a key the VITE_ prefix.
2. Never write a key into any file. Put .env* and !.env.example in .gitignore.
3. Never invent data. If the API fails, show a message, not sample rows.
4. If a key variable is empty, api/ returns 503 "key not configured" and does not call the provider.
5. Send no personal or confidential data to any AI model.
6. There is no key required for this service

CONTEXT 
Customer: High-end water sports enthusiasts (e.g. fishing charter, jetskiing, yacht racing)

Price: 1 month free trial + $10 per month, or $100 for a year. 
Partner with list vendors in our app for additional royalties 

Why they pay: Enthusiasts fear losing expensive boat charter costs, location rental and equipment fees, but don’t want to check multiple sources for wind, tides, etc. It’s like buying peace of mind. 

The number that shows it works: 

User: active subscription; monthly revenue
Partner: Active suppliers; Supplier revenue

Before writing code, list my sub-goals back to me and say how you will meet each one.
```

---

## Prompt 2: GitHub Repository Push

```text
git push: https://<GITHUB_TOKEN_REDACTED>@github.com/wilemjake/WaveReady.git
```

---

## Prompt 3: Wave Score Refinement & NEA 4-Day Rain Forecast

```text
Make the following changes to the app: 
Make the suitability score the "Wave Score" on a scale of 0 to 100, tailored to sport type (swimming, kayak, Fishing Boat). Ensure that the range of the wave score is widened between different locations, so that different beaches show considerably different scores. This is for the purpose of having a actionable demo to potential investors for the app. 
Include additional API Rain information from NEA for the next 4 days (GET https://neaweather.com/api/v1/forecast/4day) fetched through our project’s /api/rain
```

---

## Prompt 4: Activity Labeling, Redundant Tab Removal, and Thunderstorm Logic

```text
1. Change “Kayak & SUP” to “Jetski/Kayak/SUP”. 
2. Remove “Beaches & Tides” tab as it is the same as “Coastal Map” tab.
3. Weather especially rain or thunderstorm should affect the overall Wave Score. For example, if its thunders with shower is in a certain area as such not suitable for water sport, score should appear red and below 30. 
4. Do not make any other changes to the app.
```

---

## Prompt 5: Collate Prompts

```text
collate all the prompts in this chat into prompt.mdfile
```

# Iron Front — Global Command

A self-contained tactical 2D browser wargame with alliances, campaign map scales, optional naval invasions, difficulty settings, and English/Spanish/French language options.

## Run

Open `index.html` in a browser, or serve this folder with `python3 -m http.server 8080` and visit `http://localhost:8080`.

## Real-world maps

The battlefield displays real-world OpenStreetMap tiles for selected cities, US states, countries, and world regions. Choose a map scale and theater to move the map to that location. Tiles require an internet connection and are provided by OpenStreetMap; visible attribution links to the OpenStreetMap copyright page. If the external map service or network is unavailable, the game remains playable with its tactical overlay, but the basemap may not appear.

## Main menu

Choose Easy, Medium, Difficult, or Impossible before starting. Difficulty changes the number, health, damage, and attack pace of enemy units. Choose English, Spanish, or French in the menu or from the in-game language selector; the preference is saved in the browser.

## Campaign setup

Choose a City, State, Country, or World map scale, select a real-world theater and alliance, and optionally enable Naval invasion. Press **Deploy** to start a new battle with the selected setup.

## Controls

- **WASD**: Move the active unit
- **1–3**: Select a unit
- **Click**: Target an enemy
- **Space**: Attack

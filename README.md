# LoL Game Watcher

This project is a simple web server returning a set of data describing an ongoing game of League of Legends.

## Getting started

First you need to setup the following environnement variables.   

| Name          | Value                                               |
|---------------|-----------------------------------------------------|
| LOL_API_TOKEN | [token](https://developer.riotgames.com/docs/portal)|
| PORT          | your_port                                           |

Then you can install dependencies and run it   
`npm i`   
`npm run start`   

### Basic endpoints

`/ongoing?username=<summoner_name>&region=<region_id>`   
Returns a set of filtered data.  
`username`: one of the player in the active game.  
`region`: region of the ongoing game, avalaible regions are: `BRAZIL`, `EU_EAST`, `EU_WEST`, `KOREA`, `LAT_NORTH`, `LAT_SOUTH`, `AMERICA_NORTH`, `OCEANIA`, `TURKEY`, `RUSSIA`, `JAPAN` and `PBE` 
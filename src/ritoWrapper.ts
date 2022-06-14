import { LolApi } from "twisted";
import { Regions } from "twisted/dist/constants";
import { ApiResponseDTO, ChampionsDataDragonDetailsSolo, CurrentGameInfoDTO, SpectatorNotAvailableDTO } from "twisted/dist/models-dto";

interface GameData {
    gameMode: string;
    map: string;
}

interface FilteredChampionData {
    name: string;
    title: string;
    sprite: string;
}

interface FilteredBannedChampionData extends FilteredChampionData {
    side: number;
}

export default class RitoWrapper {

    private lolApi: LolApi;

    private async _filterChampData(champID: number): Promise<FilteredChampionData>{
        if (champID === 888) return;
        try {
            const versions = await this.lolApi.DataDragon.getVersions();
            const data = await this.lolApi.DataDragon.getChampion(champID);
            return {
                name: data.name,
                title: data.title,
                sprite: `https://ddragon.leagueoflegends.com/cdn/${versions[0]}/img/champion/${data.image.full}`
            }
        } catch (e) {
            console.error(e);
            return {
                name: "",
                title: "",
                sprite: ""
            }
        }

    }

    private async _filterBannedChampData(champID: number, side: number): Promise<FilteredBannedChampionData> {
        if (champID === 888) return;
        const data = await this._filterChampData(champID);
        return {
            ...data,
            side: side,
        }
    }

    async GetCurrentGameStats(summoner: string, region: Regions) {

        try {
            const { response: { id } } = await this.lolApi.Summoner.getByName(summoner, region);

            const gameResponse = await this.lolApi.Spectator.activeGame(id, region);
            if ((gameResponse as SpectatorNotAvailableDTO).message) { return { error: "No active game" } }
            const currentGame = (gameResponse as ApiResponseDTO<CurrentGameInfoDTO>).response;
            const maps = await this.lolApi.DataDragon.getMaps();
    
            const bansPromises: Array<Promise<FilteredBannedChampionData>> = [];
            for (let champion of currentGame.bannedChampions) { bansPromises.push(this._filterBannedChampData(champion.championId, champion.teamId)); }
            return {
                map: maps.find((item) => item.mapId === currentGame.mapId.toString()),
                mode: currentGame.gameMode,
                startTime: currentGame.gameStartTime,
                picks: currentGame.participants,
                bans: await Promise.all(bansPromises)
            }
        } catch (e) {
            console.error(e);
            return {}
        }
        // const picksPromises: Array<Promise<FilteredChampionData>> = [];
        // for (let champion of currentGame.)


    }

    constructor(private apiKey: string) {
        this.lolApi = new LolApi({
            key: this.apiKey,
            debug: {
                logTime: true,
                logUrls: true
            }
        });
    }
}

/*{
    bans (si draft/ranked)
    game start time
    mode
    map
    par champ: {
        portrait
        runes (principale/secondaire)
        summoner spells
        rank soloqueue
    }
}*/
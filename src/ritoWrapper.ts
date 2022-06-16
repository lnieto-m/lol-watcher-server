import axios from "axios";
import { LolApi } from "twisted";
import { Regions } from "twisted/dist/constants";
import { ApiResponseDTO, ChampionsDataDragonDetails, CurrentGameInfoDTO, CurrentGameParticipantDTO, SpectatorNotAvailableDTO, SummonerLeagueDto } from "twisted/dist/models-dto";
import { FilteredChampionData, FilteredBannedChampionData, FilteredParticipantData, GlobalRunesData, RUNES_BASE_URL, QueueData, GameDataSetResponse, ErrorResponse } from "./ritoTypeDeclaration";

export default class RitoWrapper {

    private lolApi: LolApi;
    private championList: ChampionsDataDragonDetails[];
    private gameVersion: string;
    private summonerSpells: { [key: string]: any };
    private runesData: GlobalRunesData[];
    private queuesData: QueueData[];

    private _filterChampData(champID: number): FilteredChampionData {
        if (champID === 888) return;
        try {
            const data = this.championList.find((item) => item.key == champID.toString());
            return {
                name: data.name,
                title: data.title,
                sprite: `https://ddragon.leagueoflegends.com/cdn/${this.gameVersion}/img/champion/${data.image.full}`
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

    private _filterBannedChampData(champID: number, side: number): FilteredBannedChampionData {
        if (champID === 888) return;
        const data = this._filterChampData(champID);
        return {
            ...data,
            side: side,
        }
    }

    private async _filterParticipantData(rawData: CurrentGameParticipantDTO, region: Regions): Promise<FilteredParticipantData> {
        
        try {
            const championData = this.championList.find((item) => item.key == rawData.championId.toString());
            const summonerSpellsList = Object.values(this.summonerSpells.data as { [key: string]: any });
            const rank = (await this.lolApi.League.bySummoner(rawData.summonerId, region)).response;
            const mainRuneStyle = this.runesData.find(item => item.id === rawData.perks.perkStyle).slots[0].runes.find(item => item.id === rawData.perks.perkIds[0]).icon;

            return {
                summonerName: rawData.summonerName,
                championName: championData.name,
                championPortraitURL: `https://ddragon.leagueoflegends.com/cdn/${this.gameVersion}/img/champion/${championData.image.full}`,
                summonerSpells: {
                    spell1URL: `http://ddragon.leagueoflegends.com/cdn/${this.gameVersion}/img/spell/${summonerSpellsList.find(item => (item.key as string) == rawData.spell1Id.toString()).id as string}.png`,
                    spell2URL: `http://ddragon.leagueoflegends.com/cdn/${this.gameVersion}/img/spell/${summonerSpellsList.find(item => (item.key as string) == rawData.spell2Id.toString()).id as string}.png`
                },
                perks: {
                    main: RUNES_BASE_URL + mainRuneStyle,
                    secondary: RUNES_BASE_URL + this.runesData.find(item => item.id == rawData.perks.perkSubStyle).icon
                },
                rank: rank,
                side: rawData.teamId
            }
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    /**
     * Returns a set of data of the given summoner active game
     * @param summoner Summoner name
     * @param region Summoner region
    */
    async GetCurrentGameStats(summoner: string, region: Regions): Promise<GameDataSetResponse | ErrorResponse> {

        try {
            const { response: { id } } = await this.lolApi.Summoner.getByName(summoner, region);

            this.championList = Object.values((await this.lolApi.DataDragon.getChampion()).data);
            this.gameVersion = await this.lolApi.DataDragon.getVersions()[0];
            if (!this.gameVersion)
            {
                console.log(this.gameVersion, this.championList.length, id);
                this.gameVersion = "12.11.1";
            }
            this.summonerSpells = await (await axios.get(`https://ddragon.leagueoflegends.com/cdn/${this.gameVersion}/data/en_US/summoner.json`)).data;
            this.runesData = await (await axios.get(`https://ddragon.leagueoflegends.com/cdn/${this.gameVersion}/data/en_US/runesReforged.json`)).data;
            this.queuesData = await (await axios.get('https://static.developer.riotgames.com/docs/lol/queues.json')).data;

            const gameResponse = await this.lolApi.Spectator.activeGame(id, region);

            // Unavailable game
            if ((gameResponse as SpectatorNotAvailableDTO).message) { return { code: 1, description: (gameResponse as SpectatorNotAvailableDTO).message }; }

            const currentGame = (gameResponse as ApiResponseDTO<CurrentGameInfoDTO>).response;
            const map = (await this.lolApi.DataDragon.getMaps()).find((item) => item.mapId == currentGame.mapId.toString());
            
            // Bans
            const bansPromises: Array<Promise<FilteredBannedChampionData>> = [];
            let bans: FilteredBannedChampionData[] = [];
            for (let champion of currentGame.bannedChampions) { bans.push(this._filterBannedChampData(champion.championId, champion.teamId)); }

            //Participants
            let participantsPromises: Promise<FilteredParticipantData>[]= [];
            for (let participant of currentGame.participants) {participantsPromises.push( this._filterParticipantData(participant, region)); }

            return {
                map: map,
                mode: this.queuesData.find(item => item.queueId == currentGame.gameQueueConfigId).description,
                startTime: currentGame.gameStartTime,
                participants: await Promise.all(participantsPromises),
                bans: bans
            }
        } catch (e) {
            console.error(e);
            return { code: 403, description: "No game active" }
        }
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
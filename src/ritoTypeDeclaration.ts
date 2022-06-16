import { MapsDataDragonDTO, SummonerLeagueDto } from "twisted/dist/models-dto";

export interface GameData {
    gameMode: string;
    map: string;
}

export interface FilteredChampionData {
    name: string;
    title: string;
    sprite: string;
}

export interface FilteredBannedChampionData extends FilteredChampionData {
    side: number;
}

export interface FilteredParticipantData {
    summonerName: string;
    championName: string;
    championPortraitURL: string;
    summonerSpells: {
        spell1URL: string;
        spell2URL: string;
    },
    perks: {
        main: string;
        secondary: string;
    },
    rank: SummonerLeagueDto[], //string,
    side: number
}

export interface BaseRunesData {
    id: number;
    key: string;
    icon: string;
    name: string; 
}

export interface SubRunesData extends BaseRunesData {
    shortDesc: string;
    longDesc: string;
}

export interface RuneSlot {
    runes: SubRunesData[];
}

export interface GlobalRunesData extends BaseRunesData {
    slots: RuneSlot[];
}

export interface QueueData {
    queueId: number;
    map: string;
    description: string;
    notes: string;
}

export interface ErrorResponse {
    code: number;
    description: string;
}

export interface GameDataSetResponse {
    map: MapsDataDragonDTO;
    mode: string;
    startTime: number;
    participants: FilteredParticipantData[];
    bans: FilteredBannedChampionData[];
}

export const RUNES_BASE_URL = "https://ddragon.canisback.com/img/";
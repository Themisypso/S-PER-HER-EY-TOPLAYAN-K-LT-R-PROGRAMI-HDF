export type MediaType = 'MOVIE' | 'TVSHOW' | 'ANIME' | 'GAME' | 'BOOK';

export type MediaStatus = 'PLANNED' | 'WATCHING' | 'COMPLETED' | 'DROPPED' | 'ON_HOLD' | 'REWATCHING';

export interface BaseMedia {
    id: string;
    title: string;
    type: MediaType;
    posterUrl: string | null;
    backdropUrl?: string | null;
    releaseYear?: number | null;
}

export interface MediaItem extends BaseMedia {
    status: MediaStatus | null;
    rating?: number | null;
    tmdbId?: string | null;
    rawgId?: number | null;
    bookId?: string | null;
    userId?: string;
    tmdbRating?: number | null;
    runtime?: number | null;
    episodeCount?: number | null;
    seasonCount?: number | null;
    genres?: string[];
}

export interface SearchResult extends BaseMedia {
    tmdbId?: string;
    rawgId?: string;
    bookId?: string;
    overview?: string;
    tmdbRating?: number;
    mediaType?: 'movie' | 'tv' | 'game' | 'book' | 'person';
}

export interface Person {
    id: string;
    name: string;
    profilePath: string | null;
    role?: string;
    character?: string;
}

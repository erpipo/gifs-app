import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interface';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, tap } from 'rxjs';

const GIF_KEY = 'gifs';
const loadFromLocalStorage = () => {
    const gifsFromLocalStorage = localStorage.getItem(GIF_KEY) ?? '{}';
    const gifs = JSON.parse(gifsFromLocalStorage);
    console.log(gifs);
    return gifs;
}

@Injectable({ providedIn: 'root' })
export class GifService {
    private http = inject(HttpClient);
    Gifs = signal<Gif[]>([]);
    GifsLoading = signal(false);
    private trendingPage = signal(0);

    trendingGifGroup = computed<Gif[][]>(() => {
        const groups =[];
        for (let i = 0; i < this.Gifs().length; i += 3) {
            groups.push(this.Gifs().slice(i,i + 3));
        }
        console.log(groups);
        return groups;
    });

    searchHistory = signal<Record<string,Gif[]>>( loadFromLocalStorage() );
    searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

    constructor() {
        this.loadTrendingGifs();
    }

    saveGifsToLocalStorage = effect(() => {
        const historyString = JSON.stringify(this.searchHistory());
        localStorage.setItem(GIF_KEY, historyString);
    })

    loadTrendingGifs() {
        if (this.GifsLoading()) return;
        this.GifsLoading.set(true);
        this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
            params: {
                api_key: environment.giphyKey,
                limit: 33,
                offset: this.trendingPage() * 20,
            }
        }).subscribe((resp) => {
            const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
            this.Gifs.update(currentGifs => [...currentGifs,...gifs]);
            this.trendingPage.update( (page) => page +1 );
            this.GifsLoading.set(false);
        });
    }

    searchGifs(query:string){
        return this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
            params: {
                api_key: environment.giphyKey,
                q: query,
                limit: 25,
            }
        }).pipe(
            map( ({ data } ) => data),
            map((items) => GifMapper.mapGiphyItemsToGifArray(items)),
            tap( items => {
                this.searchHistory.update( history => ({
                    ...history,
                    [query.toLowerCase()]: items,
                }));
            })
        );
    }

    getHistoryGifs( query:string ):Gif[]{
        return this.searchHistory()[query] ?? [];
    }
}
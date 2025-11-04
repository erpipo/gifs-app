import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { GifService } from 'src/app/gifs/services/gifs.service';

interface MenuOption {
  label:string;
  subLabel:string;
  route:string;
  icon:string;
}

@Component({
  selector: 'gifs-side-menu-options',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu-options.html',
})
export class SideMenuOptions { 
  gifService = inject(GifService);

  menuOptions = signal<MenuOption[]>([
    {
      label:'Trending',
      subLabel:'Gifs Populares',
      icon:'fa-solid fa-chart-line',
      route:'/dashboard/trending'
    },
    {
      label:'Buscador',
      subLabel:'Buscar Gifs',
      icon:'fa-solid fa-magnifying-glass',
      route:'/dashboard/search'
    },
  ]);

}

import { RouterModule, Routes } from '@angular/router';

import { AboutComponent } from './about';
import { SettingsComponent } from './settings';
import { TrafficComponent } from './traffic';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/traffic',
        pathMatch: 'full'
    },
    {
        path: 'traffic',
        component: TrafficComponent
    },
    {
        path: 'about',
        component: AboutComponent
    },
    {
        path: 'settings',
        component: SettingsComponent
    }
];

export const appRoutingProviders: any[] = [];

export const routing = RouterModule.forRoot(appRoutes);

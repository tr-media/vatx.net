import { NgModule }      from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/src/providers/angulartics2-google-analytics';

import { AppComponent }  from './app.component';

import {
    AnalyticsService,
    AppService,
    DbService,
    LibraryService,
    MenuComponent,
    NavbarComponent,
    NetworkService,
    PopupComponent,
    ProfileComponent,
    ProgressBarComponent,
    SearchComponent
}  from './shared';

import {
    TrafficComponent,
    TrafficEntryComponent,
    TrafficListComponent,
    TrafficService,
    TrafficTableComponent
} from './traffic';

import { AboutComponent } from './about';
import { SettingsComponent } from './settings';

import {
    appRoutingProviders,
    routing
} from './app.routing';

import { HttpModule } from '@angular/http';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing,
        Angulartics2Module.forRoot()
    ],
    declarations: [
        AppComponent,
        NavbarComponent,
        MenuComponent,
        TrafficComponent,
        TrafficTableComponent,
        TrafficListComponent,
        TrafficEntryComponent,
        AboutComponent,
        ProfileComponent,
        SearchComponent,
        SettingsComponent,
        ProgressBarComponent,
        PopupComponent
    ],
    providers: [
        appRoutingProviders,
        TrafficService,
        NetworkService,
        AppService,
        DbService,
        LibraryService,
        Angulartics2GoogleAnalytics,
        AnalyticsService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule }      from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
    appRoutingProviders,
    routing
} from './app.routing';
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
import { AppComponent }  from './app.component';
import { SettingsComponent } from './settings';
import { TestComponent } from './test/test.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing,
        BrowserAnimationsModule
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
        PopupComponent,
        TestComponent
    ],
    providers: [
        appRoutingProviders,
        TrafficService,
        NetworkService,
        AppService,
        DbService,
        LibraryService,
        AnalyticsService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

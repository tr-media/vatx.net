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
    SearchComponent,
}  from './shared';
import {
    TrafficComponent,
    TrafficEntryComponent,
    TrafficListComponent,
    TrafficService,
    TrafficTableComponent,
} from './traffic';
import {
    appRoutingProviders,
    routing,
} from './app.routing';

import { AboutComponent } from './about';
import { AppComponent }  from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule }      from '@angular/core';
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

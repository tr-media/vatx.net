import { Injectable } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

@Injectable()
export class AnalyticsService {
    constructor(
        private angulartics2: Angulartics2
    ) { }

    public trackEvent(category: string, action: string, label?: string, value?: number) {
        let event = {
            action: action,
            properties: {
                category: category
            }
        };
        if (label) {
            event.properties['label'] = label;
        }
        if (value) {
            event.properties['value'] = value;
        }
        this.angulartics2.eventTrack.next(event);
    }
}

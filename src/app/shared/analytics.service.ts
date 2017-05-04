import { Injectable } from '@angular/core';

@Injectable()
export class AnalyticsService {
    constructor(
        
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
    }
}

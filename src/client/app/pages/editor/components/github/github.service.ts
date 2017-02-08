import { Injectable } from '@angular/core';


export enum WIZARD_STEP {
    LOGIN,
    LOGGING_IN,
    CHOOSE_FILE,
    DOWNLOADING
}

@Injectable()
export class GitHubService {
    public wizardStep: WIZARD_STEP;
    public data: any;

    public constructor() {
        this.wizardStep = WIZARD_STEP.LOGIN;

        this.data = {
            user: {
                token: '',
                remember: false,
                object: null,
                ui: {
                    hasError: false
                }
            },

            gists: {
                objects: [],
                selected: null
            },

            repos: {
                objects: [],
                selected: null,
                current: null
            },

            branches: {
                objects: [],
                selected: null,
                ui: {
                    loading: false
                }
            },

            files: {
                objects: [],
                selected: null,
                currentSha: null,
                rootSha: null,
                ui: {
                    loading: false
                }
            }
        };
    }
}

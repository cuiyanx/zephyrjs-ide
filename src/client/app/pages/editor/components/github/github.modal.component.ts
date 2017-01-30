// Core
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Output,
    ViewChild
} from '@angular/core';

import { RepoService, UserService } from './github.api.services';


declare var $: any;


enum WIZARD_STEP {
    LOGIN,
    LOGGING_IN,
    CHOOSE_FILE,
    DOWNLOADING
}


@Component({
    moduleId: module.id,
    selector: 'github-modal',
    templateUrl: 'github.modal.component.html',
    styleUrls: ['github.modal.component.css']
})
export class GitHubModalComponent implements AfterViewInit {
    @Output() fileFetched = new EventEmitter();

    // Children

    @ViewChild('gitHubModal')
    private gitHubModal: ElementRef;

    // Types

    // tslint:disable-next-line:no-unused-variable (used in template)
    private wizardStep = WIZARD_STEP;

    // Variables

    private gitHub: any = {
        ui: {
            wizardStep: WIZARD_STEP.LOGIN
        },

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

    public ngAfterViewInit() {
        $(this.gitHubModal.nativeElement).on('shown.bs.modal', () => {
            this.onShown();
        });

        $(this.gitHubModal.nativeElement).on('hidden.bs.modal', () => {
            this.onHidden();
        });
    }

    // API

    public show() {
        let el = $('#github_remember_me');
        (el as any).bootstrapToggle().change(() => {
            this.gitHub.user.remember = (el as any).prop('checked');
        });
        $(this.gitHubModal.nativeElement).modal('show');
    }

    public hide() {
        $(this.gitHubModal.nativeElement).modal('hide');
    }

    // Functions

    public constructor(
        private repoService: RepoService,
        private userService: UserService) {
    }

    private resetUI() {
        this.gitHub.ui.wizardStep = WIZARD_STEP.LOGIN;
    }

    private resetUser() {
        this.gitHub.user.token = '';
        this.gitHub.user.remember = false;
        this.gitHub.user.object = null;
        this.gitHub.user.ui.hasError = false;
    }

    private resetGists() {
        this.gitHub.gists.objects = [];
        this.gitHub.gists.selected = null;
    }

    private resetRepos() {
        this.gitHub.repos.objects = [];
        this.gitHub.repos.selected = null;
        this.gitHub.repos.current = null;
    }

    private resetBranches() {
        this.gitHub.branches.objects = [];
        this.gitHub.branches.selected = null;
        this.gitHub.branches.ui.loading = false;
    }

    private resetFiles() {
        this.gitHub.files.objects = [];
        this.gitHub.files.selected = null;
        this.gitHub.files.currentSha = null;
        this.gitHub.files.rootSha = null;
        this.gitHub.files.ui.loading = false;
    }

    private reset() {
        this.resetUI();
        this.resetUser();
        this.resetGists();
        this.resetRepos();
        this.resetBranches();
        this.resetFiles();
    }

    // tslint:disable-next-line:no-unused-variable
    private onShown() {
        let el = document.getElementById('github_token');
        if (el !== null) {
            el.focus();
        }
    }

    // tslint:disable-next-line:no-unused-variable
    private onHidden() {
        if (!this.gitHub.user.remember) {
            this.reset();
        }
    }

    // tslint:disable-next-line:no-unused-variable
    private mayLogin() {
        return (
            this.gitHub.ui.wizardStep === WIZARD_STEP.LOGIN &&
            this.gitHub.user.token.length > 0
        );
    }

    // tslint:disable-next-line:no-unused-variable
    private onLoginClicked() {
        function onError(error: any) {
            if (error.status === 401) {
                this.reset();
            } else {
                console.error(error.message);
            }
            this.gitHub.user.ui.hasError = true;
        }

        this.gitHub.ui.wizardStep = WIZARD_STEP.LOGGING_IN;
        setTimeout(() => {
            this.userService.setToken(this.gitHub.user.token);
            this.repoService.setToken(this.gitHub.user.token);

            this.userService.getUser().$observable.subscribe(
                (user: any) => {
                    this.gitHub.user.object = user;
                },
                (error: any) => { onError(error); }
            );

            this.userService.getRepos().$observable.subscribe(
                (repos: any[]) => {
                    this.gitHub.repos.objects = repos.sort((a: any, b: any) => {
                        if (a.full_name.toLowerCase() < b.full_name.toLowerCase()) return -1;
                        if (a.full_name.toLowerCase() > b.full_name.toLowerCase()) return 1;
                        return 0;
                    });
                    this.gitHub.ui.wizardStep = WIZARD_STEP.CHOOSE_FILE;
                },
                (error: any) => { onError(error); }
            );
        }, 0);
    }

    // tslint:disable-next-line:no-unused-variable
    private onRepoChanged(name: string) {
        let getRepoByName = (name: string): any => {
            return this.gitHub.repos.objects.find((repo: any) => {
                return repo.full_name === name;
            });
        };
        let repo = getRepoByName(name);

        this.resetBranches();
        this.resetFiles();

        this.gitHub.repos.current = repo;
        if (repo !== null) {
            this.gitHub.branches.ui.loading = true;
            this.repoService.getBranches({
                owner: this.gitHub.repos.current.owner.login,
                repo: this.gitHub.repos.current.name
            }).$observable.subscribe(
                (branches: any[]) => {
                    this.gitHub.branches.ui.loading = false;
                    this.gitHub.branches.objects = branches;
                }
            );
        }
    }

    // tslint:disable-next-line:no-unused-variable
    private onBranchChanged(name: string) {
        let getBranchByName = (name: string): any => {
            return this.gitHub.branches.objects.find((branch: any) => {
                return branch.name === name;
            });
        };

        let repo = this.gitHub.repos.current;
        let branch = this.gitHub.branches.selected = getBranchByName(name);

        this.resetFiles();

        if (repo !== null && branch !== null) {
            this.gitHub.files.rootSha = branch.commit.sha;
            this.fetchFiles(branch.commit.sha);
        }
    }

    private fetchFiles(sha: string) {
        this.gitHub.files.ui.loading = true;
        this.repoService.getTree({
            owner: this.gitHub.repos.current.owner.login,
            repo: this.gitHub.repos.current.name,
            sha: sha
        }).$observable.subscribe(
            (data: any) => {
                this.gitHub.files.ui.loading = false;
                this.gitHub.files.currentSha = sha;
                this.gitHub.files.objects = data.tree.sort((a: any, b: any) => {
                    // Directories first, then names.
                    if (a.type === b.type) {
                        if (a.path.toLowerCase() < b.path.toLowerCase()) return -1;
                        if (a.path.toLowerCase() > b.path.toLowerCase()) return 1;
                        return 0;
                    }

                    if (a.type === 'tree') return -1;
                    return 1;
                });
            }
        );

        return false;
    }

    // tslint:disable-next-line:no-unused-variable
    private onFileClicked(file: any) {
        if (file.type === 'tree') {
            this.fetchFiles(file.sha);
        } else {
            this.gitHub.files.selected = file;
        }

        return false;
    }


    // tslint:disable-next-line:no-unused-variable
    private onLogoutClicked() {
        this.resetUser();
        this.resetUI();
    }

    // tslint:disable-next-line:no-unused-variable
    private onDownloadClicked() {
        let repo = this.gitHub.repos.current;

        this.gitHub.ui.wizardStep = WIZARD_STEP.DOWNLOADING;
        this.repoService.getBlob({
            owner: repo.owner.login,
            repo: repo.name,
            sha: this.gitHub.files.selected.sha
        }).$observable.subscribe(
            (response: any) => {
                this.fileFetched.emit(atob(response.content));
                this.hide();
            }
        );
    }
}

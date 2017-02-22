// Core
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Output,
    ViewChild
} from '@angular/core';

import { GitHubService, WIZARD_STEP } from './github.service';
import { RepoService, UserService } from './github.api.services';


declare var $: any;


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
    private wizardStepEnum = WIZARD_STEP;

    // API

    public show() {
        let el = $('#github_remember_me');
        (el as any).bootstrapToggle().change(() => {
            this.gitHubService.data.user.remember = (el as any).prop('checked');
        });
        $(this.gitHubModal.nativeElement).modal('show');
    }

    public hide() {
        $(this.gitHubModal.nativeElement).modal('hide');
    }

    // Functions

    public constructor(
        private repoService: RepoService,
        private userService: UserService,
        private gitHubService: GitHubService) {
    }

    public ngAfterViewInit() {
        $(this.gitHubModal.nativeElement).on('shown.bs.modal', () => {
            this.onShown();
        });

        $(this.gitHubModal.nativeElement).on('hidden.bs.modal', () => {
            this.onHidden();
        });
    }

    private resetUI() {
        this.gitHubService.wizardStep = WIZARD_STEP.LOGIN;

        setTimeout(() => {
            let el = document.getElementById('github_remember_me');
            if (el !== null) {
                $(el).bootstrapToggle();
            }
        }, 0);
    }

    private resetUser() {
        this.gitHubService.data.user.token = '';
        this.gitHubService.data.user.remember = false;
        this.gitHubService.data.user.object = null;
        this.gitHubService.data.user.ui.hasError = false;
    }

    private resetGists() {
        this.gitHubService.data.gists.objects = [];
        this.gitHubService.data.gists.selected = null;
    }

    private resetRepos() {
        this.gitHubService.data.repos.objects = [];
        this.gitHubService.data.repos.selected = null;
        this.gitHubService.data.repos.current = null;
    }

    private resetBranches() {
        this.gitHubService.data.branches.objects = [];
        this.gitHubService.data.branches.selected = null;
        this.gitHubService.data.branches.ui.loading = false;
    }

    private resetFiles() {
        this.gitHubService.data.files.objects = [];
        this.gitHubService.data.files.currentSha = null;
        this.gitHubService.data.files.rootSha = null;
        this.gitHubService.data.files.ui.loading = false;
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
        if (!this.gitHubService.data.user.remember) {
            this.reset();
        }
    }

    // tslint:disable-next-line:no-unused-variable
    private mayLogin() {
        return (
            this.gitHubService.wizardStep === WIZARD_STEP.LOGIN &&
            this.gitHubService.data.user.token.length > 0
        );
    }

    // tslint:disable-next-line:no-unused-variable
    private onLoginClicked() {
        let onError = (error: any) => {
            if (error.status === 401) {
                this.reset();
            } else {
                console.error(error.message);
            }
            this.gitHubService.data.user.ui.hasError = true;
        };

        this.gitHubService.wizardStep = WIZARD_STEP.LOGGING_IN;
        setTimeout(() => {
            this.userService.setToken(this.gitHubService.data.user.token);
            this.repoService.setToken(this.gitHubService.data.user.token);

            this.userService.getUser().$observable.subscribe(
                (user: any) => {
                    this.gitHubService.data.user.object = user;

                    this.userService.getRepos().$observable.subscribe(
                        (repos: any[]) => {
                            this.gitHubService.data.repos.objects = repos.sort((a: any, b: any) => {
                                if (a.full_name.toLowerCase() < b.full_name.toLowerCase()) return -1;
                                if (a.full_name.toLowerCase() > b.full_name.toLowerCase()) return 1;
                                return 0;
                            });
                            this.gitHubService.wizardStep = WIZARD_STEP.CHOOSE_FILE;
                        },
                        (error: any) => { onError(error); }
                    );
                },
                (error: any) => { onError(error); }
            );
        }, 0);
    }

    // tslint:disable-next-line:no-unused-variable
    private onRepoChanged(name: string) {
        let getRepoByName = (name: string): any => {
            return this.gitHubService.data.repos.objects.find((repo: any) => {
                return repo.full_name === name;
            });
        };
        let repo = getRepoByName(name);

        this.resetBranches();
        this.resetFiles();

        this.gitHubService.data.repos.current = repo;
        if (repo !== null) {
            this.gitHubService.data.branches.ui.loading = true;
            this.repoService.getBranches({
                owner: this.gitHubService.data.repos.current.owner.login,
                repo: this.gitHubService.data.repos.current.name
            }).$observable.subscribe(
                (branches: any[]) => {
                    this.gitHubService.data.branches.ui.loading = false;
                    this.gitHubService.data.branches.objects = branches;
                }
            );
        }
    }

    // tslint:disable-next-line:no-unused-variable
    private onBranchChanged(name: string) {
        let getBranchByName = (name: string): any => {
            return this.gitHubService.data.branches.objects.find((branch: any) => {
                return branch.name === name;
            });
        };

        let repo = this.gitHubService.data.repos.current;
        let branch = this.gitHubService.data.branches.selected = getBranchByName(name);

        this.resetFiles();

        if (repo !== null && branch !== null) {
            this.gitHubService.data.files.rootSha = branch.commit.sha;
            this.fetchFiles(branch.commit.sha);
        }
    }

    private fetchFiles(sha: string) {
        this.gitHubService.data.files.ui.loading = true;
        this.repoService.getTree({
            owner: this.gitHubService.data.repos.current.owner.login,
            repo: this.gitHubService.data.repos.current.name,
            sha: sha
        }).$observable.subscribe(
            (data: any) => {
                this.gitHubService.data.files.ui.loading = false;
                this.gitHubService.data.files.currentSha = sha;
                this.gitHubService.data.files.objects = data.tree.sort((a: any, b: any) => {
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
            let repo = this.gitHubService.data.repos.current;

            this.gitHubService.wizardStep = WIZARD_STEP.DOWNLOADING;
            this.repoService.getBlob({
                owner: repo.owner.login,
                repo: repo.name,
                sha: file.sha
            }).$observable.subscribe(
                (response: any) => {
            this.gitHubService.wizardStep = WIZARD_STEP.DOWNLOADING;
                    this.fileFetched.emit(atob(response.content));
                    this.hide();
                    this.gitHubService.wizardStep = WIZARD_STEP.CHOOSE_FILE;
                }
            );

        }

        return false;
    }

    // tslint:disable-next-line:no-unused-variable
    private onLogoutClicked() {
        this.resetUser();
        this.resetUI();
    }
}

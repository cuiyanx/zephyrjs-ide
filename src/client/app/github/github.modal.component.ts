// Core
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';

// 3rd party
import { ModalDirective } from 'ng2-bootstrap/modal';

declare var $: any;

enum WIZARD_STEP {
    LOGIN,
    LOGGING_IN,
    CHOOSE_FILE,
    DOWNLOADING
}

interface Response {
    status: number;
    data: any;
};

interface Repository {
    __fullname: string;
};

@Component({
    moduleId: module.id,
    selector: 'github-modal',
    templateUrl: 'github.modal.component.html',
    styleUrls: ['github.modal.component.css']
})
export class GitHubModalComponent {
    @Output() fileFetched = new EventEmitter();

    // tslint:disable-next-line:no-unused-variable (used in template)
    public wizardStep = WIZARD_STEP;

    public gitHub: any = {
        api: {
            cls: null,
            ref: null,
        },

        ui: {
            wizardStep: WIZARD_STEP.LOGIN
        },

        user: {
            token: '',
            remember: false,
            object: null,
            profile: null,
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

    @ViewChild('gitHubModal')
    private gitHubModal: ModalDirective;

    public show() {
        let el = $('#github_remember_me');
        (el as any).bootstrapToggle().change(() => {
            this.gitHub.user.remember = (el as any).prop('checked');
        });
        this.gitHubModal.show();
    }

    public hide() {
        this.gitHubModal.hide();
    }

    // Functions

    public constructor() {
        System.import('github-api').then((GitHub: any) => {
            this.gitHub.api.cls = GitHub;
        });
    }

    // tslint:disable-next-line:no-unused-variable
    public onShown() {
        let el = document.getElementById('github_token');
        if (el !== null) {
            el.focus();
        }
    }

    // tslint:disable-next-line:no-unused-variable
    public onHidden() {
        if (!this.gitHub.user.remember) {
            this.reset();
        }
    }

    // tslint:disable-next-line:no-unused-variable
    public mayLogin() {
        return (
            this.gitHub.ui.wizardStep === WIZARD_STEP.LOGIN &&
            this.gitHub.user.token.length > 0
        );
    }

    // tslint:disable-next-line:no-unused-variable
    public onLoginClicked() {
        this.gitHub.ui.wizardStep = WIZARD_STEP.LOGGING_IN;
        setTimeout(() => {
            this.gitHub.api.ref = new this.gitHub.api.cls({
                token: this.gitHub.user.token
            });
            this.gitHub.user.object = this.gitHub.api.ref.getUser();
            this.gitHub.user.object.getProfile()
            .then((response: Response) => {
                this.gitHub.user.profile = response.data;
                this.gitHub.user.ui.hasError = false;

                this.gitHub.user.object.listRepos()
                .then((response: Response) => {
                    if (response.status === 200) {
                        this.gitHub.repos.objects = response.data.sort((a: any, b: any) => {
                            if (a.full_name.toLowerCase() < b.full_name.toLowerCase()) return -1;
                            if (a.full_name.toLowerCase() > b.full_name.toLowerCase()) return 1;
                            return 0;
                        }).map((repo: any) => {
                            return this.gitHub.api.ref.getRepo(repo.full_name);
                        });
                        this.gitHub.ui.wizardStep = WIZARD_STEP.CHOOSE_FILE;
                    }
                });
            })
            .catch((err: any) => {
                if (err.status === 401) {
                    this.reset();
                    this.gitHub.user.ui.hasError = true;
                } else {
                    console.error(err.message);
                }
            });
        }, 1);
    }

    // tslint:disable-next-line:no-unused-variable
    public onRepoChanged(name: string) {
        let getRepoByName = (name: string) => {
            return this.gitHub.repos.objects.find((repo: Repository) => {
                return repo.__fullname === name;
            });
        };
        let repo = getRepoByName(name);

        this.resetBranches();
        this.resetFiles();

        this.gitHub.repos.current = repo;
        if (repo !== null) {
            this.gitHub.branches.ui.loading = true;
            repo.listBranches().then((response: Response) => {
                if (response.status === 200) {
                    this.gitHub.branches.ui.loading = false;
                    this.gitHub.branches.objects = response.data;
                }
            });
        }
    }

    public fetchFiles(sha: string) {
        let repo = this.gitHub.repos.current;
        repo.getTree(sha).then((response: Response) => {
            this.gitHub.files.objects = response.data.tree.sort((a: any, b: any) => {
                // Directories first, then names.
                if (a.type === b.type) {
                    if (a.path.toLowerCase() < b.path.toLowerCase()) return -1;
                    if (a.path.toLowerCase() > b.path.toLowerCase()) return 1;
                    return 0;
                }

                if (a.type === 'tree') return -1;
                return 1;
            });
            this.gitHub.files.currentSha = sha;
            this.gitHub.files.ui.loading = false;
        });

        return false;
    }

    // tslint:disable-next-line:no-unused-variable
    public onBranchChanged(name: string) {
        let repo = this.gitHub.repos.current;

        this.resetFiles();

        if (repo.getBranch === undefined) {
            // GitHub API < 2.4
            repo.getBranch = (branch: string) => {
                let fullname = repo.__fullname;
                return repo._request(
                    'GET', `/repos/${fullname}/branches/${branch}`,
                    null, null);
            };
        }

        this.gitHub.files.ui.loading = true;
        repo.getBranch(name).then((response: Response) => {
            this.gitHub.files.rootSha = response.data.commit.sha;
            this.fetchFiles(response.data.commit.sha);
        });
    }

    // tslint:disable-next-line:no-unused-variable
    public onFileClicked(file: any) {
        if (file.type === 'tree') {
            this.fetchFiles(file.sha);
        } else {
            this.gitHub.files.selected = file;
        }

        return false;
    }


    // tslint:disable-next-line:no-unused-variable
    public onLogoutClicked() {
        this.resetUser();
        this.resetUI();
    }

    // tslint:disable-next-line:no-unused-variable
    public onDownloadClicked() {
        let repo = this.gitHub.repos.current;

        this.gitHub.ui.wizardStep = WIZARD_STEP.DOWNLOADING;
        repo.getBlob(this.gitHub.files.selected.sha)
        .then((response: Response) => {
            this.fileFetched.emit(response.data);
            this.hide();
        });
    }

    private resetUI() {
        this.gitHub.ui.wizardStep = WIZARD_STEP.LOGIN;
    }

    private resetUser() {
        this.gitHub.user.token = '';
        this.gitHub.user.remember = false;
        this.gitHub.user.object = null;
        this.gitHub.user.profile = null;
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
}

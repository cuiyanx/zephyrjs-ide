import { argv } from 'yargs';
import { join } from 'path';

import { SeedConfig } from './seed.config';

/**
 * This class extends the basic seed configuration, allowing for project specific overrides. A few examples can be found
 * below.
 */
export class ProjectConfig extends SeedConfig {
  APP_TITLE_HTML: string = '';
  PROJECT_TASKS_DIR = join(process.cwd(), this.TOOLS_DIR, 'tasks', 'project');
  GIT_REV: string = '';

  FONTS_DEST = `${this.APP_DEST}/fonts`;
  FONTS_SRC = [
      `${this.APP_SRC}/assets/fonts/**`,
      'node_modules/bootstrap/dist/fonts/**',
      'node_modules/font-awesome/fonts/**'
  ];

  // Monaco must be copied to the deployed up because it needs to be loaded
  // lazily.
  MONACO_DEST = `${this.APP_DEST}/libs/monaco`;
  MONACO_SRC = ['node_modules/monaco-editor/min/**/*'];

  constructor() {
    super();
    this.APP_TITLE = 'Zephyr.js IDE';
    this.APP_TITLE_HTML = 'Zephyr.js <strong>IDE</strong>';

    this.PORT = argv['port'] || 8000;
    this.PLUGIN_CONFIGS['browser-sync']['port'] = this.PORT;
    this.GIT_REV = this.getGitRev();

    /* Enable typeless compiler runs (faster) between typed compiler runs. */
    // this.TYPED_COMPILE_INTERVAL = 5;

    // Add `NPM` third-party libraries to be injected/bundled.
    this.NPM_DEPENDENCIES = [
      ...this.NPM_DEPENDENCIES,
      {src: 'jquery/dist/jquery.min.js', inject: 'libs'},
      {src: 'bootstrap/dist/js/bootstrap.min.js', inject: 'libs'},
      {src: 'bootstrap-toggle/js/bootstrap-toggle.min.js', inject: 'libs'},
      {src: 'requirejs/require.js', inject: 'libs'},

      {src: 'bootstrap/dist/css/bootstrap.min.css', inject: true}, // `true` injects into the css section
      {src: 'bootstrap/dist/css/bootstrap-theme.min.css', inject: true},
      {src: 'font-awesome/css/font-awesome.min.css', inject: true},
      {src: 'bootstrap-toggle/css/bootstrap-toggle.min.css', inject: true}
    ];

    // Add `local` third-party libraries to be injected/bundled.
    this.APP_ASSETS = [
      ...this.APP_ASSETS,
      // {src: `${this.APP_SRC}/your-path-to-lib/libs/jquery-ui.js`, inject: true, vendor: false}
      // {src: `${this.CSS_SRC}/path-to-lib/test-lib.css`, inject: true, vendor: false},
      {src: `${this.APP_SRC}/app/shared/webusb/ihex.js`, inject: true, vendor: false}
    ];

    this.addPackageBundles({
        name: 'ng2-resource-rest',
        path: 'node_modules/ng2-resource-rest/bundles/ng2-resource-rest.umd.js',
        packageMeta: {
            main: 'index.js',
            defaultExtension: 'js'
        }
    });

    /* Add to or override NPM module configurations: */
    // this.mergeObject(this.PLUGIN_CONFIGS['browser-sync'], { ghostMode: false });

    this.ENABLE_SCSS = true;
  }

  getGitRev() {
      let exec = require('sync-exec');
      let stdout = exec('git rev-parse --short HEAD').stdout;
      let rev = stdout.split('\n')[0];

      return rev;
  }
}

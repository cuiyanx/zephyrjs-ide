import { join } from 'path';
import { argv } from 'yargs';

import { SeedConfig } from './seed.config';
import { ExtendPackages } from './seed.config.interfaces';

/**
 * This class extends the basic seed configuration, allowing for project specific overrides. A few examples can be found
 * below.
 */
export class ProjectConfig extends SeedConfig {

  PROJECT_TASKS_DIR = join(process.cwd(), this.TOOLS_DIR, 'tasks', 'project');

  constructor() {
    super();
    this.APP_TITLE = 'Zephyr.js IDE';

    this.PORT = argv['port'] || 8000;
    this.PLUGIN_CONFIGS['browser-sync']['port'] = this.PORT;

    /* Enable typeless compiler runs (faster) between typed compiler runs. */
    // this.TYPED_COMPILE_INTERVAL = 5;

    // Add `NPM` third-party libraries to be injected/bundled.
    this.NPM_DEPENDENCIES = [
      ...this.NPM_DEPENDENCIES,
      {src: 'jquery/dist/jquery.min.js', inject: 'libs'},
      {src: 'bootstrap/dist/js/bootstrap.min.js', inject: 'libs'},
      {src: 'bootstrap-toggle/js/bootstrap-toggle.min.js', inject: 'libs'},

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
    ];

    // Add packages (e.g. ng2-translate)
    // let additionalPackages: ExtendPackages[] = [{
    //   name: 'ng2-translate',
    //   // Path to the package's bundle
    //   path: 'node_modules/ng2-translate/bundles/ng2-translate.umd.js'
    // }];
    //
    // this.addPackagesBundles(additionalPackages);

    let additionalPackages: ExtendPackages[] = [
        // required for dev build 
        {
            name:'ng2-bootstrap',
            path:'node_modules/ng2-bootstrap/bundles/ng2-bootstrap.umd.min.js'
        },

        // required for prod build
        {
            name:'ng2-bootstrap/*',
            path:'node_modules/ng2-bootstrap/bundles/ng2-bootstrap.umd.min.js'
        },

        // mandatory dependency for ng2-bootstrap datepicker 
        {
            name:'moment',
            path:'node_modules/moment',
            packageMeta:{
                main: 'moment.js',
                defaultExtension: 'js'
            }
        }
    ];
    this.addPackagesBundles(additionalPackages);

    /* Add to or override NPM module configurations: */
    // this.mergeObject(this.PLUGIN_CONFIGS['browser-sync'], { ghostMode: false });

    this.ENABLE_SCSS = true;
  }

}

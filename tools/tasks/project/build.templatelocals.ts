import * as gulp from 'gulp';
import * as gulpLoadPlugins from 'gulp-load-plugins';
import { join } from 'path';

import Config from '../../config';
import { TemplateLocalsBuilder } from '../../utils';

const plugins = <any>gulpLoadPlugins();

export = () => {
  let files = [
      { path: 'app/about/', name: 'about.component.html'},
      { path: 'app/shared/footer/', name: 'footer.component.html'}
  ];

  for (let file of files) {
      gulp.src(join(Config.APP_SRC, file.path, file.name))
        .pipe(plugins.template(new TemplateLocalsBuilder().wihtoutStringifiedEnvConfig().build()))
        .pipe(gulp.dest(join(Config.APP_DEST, file.path)));
  }
};

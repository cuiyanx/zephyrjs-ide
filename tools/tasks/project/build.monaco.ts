import * as gulp from 'gulp';
import Config from '../../config';

export = () => {
    return gulp.src(Config.MONACO_SRC)
               .pipe(gulp.dest(Config.MONACO_DEST));
};

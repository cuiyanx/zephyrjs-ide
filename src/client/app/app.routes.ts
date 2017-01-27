import { Routes } from '@angular/router';

import { AboutRoutes } from './pages/about/index';
import { EditorRoutes } from './editor/index';
import { HomeRoutes } from './home/index';

export const routes: Routes = [
  ...HomeRoutes,
  ...AboutRoutes,
  ...EditorRoutes
];

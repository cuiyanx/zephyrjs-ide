import { Routes } from '@angular/router';

import { HomeRoutes } from './pages/home/index';
import { AboutRoutes } from './pages/about/index';
import { EditorRoutes } from './pages/editor/index';

export const routes: Routes = [
  ...HomeRoutes,
  ...AboutRoutes,
  ...EditorRoutes
];

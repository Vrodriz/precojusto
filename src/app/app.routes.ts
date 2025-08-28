import { Routes } from '@angular/router';
import { PostListComponent } from './features/posts/pages/post-list/post-list';



export const routes: Routes = [
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  { path: 'posts', component: PostListComponent },
  { path: 'posts/:id', component: PostListComponent }, 
];


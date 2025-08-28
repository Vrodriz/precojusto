import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post';
import { PostDetailComponent } from '../post-detail/post-detail';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PostDetailComponent],
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.css'],
})
export class PostListComponent implements OnInit {
  posts$!: Observable<Post[]>;
  filteredPosts$!: Observable<Post[]>;
  paginatedPosts$!: Observable<Post[]>;

  private searchTerm$ = new BehaviorSubject<string>('');
  sortBy$ = new BehaviorSubject<string>('date');
  currentPage$ = new BehaviorSubject<number>(1);

  pageSize = 6;
  modalPostId: number | null = null;

  constructor(private postService: PostService, private router: Router) {}

  ngOnInit(): void {
    this.posts$ = this.postService.posts$;
    this.postService.getPosts().subscribe(); 
    this.posts$ = this.postService.getPosts();

    const filtered$ = combineLatest([this.posts$, this.searchTerm$, this.sortBy$]).pipe(
      map(([posts, searchTerm, sortBy]) => {
        let result = [...posts];

        if (searchTerm.trim()) {
          result = result.filter(
            (p) =>
              p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.body.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (sortBy === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortBy === 'status')
          result.sort((a, b) => (a.status || '').localeCompare(b.status || ''));

        return result;
      })
    );

    this.filteredPosts$ = filtered$;

    this.paginatedPosts$ = combineLatest([filtered$, this.currentPage$]).pipe(
      map(([posts, page]) => {
        const start = (page - 1) * this.pageSize;
        return posts.slice(start, start + this.pageSize);
      })
    );
  }

  deletePost(id: number) {
  const confirmed = confirm('Tem certeza que deseja excluir este post?');
  if (!confirmed) return;

  this.postService.deletePost(id).subscribe({
    next: () => {
      this.posts$ = this.posts$.pipe(
        map(posts => posts.filter((post: Post) => post.id !== id))
      );
    },
    error: (err) => {
      console.error('Erro ao excluir post:', err);
      alert('Não foi possível excluir o post. Tente novamente.');
    }
  });
}


  onSearch(term: string) {
    this.searchTerm$.next(term);
    this.currentPage$.next(1);
  }

  onSort(sort: string) {
    this.sortBy$.next(sort);
    this.currentPage$.next(1);
  }

  setPage(page: number) {
    this.currentPage$.next(page);
  }

  nextPage(totalPages: number) {
    const current = this.currentPage$.value;
    if (current < totalPages) this.setPage(current + 1);
  }

  prevPage() {
    const current = this.currentPage$.value;
    if (current > 1) this.setPage(current - 1);
  }

  viewPost(id: number) {
    this.modalPostId = id;
  }

  closeModal() {
    this.modalPostId = null;
  }

  totalPages(filteredLength: number): number {
    return Math.ceil(filteredLength / this.pageSize);
  }
}

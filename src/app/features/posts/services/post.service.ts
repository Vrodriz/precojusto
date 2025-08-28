import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { Post } from '../models/post';
import { Comment, CreateComment } from '../models/comment';

@Injectable({ providedIn: 'root' })
export class PostService {
  private apiUrl = 'https://jsonplaceholder.typicode.com';
  private postsCache$ = new BehaviorSubject<Post[]>([]);
  public readonly posts$ = this.postsCache$.asObservable();

  private commentsCache: { [postId: number]: BehaviorSubject<Comment[]> } = {};

  constructor(private http: HttpClient) {}

  // ------------------------------
  // Helpers
  // ------------------------------
  private enrichPost(p: Post): Post {
    return {
      ...p,
      date: (p as any).date ?? new Date().toISOString(),
      author: (p as any).author ?? `Usuário ${p.userId}`,
      company: (p as any).company ?? `Empresa ${p.userId}`,
      status: (p as any).status ?? 'Em andamento',
    } as Post;
  }

  private enrichMany(posts: Post[]): Post[] {
    return posts.map((p) => this.enrichPost(p));
  }

  // ------------------------------
  // POSTS
  // ------------------------------
  getPosts(): Observable<Post[]> {
    if (this.postsCache$.value.length > 0) {
      return this.postsCache$.asObservable();
    }

    return this.http.get<Post[]>(`${this.apiUrl}/posts`).pipe(
      map((posts) => this.enrichMany(posts)),
      tap((posts) => this.postsCache$.next(posts)),
      catchError((err) => {
        console.error('Erro ao carregar posts', err);
        this.postsCache$.next([]);
        return of([]);
      }),
      shareReplay(1)
    );
  }

  getPost(id: number): Observable<Post> {
    const cached = this.postsCache$.value.find((p) => p.id === id);
    if (cached) return of(cached);

    return this.http.get<Post>(`${this.apiUrl}/posts/${id}`).pipe(map((p) => this.enrichPost(p)));
  }

  createPost(post: Omit<Post, 'id'>): Observable<Post[]> {
    const tempId = Date.now();
    const optimisticPost: Post = this.enrichPost({ ...(post as Post), id: tempId });

    const oldPosts = [...this.postsCache$.value];
    this.postsCache$.next([optimisticPost, ...oldPosts]);

    return this.http.post<Post>(`${this.apiUrl}/posts`, post).pipe(
      tap((created) => {
        const updated = this.postsCache$.value.map((p) =>
          p.id === tempId
            ? this.enrichPost({
                ...p,
                ...created,
                id: created.id,
              } as Post)
            : p
        );
        this.postsCache$.next(updated);
      }),
      map(() => this.postsCache$.value),
      catchError((err) => {
        this.postsCache$.next(oldPosts);
        return throwError(() => err);
      })
    );
  }

  updatePost(id: number, changes: Partial<Post>): Observable<Post[]> {
    const oldPosts = [...this.postsCache$.value];

    const updatedPosts = oldPosts.map((p) =>
      p.id === id ? this.enrichPost({ ...p, ...changes } as Post) : p
    );

    this.postsCache$.next(updatedPosts);

    return this.http.put<Post>(`${this.apiUrl}/posts/${id}`, changes).pipe(
      tap((server) => {
        const finalPosts = this.postsCache$.value.map((p) =>
          p.id === id ? this.enrichPost({ ...p, ...server } as Post) : p
        );
        this.postsCache$.next(finalPosts);
      }),
      map(() => this.postsCache$.value),
      catchError((err) => {
        this.postsCache$.next(oldPosts);
        return throwError(() => err);
      })
    );
  }

  deletePost(id: number): Observable<Post[]> {
    const oldPosts = [...this.postsCache$.value];
    const updatedPosts = oldPosts.filter((p) => p.id !== id);

    this.postsCache$.next(updatedPosts);

    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`).pipe(
      map(() => this.postsCache$.value),
      catchError((err) => {
        this.postsCache$.next(oldPosts);
        return throwError(() => err);
      })
    );
  }

  // ------------------------------
  // COMMENTS
  // ------------------------------
  getComments(postId: number): Observable<Comment[]> {
    if (!this.commentsCache[postId]) {
      this.commentsCache[postId] = new BehaviorSubject<Comment[]>([]);

      this.http
        .get<Comment[]>(`${this.apiUrl}/posts/${postId}/comments`)
        .pipe(
          tap((comments) => this.commentsCache[postId].next(comments)),
          catchError((err) => {
            console.error(`Erro ao carregar comentários do post ${postId}`, err);
            return of([]);
          })
        )
        .subscribe();
    }
    return this.commentsCache[postId].asObservable();
  }

  addComment(postId: number, comment: CreateComment): Observable<Comment[]> {
    const optimisticComment: Comment = {
      id: Date.now(),
      postId,
      ...comment,
      userId: 0,
    };

    if (!this.commentsCache[postId]) {
      this.commentsCache[postId] = new BehaviorSubject<Comment[]>([]);
    }

    const oldComments = [...this.commentsCache[postId].value];
    this.commentsCache[postId].next([optimisticComment, ...oldComments]);

    return this.http.post<Comment>(`${this.apiUrl}/comments`, { postId, ...comment }).pipe(
      tap((created) => {
        const filtered = this.commentsCache[postId].value.filter(
          (c) => c.id !== optimisticComment.id
        );
        this.commentsCache[postId].next([created, ...filtered]);
      }),
      map(() => this.commentsCache[postId].value),
      catchError((err) => {
        this.commentsCache[postId].next(oldComments);
        return throwError(() => err);
      })
    );
  }

  deleteComment(postId: number, commentId: number): Observable<Comment[]> {
    if (!this.commentsCache[postId]) return of([]);

    const oldComments = [...this.commentsCache[postId].value];
    this.commentsCache[postId].next(oldComments.filter((c) => c.id !== commentId));

    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`).pipe(
      map(() => this.commentsCache[postId].value),
      catchError((err) => {
        this.commentsCache[postId].next(oldComments);
        return throwError(() => err);
      })
    );
  }
}

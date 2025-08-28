import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { Post } from '../models/post';
import { Comment, CreateComment } from '../models/comment';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'https://jsonplaceholder.typicode.com';

  // cache em memória
  private postsCache$ = new BehaviorSubject<Post[]>([]);
  private commentsCache: { [postId: number]: BehaviorSubject<Comment[]> } = {};

  constructor(private http: HttpClient) {}

  // ------------------------------
  // POSTS
  // ------------------------------
  getPosts(): Observable<Post[]> {
    if (this.postsCache$.value.length > 0) {
      return this.postsCache$.asObservable();
    }

    return this.http.get<Post[]>(`${this.apiUrl}/posts`).pipe(
      map((posts) =>
        posts.map((p) => ({
          ...p,
          date: new Date().toISOString(),
          author: `Usuário ${p.userId}`,
          company: `Empresa ${p.userId}`,
          status: 'Em andamento',
        }))
      ),
      tap((posts) => this.postsCache$.next(posts)),
      catchError((err) => {
        console.error('Erro ao carregar posts', err);
        return of([]);
      }),
      shareReplay(1)
    );
  }

  getPost(id: number): Observable<Post> {
    const cached = this.postsCache$.value.find((p) => p.id === id);
    if (cached) return of(cached);

    return this.http.get<Post>(`${this.apiUrl}/posts/${id}`).pipe(
      map((p) => ({
        ...p,
        date: new Date().toISOString(),
        author: `Usuário ${p.userId}`,
        company: `Empresa ${p.userId}`,
        status: 'Em andamento',
      }))
    );
  }

  // ------------------------------
  // COMMENTS
  // ------------------------------
  getComments(postId: number): Observable<Comment[]> {
    if (!this.commentsCache[postId]) {
      // Inicializa BehaviorSubject vazio
      this.commentsCache[postId] = new BehaviorSubject<Comment[]>([]);

      // Busca do servidor e atualiza BehaviorSubject
      this.http.get<Comment[]>(`${this.apiUrl}/posts/${postId}/comments`).pipe(
        tap((comments) => this.commentsCache[postId].next(comments)),
        catchError((err) => {
          console.error(`Erro ao carregar comentários do post ${postId}`, err);
          return of([]);
        })
      ).subscribe(); // apenas inicializa, sem múltiplos subscribe duplicados
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

    return this.http.post<Comment>(`${this.apiUrl}/posts/${postId}/comments`, comment).pipe(
      tap((created) => {
        // substitui o comentário otimista pelo criado no servidor
        const filtered = this.commentsCache[postId].value.filter(c => c.id !== optimisticComment.id);
        this.commentsCache[postId].next([created, ...filtered]);
      }),
      map(() => this.commentsCache[postId].value),
      catchError((err) => {
        // rollback em caso de erro
        this.commentsCache[postId].next(oldComments);
        return throwError(() => err);
      })
    );
  }

  deleteComment(postId: number, commentId: number): Observable<Comment[]> {
    if (!this.commentsCache[postId]) return of([]);

    const oldComments = [...this.commentsCache[postId].value];
    this.commentsCache[postId].next(oldComments.filter((c) => c.id !== commentId));

    return this.http.delete<void>(`${this.apiUrl}/posts/${postId}/comments/${commentId}`).pipe(
      map(() => this.commentsCache[postId].value),
      catchError((err) => {
        // rollback em caso de erro
        this.commentsCache[postId].next(oldComments);
        return throwError(() => err);
      })
    );
  }
}

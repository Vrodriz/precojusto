import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, map, delay } from 'rxjs/operators';
import { Post } from '../models/post';
import { Comment, CreateComment } from '../models/comment';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private postsSubject = new BehaviorSubject<Post[]>([]);
  posts$ = this.postsSubject.asObservable();

  
  private commentsCache = new Map<number, BehaviorSubject<Comment[]>>();

  constructor(private http: HttpClient) {}

  // ======================
  // POSTS
  // ======================

  loadPosts(): void {
    this.http.get<Post[]>('posts').pipe(
      tap(posts => this.postsSubject.next(posts))
    ).subscribe();
  }

  getPostById(id: number): Observable<Post | undefined> {
    return this.posts$.pipe(
      tap(posts => {
        if (!posts.length) {
          this.loadPosts();
        }
      }),
      map(posts => posts.find(p => p.id === id))
    );
  }

  createPost(newPost: Post): Observable<Post> {
    const current = this.postsSubject.value;
    const optimisticPost = { ...newPost, id: Date.now() }; 
    this.postsSubject.next([...current, optimisticPost]);

    return this.http.post<Post>('posts', newPost).pipe(
      tap(saved => {
        const updated = this.postsSubject.value.map(p =>
          p.id === optimisticPost.id ? saved : p
        );
        this.postsSubject.next(updated);
      })
    );
  }

  updatePost(post: Post): Observable<Post> {
    const current = this.postsSubject.value;
    const updatedPosts = current.map(p => (p.id === post.id ? post : p));
    this.postsSubject.next(updatedPosts);

    return this.http.put<Post>(`posts/${post.id}`, post);
  }

  deletePost(id: number): Observable<void> {
    const current = this.postsSubject.value;
    const filtered = current.filter(p => p.id !== id);
    this.postsSubject.next(filtered);

    return this.http.delete<void>(`posts/${id}`);
  }

  // ======================
  // COMENTÁRIOS
  // ======================

  getComments(postId: number): Observable<Comment[]> {
    if (!this.commentsCache.has(postId)) {
      const subject = new BehaviorSubject<Comment[]>([]);
      this.commentsCache.set(postId, subject);

      this.http.get<Comment[]>(`posts/${postId}/comments`).pipe(
        tap(comments => subject.next(comments))
      ).subscribe();
    }
    return this.commentsCache.get(postId)!.asObservable();
  }

  addComment(postId: number, comment: CreateComment): Observable<Comment> {
    const subject = this.commentsCache.get(postId)!;
    const current = subject.value;

    const optimisticComment: Comment = {
      ...comment,
      id: Date.now(),
      postId,
      userId: 0
    };
    subject.next([...current, optimisticComment]);

    return this.http.post<Comment>(`posts/${postId}/comments`, comment).pipe(
      tap(saved => {
        const updated = subject.value.map(c =>
          c.id === optimisticComment.id ? saved : c
        );
        subject.next(updated);
      })
    );
  }

  deleteComment(postId: number, commentId: number): Observable<void> {
    const subject = this.commentsCache.get(postId)!;
    const current = subject.value;

    subject.next(current.filter(c => c.id !== commentId));

    return this.http.delete<void>(`comments/${commentId}`);
  }

  updateComment(postId: number, comment: Comment): Observable<Comment> {
    const subject = this.commentsCache.get(postId)!;
    const current = subject.value;

    const updatedComments = current.map(c => (c.id === comment.id ? comment : c));
    subject.next(updatedComments);

    return of(comment).pipe(delay(500));
  }
}

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PostService } from '../../services/post.service';
import { Comment, CreateComment } from '../../models/comment';
import { Post } from '../../models/post';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.css'],
})
export class PostDetailComponent implements OnInit {
  @Input() postId!: number;
  @Output() close = new EventEmitter<void>();

  post$!: Observable<Post | undefined>;
  comments$!: Observable<Comment[]>;
  newCommentText = '';

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.post$ = this.postService.getPostById(this.postId);
    this.comments$ = this.postService.getComments(this.postId);
  }

  closeModal(): void {
    this.close.emit();
  }

  addComment(): void {
    const text = this.newCommentText.trim();
    if (!text) return;

    const comment: CreateComment = { body: text, name: 'Você', email: 'usuario@exemplo.com' };
    this.postService.addComment(this.postId, comment).subscribe(() => (this.newCommentText = ''));
  }

  editingCommentId: number | null = null;
  editingCommentText = '';

  startEdit(comment: Comment) {
    this.editingCommentId = comment.id;
    this.editingCommentText = comment.body;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editingCommentText = '';
  }

  saveEdit(comment: Comment) {
    const updated: Comment = { ...comment, body: this.editingCommentText };
    this.postService.updateComment(this.postId, updated).subscribe({
      next: () => this.cancelEdit(),
      error: (err) => {
        console.error('Erro ao editar comentário', err);
        alert('Não foi possível salvar a edição.');
      },
    });
  }

  deleteComment(commentId: number): void {
    this.postService.deleteComment(this.postId, commentId).subscribe();
  }
}

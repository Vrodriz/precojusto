import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-edit.html',
  styleUrls: ['./post-edit.css']
})
export class PostEditComponent implements OnInit {
  @Input() post!: Post;              
  @Output() close = new EventEmitter<void>();  
  @Output() saved = new EventEmitter<Post>(); 

  form!: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private postService: PostService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.post.title, [Validators.required, Validators.minLength(3)]],
      body: [this.post.body, [Validators.required, Validators.minLength(10)]],
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const updated: Post = {
      ...this.post,
      ...this.form.value
    };

    this.loading = true;
    this.postService.updatePost(updated).subscribe({
      next: (saved) => {
        this.saved.emit(saved);  
        this.close.emit();       
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao atualizar post', err);
        alert('Não foi possível salvar as alterações.');
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.close.emit();
  }
}

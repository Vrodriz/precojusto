import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditComponent } from './post-edit';

describe('PostEdit', () => {
  let component: PostEditComponent;
  let fixture: ComponentFixture<PostEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

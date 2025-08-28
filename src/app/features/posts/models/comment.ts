export interface Comment {
  id: number;
  postId: number;
  userId: number;
  name: string;
  email: string;
  body: string;
}

export type CreateComment = Omit<Comment, 'id' | 'postId' | 'userId'>;

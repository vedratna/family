export interface Post {
  id: string;
  familyId: string;
  authorPersonId: string;
  textContent: string;
  isSystemPost: boolean;
  createdAt: string;
}

export interface PostMedia {
  id: string;
  postId: string;
  s3Key: string;
  contentType: string;
  sizeBytes: number;
  orderIndex: number;
}

export interface Comment {
  id: string;
  postId: string;
  personId: string;
  textContent: string;
  createdAt: string;
}

export interface Reaction {
  postId: string;
  personId: string;
  emoji: string;
  createdAt: string;
}

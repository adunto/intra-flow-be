export interface SearchPostDto {
  type: Array<'AUTHOR' | 'TITLE' | 'CONTENT'>;
  item: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
}

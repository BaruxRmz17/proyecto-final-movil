export interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
}

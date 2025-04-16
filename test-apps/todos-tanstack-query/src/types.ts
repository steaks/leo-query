export interface TodoStore {
  filter: string;
  setFilter: (filter: string) => void;
}
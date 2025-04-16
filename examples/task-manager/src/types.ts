export interface User {
  id: string;
  name: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  name: string;
  status: string;
  ownerId?: string;
}

export interface UserInfo {
  id: string;
  name: string;
  teamId?: string;
  teamName?: string;
}

export interface TaskInfo {
  id: string;
  name: string;
  status: string;
  ownerId?: string;
  ownerName?: string;
  teamName?: string
  teamId?: string;
}
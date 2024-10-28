import {Task, TaskInfo, Team, User, UserInfo} from "./types";
import {TasksState} from "./App.tsx";

const db = {
  teams: [
    { id: '208f65e7-0984-4af0-b146-cecb70fd69ae', name: 'Frontend' },
    { id: '6b2f374e-8705-4df1-9a2e-05fd833c536a', name: 'Backend' },
    { id: '28ce2ed8-88ed-43e2-8432-5303c39ce8c9', name: 'Ops' }
  ] as Team[],
  users: [
    { id: '11526ecf-69d5-4144-9e83-a75e232803d4', teamId: '208f65e7-0984-4af0-b146-cecb70fd69ae', name: 'Bert' },
    { id: '973ef09d-7853-4664-8b17-f648373964a5', teamId: '6b2f374e-8705-4df1-9a2e-05fd833c536a', name: 'Ernie' },
    { id: '770c8997-f0bb-45b4-be88-db7e62201f24', teamId: '28ce2ed8-88ed-43e2-8432-5303c39ce8c9', name: 'Andrea' },
    { id: 'c8c93655-2dcc-417d-bb49-01218db58894', teamId: '28ce2ed8-88ed-43e2-8432-5303c39ce8c9', name: 'Sarah' },
    { id: '2264b5aa-836b-4ba4-84c4-0816572b52a1', teamId: '28ce2ed8-88ed-43e2-8432-5303c39ce8c9', name: 'Courtney' },
    { id: '42e769f0-7d4d-472b-b1fa-05ecf6a8ac02', teamId: '28ce2ed8-88ed-43e2-8432-5303c39ce8c9', name: 'Doug' },
  ] as User[],
  tasks: [
    { id: 'aa526ecf-69d5-4144-9e83-a75e232803d4', name: 'Build Histogram', ownerId: '11526ecf-69d5-4144-9e83-a75e232803d4', status: 'To Do' },
    { id: 'aa3ef09d-7853-4664-8b17-f648373964a5', name: 'Style Header', ownerId: '11526ecf-69d5-4144-9e83-a75e232803d4', status: 'To Do' },
    { id: 'aa0c8997-f0bb-45b4-be88-db7e62201f24', name: 'Build Calculations', ownerId: '973ef09d-7853-4664-8b17-f648373964a5', status: 'In Progress' },
    {
      id: 'bb126ecf-79d5-4244-9e83-a75e232803d5',
      name: 'Implement User Authentication',
      ownerId: '11526ecf-69d5-4144-9e83-a75e232803d4', // Bert
      status: 'To Do'
    },
    {
      id: 'bb3ef09d-7953-4664-8b17-f648373964b6',
      name: 'Setup Database Schema',
      ownerId: '973ef09d-7853-4664-8b17-f648373964a5', // Ernie
      status: 'In Progress'
    },
    {
      id: 'bb0c8997-f0cc-45b4-be88-db7e62201f35',
      name: 'Create CI/CD Pipeline',
      ownerId: '770c8997-f0bb-45b4-be88-db7e62201f24', // Andrea
      status: 'To Do'
    },
    {
      id: 'bb426ecf-89d5-4144-9e83-a75e232803d6',
      name: 'Optimize API Performance',
      ownerId: 'c8c93655-2dcc-417d-bb49-01218db58894', // Sarah
      status: 'In Progress'
    },
    {
      id: 'bb5ef09d-8953-4664-8b17-f648373964b7',
      name: 'Design New Landing Page',
      ownerId: '11526ecf-69d5-4144-9e83-a75e232803d4', // Bert
      status: 'To Do'
    },
    {
      id: 'bb6c8997-f0cc-45b4-be88-db7e62201f36',
      name: 'Integrate Payment Gateway',
      ownerId: '2264b5aa-836b-4ba4-84c4-0816572b52a1', // Courtney
      status: 'To Do'
    },
    {
      id: 'bb726ecf-99d5-4144-9e83-a75e232803d7',
      name: 'Configure Load Balancer',
      ownerId: '770c8997-f0bb-45b4-be88-db7e62201f24', // Andrea
      status: 'In Progress'
    },
    {
      id: 'bb8ef09d-9953-4664-8b17-f648373964b8',
      name: 'Setup Logging and Monitoring',
      ownerId: '42e769f0-7d4d-472b-b1fa-05ecf6a8ac02', // Doug
      status: 'To Do'
    },
    {
      id: 'bb9c8997-f0cc-45b4-be88-db7e62201f37',
      name: 'Migrate to New Cloud Provider',
      ownerId: 'c8c93655-2dcc-417d-bb49-01218db58894', // Sarah
      status: 'Done'
    },
    {
      id: 'bba126ecf-19d5-4144-9e83-a75e232803d8',
      name: 'Refactor Legacy Codebase',
      ownerId: '2264b5aa-836b-4ba4-84c4-0816572b52a1', // Courtney
      status: 'In Progress'
    }
  ] as Task[],
  statuses: [
    "To Do",
    "In Progress",
    "Done"
  ] as string[]
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const users = async (): Promise<UserInfo[]> => {
  await delay(500);
  const userInfo = db.users.map(u => {
    const team = db.teams.find(t => t.id === u.teamId);
    return {...u, teamName: team?.name};
  });
  return Promise.resolve(userInfo);
};

export const addUser = (get: () => TasksState, set: (s: Partial<TasksState>) =>  void) => async (): Promise<void> => {
  const u = get().newUser;
  set({newUser: null});
  if (u) {
    await delay(500);
    db.users.push(u);
  }
  return Promise.resolve();
};

export const updateUser = (get: () => TasksState, set: (s: Partial<TasksState>) =>  void) => async (): Promise<void> => {
  const u = get().updatedUser;
  set({updatedUser: null});
  if (u) {
    await delay(500);
    db.users.forEach(uu => {
      if (u.id === uu.id) {
        uu.name = u.name;
        uu.teamId = u.teamId;
      }
    });
  }
  return Promise.resolve();
};

export const removeUser = async (user: User): Promise<void> => {
  if (user) {
    await delay(500);
    db.users = db.users.filter(uu => user.id !== uu.id);
  }
  return Promise.resolve();
};

export const teams = async (): Promise<Team[]> => {
  await delay(500);
  return Promise.resolve(db.teams);
};

export const addTeam = (get: () => TasksState, set: (s: Partial<TasksState>) =>  void) => async (): Promise<void> => {
  const t = get().newTeam;
  set({newTeam: null});
  if (t) {
    await delay(500);
    db.teams.push(t);
  }
  return Promise.resolve();
};

export const updateTeam = (get: () => TasksState, set: (s: Partial<TasksState>) =>  void) => async (): Promise<void> => {
  const t = get().updatedTeam;
  set({updatedTeam: null});
  if (t) {
    await delay(500);
    db.teams.forEach(tt => {
      if (t.id === tt.id) {
        tt.name = t.name;
      }
    });
  }
  return Promise.resolve();
};

export const removeTeam = async (team: Team): Promise<void> => {
  if (team) {
    await delay(500);
    db.teams = db.teams.filter(tt => team.id !== tt.id);
  }
  return Promise.resolve();
};

export const tasks = async (): Promise<TaskInfo[]> => {
  await delay(500);
  const tasksInfo = db.tasks.map(t => {
    const user = db.users.find(u => t.ownerId === u.id);
    const team = db.teams.find(tt => user?.teamId === tt.id);
    return {...t, ownerName: user?.name, teamId: team?.id, teamName: team?.name};
  });
  return Promise.resolve(tasksInfo);
};

export const taskStatuses = async (): Promise<string[]> => {
  await delay(500);
  return Promise.resolve(db.statuses)
};

export const addTask = (get: () => TasksState, set: (s: Partial<TasksState>) =>  void) => async (): Promise<void> => {
  const t = get().newTask;
  set({newTask: null});
  if (t) {
    await delay(500);
    db.tasks.push(t);
  }
  return Promise.resolve();
};

export const updateTask = (get: () => TasksState, set: (s: Partial<TasksState>) => void) => async (): Promise<void> => {
  const t = get().updatedTask;
  set({updatedTask: null});
  if (t) {
    await delay(500);
    db.tasks.forEach(tt => {
      if (t.id === tt.id) {
        tt.name = t.name;
        tt.status = t.status;
        tt.ownerId = t.ownerId;
      }
    });
  }
  return Promise.resolve();
};

export const removeTask = async (task: Task): Promise<void> => {
  if (task) {
    await delay(500);
    db.tasks = db.tasks.filter(tt => task.id !== tt.id);
  }
  return Promise.resolve();
};

export const moveTask = async(task: Task, status: string): Promise<void> => {
  await delay(500);
  const t = db.tasks.find(t => t.id === task.id);
  if (t) {
    t.status = status;
  }
};
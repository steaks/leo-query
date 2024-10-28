import React, {Suspense} from "react";
import {UserInfo, Team, TaskInfo, User} from "./types";
import {
  AppBar,
  Box,
  Button,
  InputLabel, Link,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {Effect, Query} from "leo-query/types";
import {create} from "zustand";
import {
  addTask,
  addTeam,
  addUser, moveTask,
  removeTask,
  removeTeam,
  removeUser,
  tasks,
  taskStatuses,
  teams,
  updateTask,
  updateTeam,
  updateUser,
  users
} from "./db";
import {effect, query, hook, withoutSuspenseHook} from "leo-query";
import {DndProvider, useDrag, useDrop} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import "./App.css";

export interface TasksState {
  newUser: UserInfo | null;
  updatedUser: UserInfo | null;
  removedUser: UserInfo | null;
  setNewUser: (u: UserInfo | null) => void;
  setUpdatedUser: (u: UserInfo | null) => void;
  users: Query<TasksState, UserInfo[]>;
  addUser: Effect<TasksState>;
  updateUser: Effect<TasksState>;
  removeUser: Effect<TasksState, [User]>;

  newTeam: Team | null;
  updatedTeam: Team | null;
  removedTeam: Team | null;
  setNewTeam: (t: Team | null) => void;
  setUpdatedTeam: (t: Team | null) => void;
  teams: Query<TasksState, Team[]>;
  addTeam: Effect<TasksState>;
  updateTeam: Effect<TasksState>;
  removeTeam: Effect<TasksState, [Team]>;

  newTask: TaskInfo | null;
  updatedTask: TaskInfo | null;
  removedTask: TaskInfo | null;
  setNewTask: (t: TaskInfo | null) => void;
  setUpdatedTask: (t: TaskInfo | null) => void;
  tasks: Query<TasksState, TaskInfo[]>;
  taskStatuses: Query<TasksState, string[]>;
  addTask: Effect<TasksState>;
  updateTask: Effect<TasksState>;
  removeTask: Effect<TasksState, [TaskInfo]>;
  moveTask: Effect<TasksState, [TaskInfo, string]>;
  taskFilters: {userId: string | null, teamId: string | null};
  setTaskFilters: (taskFilters: {userId: string | null, teamId: string | null}) => void;

  tab: "users" | "teams",
  setTab: (t: "users" | "teams") => void;
}

const userChanges = (s: TasksState) => [s.addUser, s.updateUser, s.removeUser];
const existingUserChanges = (s: TasksState) => [s.updateUser, s.removeUser];
const teamChanges = (s: TasksState) => [s.addTeam, s.updateTeam, s.removeTeam];
const existingTeamChanges = (s: TasksState) => [s.updateTeam, s.removeTeam];
const taskChanges = (s: TasksState) => [s.addTask, s.updateTask, s.removeTask, s.moveTask];

const useTasksStore = create<TasksState>((set, get) => {
  return ({
    newUser: null,
    updatedUser: null,
    removedUser: null,
    users: query(users, userChanges),
    setNewUser: newUser => set({newUser}),
    setUpdatedUser: updatedUser => set({updatedUser}),
    addUser: effect(addUser(get, set)),
    updateUser: effect(updateUser(get, set)),
    removeUser: effect(removeUser),

    newTeam: null,
    updatedTeam: null,
    removedTeam: null,
    teams: query(teams, s => [...teamChanges(s), ...userChanges(s)]),
    setNewTeam: newTeam => set({newTeam}),
    setUpdatedTeam: updatedTeam => set({updatedTeam}),
    addTeam: effect(addTeam(get, set)),
    updateTeam: effect(updateTeam(get, set)),
    removeTeam: effect(removeTeam),

    newTask: null,
    updatedTask: null,
    removedTask: null,
    tasks: query(tasks, s => [...taskChanges(s), ...existingTeamChanges(s), ...existingUserChanges(s)]),
    setNewTask: newTask => set({newTask}),
    setUpdatedTask: updatedTask => set({updatedTask}),
    addTask: effect(addTask(get, set)),
    updateTask: effect(updateTask(get, set)),
    removeTask: effect(removeTask),
    taskStatuses: query(taskStatuses),
    moveTask: effect((task: TaskInfo, status: string) => {
      const tasks = get().tasks;
      const newValue = get().tasks.value?.map(t => t.id === task.id ? {...t, status} : t);
      const newTasks = {...tasks, value: newValue};
      set({tasks: newTasks});
      return moveTask(task, status);
    }),
    taskFilters: {userId: null, teamId: null},
    setTaskFilters: (taskFilters: {userId: string | null, teamId: string | null}) => set({taskFilters}),


    tab: "users",
    setTab: tab => set({tab}),
  });
});

const useTasksStoreAsync = hook(useTasksStore);
const useTasksStoreWithoutSuspense = withoutSuspenseHook(useTasksStore);

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const NewUserButton = () => {
  const teams = useTasksStoreAsync(s => s.teams);
  const defaultTeamId = teams[0].id;
  const [setNewUser] = useTasksStore(s => [s.setNewUser]);
  return (
    <>
      <Box mb={1}>
        <Button variant="contained" onClick={() => setNewUser({id: crypto.randomUUID(), name: "", teamId: defaultTeamId})}>+ New User</Button>
      </Box>
    </>
  );
};


const BrowseUsers = () => {
  const users = useTasksStoreWithoutSuspense(s => s.users);
  const [setUpdatedUser, removeUser] = useTasksStore(s => [
    s.setUpdatedUser,
    s.removeUser.trigger
  ]);

  const onRemove = (user: UserInfo) => {
    removeUser(user);
  };

  const rows = (users.value || []).map(u => ({...u, edit: u, remove: u}));
  const columns: GridColDef[] = [
    {field: "id", headerName: "ID"},
    {field: "name", headerName: "Name"},
    {field: "teamName", headerName: "Team"},
    {field: "edit", headerName: "Edit", renderCell: (p) => <Button variant="contained" onClick={() => setUpdatedUser(p.value)}>Edit</Button>},
    {field: "remove", headerName: "Remove", renderCell: (p) => <Button variant="contained" onClick={() => onRemove(p.value)}>Remove</Button>},
  ];

  if (users.isLoading && !users.value) {
    return <></>;
  }

  return (
    <DataGrid rows={rows} columns={columns}/>
  );
};

const AddUserForm = () => {
  const teams = useTasksStoreAsync(s => s.teams);
  const [newUser, setNewUser, add] = useTasksStore(s => [s.newUser, s.setNewUser, s.addUser.trigger]);

  const onTeamSelect = (e: SelectChangeEvent) => {
    const teamId = teams?.find(t => t.id === e.target.value)?.id;
    setNewUser({...newUser!, teamId});
  };

  if (!newUser) {
    return <></>;
  }

  return (
    <Box sx={modalStyle}>
      <Typography variant="h2">New User</Typography>
      <Box mt={1}>
        <InputLabel>Name</InputLabel>
        <TextField defaultValue={newUser?.name} onChange={e => setNewUser({...newUser, name: e.target.value})}/>
      </Box>
      <Box mt={1}>
        <InputLabel>Team</InputLabel>
        <Select variant="outlined" onChange={e => onTeamSelect(e)} value={newUser?.teamId} sx={{minWidth: 250}}>
          {teams?.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
        </Select>
      </Box>
      <Box mt={1} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={() => setNewUser(null)}>Cancel</Button>
        &nbsp;
        <Button variant="contained" onClick={add}>Save</Button>
      </Box>
    </Box>
  );
};

const AddUser = () => {
  const newUser = useTasksStore(s => s.newUser);
  return (
    <Modal open={Boolean(newUser)}>
      <Suspense>
        <AddUserForm/>
      </Suspense>
    </Modal>
  );
};

const EditUserForm = () => {
  const teams = useTasksStoreAsync(s => s.teams);
  const [updatedUser, setUpdatedUser, update] = useTasksStore(s => [s.updatedUser, s.setUpdatedUser, s.updateUser.trigger]);

  if (!updatedUser) {
    return <></>
  }

  const onTeamSelect = (e: SelectChangeEvent) => {
    const teamId = teams?.find(t => t.id === e.target.value)?.id;
    setUpdatedUser({...updatedUser, teamId});
  };

  return (
    <Box sx={modalStyle}>
      <Typography variant="h2">Edit User</Typography>
      <Box mt={1}>
        <InputLabel>Name: </InputLabel>
        <TextField onChange={e => setUpdatedUser({...updatedUser!, name: e.target.value})} placeholder={updatedUser.name}/>
      </Box>
      <Box mt={1}>
        <InputLabel>Team: </InputLabel>
        <Select variant="outlined" onChange={e => onTeamSelect(e)} value={updatedUser.teamId} sx={{minWidth: 250}}>
          {teams?.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
        </Select>
      </Box>
      <Box mt={1} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={() => setUpdatedUser(null)}>Cancel</Button>
        &nbsp;
        <Button variant="contained" onClick={update}>Save</Button>
      </Box>
    </Box>
  )
};

const EditUser = () => {
  const updatedUser = useTasksStore(s => s.updatedUser);
  return (
    <Modal open={Boolean(updatedUser)}>
      <Suspense>
        <EditUserForm/>
      </Suspense>
    </Modal>
  )
};

const AddTeam = () => {
  const [newTeam, setNewTeam, addTeam] = useTasksStore(s => [s.newTeam, s.setNewTeam, s.addTeam.trigger]);

  if (!newTeam) {
    return <></>;
  }

  return (
    <Modal open={true}>
      <Box sx={modalStyle}>
        <Typography variant="h2">New Team</Typography>
        <Box mt={1}>
          <InputLabel>Name: </InputLabel>
          <TextField defaultValue={newTeam?.name} onChange={e => setNewTeam({...newTeam!, name: e.target.value})}/>
        </Box>
        <Box mt={1} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={() => setNewTeam(null)}>Cancel</Button>
          &nbsp;
          <Button variant="contained" onClick={addTeam}>Save</Button>
        </Box>
      </Box>
    </Modal>
  );
};

const EditTeam = () => {
  const [updatedTeam, setUpdatedTeam, update] = useTasksStore(s => [s.updatedTeam, s.setUpdatedTeam, s.updateTeam.trigger]);

  if (!updatedTeam) {
    return <></>
  }

  return (
    <Modal open={true}>
      <Box sx={modalStyle}>
        <Typography variant="h2">Edit User</Typography>
        <Box mt={1}>
          <InputLabel>Name: </InputLabel>
          <TextField onChange={e => setUpdatedTeam({...updatedTeam!, name: e.target.value})}
                     placeholder={updatedTeam.name}/>
        </Box>
        <Box mt={1} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={() => setUpdatedTeam(null)}>Cancel</Button>
          &nbsp;
          <Button variant="contained" onClick={update}>Save</Button>
        </Box>
      </Box>
    </Modal>
  )
};

const NewTeamButton = () => {
  const [setNewTeam] = useTasksStore(s => [s.setNewTeam]);

  return (
    <Box mb={1}>
      <Button variant="contained" onClick={() => setNewTeam({id: crypto.randomUUID(), name: ""})}>+ New Team</Button>
    </Box>
  );
};

const BrowseTeams = () => {
  const teams = useTasksStoreWithoutSuspense(s => s.teams);
  const [setUpdatedTeam, remove] = useTasksStore(s => [s.setUpdatedTeam, s.removeTeam.trigger]);

  const onRemove = (team: Team) => {
    remove(team);
  };

  const rows = (teams.value || []).map(t => ({...t, edit: t, remove: t}));

  const columns: GridColDef[] = [
    {field: "id", headerName: "ID"},
    {field: "name", headerName: "Name"},
    {field: "edit", headerName: "Edit", renderCell: (p) => <Button variant="contained" onClick={() => setUpdatedTeam(p.value)}>Edit</Button>},
    {field: "remove", headerName: "Remove", renderCell: (p) => <Button variant="contained" onClick={() => onRemove(p.value)}>Remove</Button>},
  ];
  return (
    <DataGrid rows={rows} columns={columns}/>
  );
};

const Teams = () => {
  const setTab = useTasksStore(s => s.setTab);
  return (
    <>
      <Box mt={2} typography="h2">Teams&nbsp;<Link variant="caption" sx={switchButtonStyle} onClick={() => setTab("users")}>VIEW USERS</Link></Box>
      <NewTeamButton/>
      <BrowseTeams/>
      <AddTeam/>
      <EditTeam/>
    </>

  );
};

const switchButtonStyle = ({color: "#555555", textDecorationColor: "#555555", paddingBottom: "8px", cursor: "pointer"});

const Users = () => {
  const setTab = useTasksStore(s => s.setTab);
  return (
    <>
      <Box mt={2} typography="h2">Users&nbsp;<Link variant="caption" sx={switchButtonStyle} onClick={() => setTab("teams")}>VIEW TEAMS</Link></Box>
      <Suspense><NewUserButton/></Suspense>

      <BrowseUsers/>
      <AddUser/>
      <EditUser/>
    </>
  );
};

const AddTaskForm = () => {
  const users = useTasksStoreAsync(s => s.users);
  const [newTask, setNewTask, addTask] = useTasksStore(s => [s.newTask, s.setNewTask, s.addTask.trigger]);

  if (!newTask) {
    return <></>;
  }

  const onOwnerSelect = (e: SelectChangeEvent<unknown>) => {
    const ownerId = users?.find(u => u.id === e.target.value)?.id;
    setNewTask({...newTask, ownerId});
  };

  return (
    <Box sx={modalStyle}>
      <Typography variant="h2">New Task</Typography>
      <Box mt={1}>
        <InputLabel>Name: </InputLabel>
        <TextField defaultValue={newTask?.name} onChange={e => setNewTask({...newTask, name: e.target.value})}/>
      </Box>
      <Box mt={1}>
        <InputLabel>Status: </InputLabel>
        <TextField defaultValue={newTask?.status} onChange={e => setNewTask({...newTask, status: e.target.value})}/>
      </Box>
      <Box mt={1}>
        <InputLabel>Owner: </InputLabel>
        <Select variant="outlined" onChange={e => onOwnerSelect(e)} value={newTask.ownerId} sx={{minWidth: 250}}>
          {users?.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
        </Select>
      </Box>
      <Box mt={1} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={() => setNewTask(null)}>Cancel</Button>
        &nbsp;
        <Button variant="contained" onClick={addTask}>Save</Button>
      </Box>
    </Box>
  );
};

const AddTask = () => {
  const newTask = useTasksStore(s => s.newTask);
  return (
    <Modal open={Boolean(newTask)}>
      <Suspense>
        <AddTaskForm/>
      </Suspense>
    </Modal>
  );
};

const EditTaskForm = () => {
  const users = useTasksStoreAsync(s => s.users);
  const [updatedTask, setUpdatedTask, update] = useTasksStore(s => [s.updatedTask, s.setUpdatedTask, s.updateTask.trigger]);

  if (!updatedTask) {
    return <></>
  }

  const onOwnerSelect = (e: SelectChangeEvent<unknown>) => {
    const ownerId = users?.find(u => u.id === e.target.value)?.id;
    setUpdatedTask({...updatedTask, ownerId})
  };

  return (
    <Modal open={true}>
      <Box sx={modalStyle}>
        <Typography variant="h2">Edit Task</Typography>
        <Box mt={1}>
          <InputLabel>Name:</InputLabel>
          <TextField onChange={e => setUpdatedTask({...updatedTask!, name: e.target.value})} placeholder={updatedTask.name}/>
        </Box>
        <Box mt={1}>
          <InputLabel>Status:</InputLabel>
          <TextField onChange={e => setUpdatedTask({...updatedTask!, status: e.target.value})} placeholder={updatedTask.status}/>
        </Box>
        <Box mt={1}>
          <InputLabel>Owner:</InputLabel>
          <Select variant="outlined" onChange={e => onOwnerSelect(e)} value={updatedTask.ownerId} sx={{minWidth: 250}}>
            {users?.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
          </Select>
        </Box>
        <Box mt={1} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={() => setUpdatedTask(null)}>Cancel</Button>
          &nbsp;
          <Button variant="contained" onClick={update}>Save</Button>
        </Box>
      </Box>
    </Modal>
  )
};

const EditTask = () => {
  const updatedTask = useTasksStore(s => s.updatedTask);
  return (
    <Modal open={Boolean(updatedTask)}>
      <Suspense>
        <EditTaskForm/>
      </Suspense>
    </Modal>
  );
};

const TaskFilters = () => {
  const [taskFilters, setTaskFilters] = useTasksStore((s) => [s.taskFilters, s.setTaskFilters]);
  const users = useTasksStoreWithoutSuspense((s) => s.users); // Fetch users from Zustand store
  const teams = useTasksStoreWithoutSuspense((s) => s.teams); // Fetch teams from Zustand store

  const handleUserChange = (event: SelectChangeEvent) => {
    setTaskFilters({ ...taskFilters, userId: event.target.value === '' ? null : event.target.value });
  };

  const handleTeamChange = (event: SelectChangeEvent) => {
    setTaskFilters({ ...taskFilters, teamId: event.target.value === '' ? null : event.target.value });
  };

  return (
    <Box display="flex" gap={2} mb={2}>
      {/* User Filter */}
      <Box width={200}>
        <InputLabel>User</InputLabel>
        <Select
          value={taskFilters.userId || ''}
          onChange={handleUserChange}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">
            <em>All Users</em>
          </MenuItem>
          {(users.value || []).map(user => (
            <MenuItem key={user.id} value={user.id}>
              {user.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Team Filter */}
      <Box width={200}>
        <InputLabel>Team</InputLabel>
        <Select
          value={taskFilters.teamId || ''}
          onChange={handleTeamChange}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">
            <em>All Teams</em>
          </MenuItem>
          {(teams.value || []).map(team => (
            <MenuItem key={team.id} value={team.id}>
              {team.name}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
};

const TaskBoard = () => {
  const statuses = useTasksStoreWithoutSuspense(s => s.taskStatuses);
  const tasks = useTasksStoreWithoutSuspense(s => s.tasks);
  const taskFilters = useTasksStore(s => s.taskFilters);
  if (statuses.isLoading) {
    return <></>;
  }
  const t = (tasks.value || []).filter(t => {
    if (taskFilters.userId && t.ownerId !== taskFilters.userId) {
      return false;
    }
    if (taskFilters.teamId && t.teamId !== taskFilters.teamId) {
      return false;
    }
    return true

  });
  //todo: filter tasks using the filters
  return (
    <>
      <NewTaskButton/>
      <TaskFilters />
      <div className="board">{statuses.value.map(s => <BoardColumn key={s} status={s} tasks={t.filter(t => t.status === s)}/>)}</div>
    </>
  )

};
const BoardColumn = (p: { status: string, tasks: TaskInfo[]; }) => {
  const [moveTask] = useTasksStore(s => [s.moveTask.trigger]);
  const [,  ref] = useDrop(() => {
    return {
      accept: "TASK",
      drop: (task: TaskInfo) => {
        console.log("HERE");
        moveTask(task, p.status);
      }
    };
  });
  return (
    <div className="board-column" ref={ref} key={p.status}>
      <span>{p.status}</span>
      {p.tasks.map(t => <Task key={t.id} task={t} />)}
    </div>
  );
};

const Task = (p: {task: TaskInfo}) => {
  const setUpdatedTask = useTasksStore(s => s.setUpdatedTask);
  const [, ref] = useDrag(() => {
    return {
      type: "TASK",
      item: p.task
    };
  });
  return (
    <div className="task" ref={ref} key={p.task.id} onClick={() => setUpdatedTask(p.task)}>
      {p.task.name}
    </div>
  );
}

const NewTaskButton = () => {
  const setNewTask = useTasksStore(s => s.setNewTask);
  return (
    <Box mb={1}>
      <Button variant="contained" onClick={() => setNewTask({id: crypto.randomUUID(), name: "", status: "To Do"})}>+ New Task</Button>
    </Box>
  );
}

const Tasks = () => {
  return (
    <>
      <Box mt={2} typography="h2">Tasks</Box>
      <TaskBoard/>
      <AddTask/>
      <EditTask/>
    </>
  );
};

const App = () => {
  const tab = useTasksStore(s => s.tab)
  return (
    <DndProvider backend={HTML5Backend}>
      <AppBar>
        <Toolbar>
          <img src="https://leoquery.com/leo-without-background.png" alt="Logo" style={{height: 40, marginRight: 16}}/>
          <Typography variant="h6" component="div">
            TASKS APPLICATION
          </Typography>
        </Toolbar>
      </AppBar>
      <Box className="app" mt={8}>
        <Box display="flex" justifyContent="space-evenly">
          <Box width={850}>
            <Tasks/>
          </Box>
          <Box pl={8} width={600} height={800}>
            {tab === "users" && <Users/>}
            {tab === "teams" && <Teams/>}
          </Box>
        </Box>
      </Box>
    </DndProvider>
  );
};

export default App;
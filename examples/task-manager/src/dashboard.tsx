import React, {Suspense} from "react";
import {UserInfo, Team, TaskInfo} from "./types";
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
import {Effect, Query} from "./leo/types";
import {create} from "zustand";
import {
  addTask,
  addTeam,
  addUser,
  removeTask,
  removeTeam,
  removeUser,
  tasks,
  teams, updateTask,
  updateTeam,
  updateUser,
  users
} from "./db/db";
import {effect, query, subscribe} from "./leo";

export interface TasksState {
  newUser: UserInfo | null;
  updatedUser: UserInfo | null;
  removedUser: UserInfo | null;
  setNewUser: (u: UserInfo | null) => void;
  setUpdatedUser: (u: UserInfo | null) => void;
  setRemovedUser: (u: UserInfo | null) => void;
  users: Query<TasksState, UserInfo[]>;
  addUser: Effect<TasksState>;
  updateUser: Effect<TasksState>;
  removeUser: Effect<TasksState>;

  newTeam: Team | null;
  updatedTeam: Team | null;
  removedTeam: Team | null;
  setNewTeam: (t: Team | null) => void;
  setUpdatedTeam: (t: Team | null) => void;
  setRemovedTeam: (t: Team | null) => void;
  teams: Query<TasksState, Team[]>;
  addTeam: Effect<TasksState>;
  updateTeam: Effect<TasksState>;
  removeTeam: Effect<TasksState>;

  newTask: TaskInfo | null;
  updatedTask: TaskInfo | null;
  removedTask: TaskInfo | null;
  setNewTask: (t: TaskInfo | null) => void;
  setUpdatedTask: (t: TaskInfo | null) => void;
  setRemovedTask: (t: TaskInfo | null) => void;
  tasks: Query<TasksState, TaskInfo[]>;
  addTask: Effect<TasksState>;
  updateTask: Effect<TasksState>;
  removeTask: Effect<TasksState>;

  tab: "users" | "teams",
  setTab: (t: "users" | "teams") => void;
}

const userChanges = ["addUser", "updateUser", "removeUser"] as (keyof TasksState)[];
const existingUserChanges = ["updateUser", "removeUser"] as (keyof TasksState)[];
const teamChanges = ["addTeam", "updateTeam", "removeTeam"] as (keyof TasksState)[];
const existingTeamChanges = ["updateTeam", "removeTeam"] as (keyof TasksState)[];
const taskChanges = ["addTask", "updateTask", "removeTask"] as (keyof TasksState)[];

const useTasksStore = create<TasksState>((set, get, store) => {
  return ({
    newUser: null,
    updatedUser: null,
    removedUser: null,
    users: query(store, users, userChanges),
    setNewUser: newUser => set({newUser}),
    setUpdatedUser: updatedUser => set({updatedUser}),
    setRemovedUser: removedUser => set({removedUser}),
    addUser: effect(store, "addUser", addUser(get, set), []),
    updateUser: effect(store, "updateUser", updateUser(get, set), []),
    removeUser: effect(store, "removeUser", removeUser(get, set), []),

    newTeam: null,
    updatedTeam: null,
    removedTeam: null,
    teams: query(store, teams, [...teamChanges, ...userChanges]),
    setNewTeam: newTeam => set({newTeam}),
    setUpdatedTeam: updatedTeam => set({updatedTeam}),
    setRemovedTeam: removedTeam => set({removedTeam}),
    addTeam: effect(store, "addTeam", addTeam(get, set), []),
    updateTeam: effect(store, "updateTeam", updateTeam(get, set), []),
    removeTeam: effect(store, "removeTeam", removeTeam(get, set), []),

    newTask: null,
    updatedTask: null,
    removedTask: null,
    tasks: query(store, tasks, [...taskChanges, ...existingTeamChanges, ...existingUserChanges]),
    setNewTask: newTask => set({newTask}),
    setUpdatedTask: updatedTask => set({updatedTask}),
    setRemovedTask: removedTask => set({removedTask}),
    addTask: effect(store, "addTask", addTask(get, set), []),
    updateTask: effect(store, "updateTask", updateTask(get, set), []),
    removeTask: effect(store, "removeTask", removeTask(get, set), []),

    tab: "users",
    setTab: tab => set({tab}),
  });
});

const useTasksStoreAsync = subscribe(useTasksStore);

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
  const users = useTasksStoreAsync(s => s.users);
  const [setUpdatedUser, setRemovedUser, removeUser] = useTasksStore(s => [
    s.setUpdatedUser,
    s.setRemovedUser,
    s.removeUser.trigger
  ]);

  const onRemove = (user: UserInfo) => {
    setRemovedUser(user);
    removeUser();
  };

  const rows = (users || []).map(u => ({...u, edit: u, remove: u}));
  const columns: GridColDef[] = [
    {field: "id", headerName: "ID"},
    {field: "name", headerName: "Name"},
    {field: "teamName", headerName: "Team"},
    {field: "edit", headerName: "Edit", renderCell: (p) => <Button variant="contained" onClick={() => setUpdatedUser(p.value)}>Edit</Button>},
    {field: "remove", headerName: "Remove", renderCell: (p) => <Button variant="contained" onClick={() => onRemove(p.value)}>Remove</Button>},
  ];

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
  const teams = useTasksStoreAsync(s => s.teams);
  const [setRemovedTeam, setUpdatedTeam, remove] = useTasksStore(s => [s.setRemovedTeam, s.setUpdatedTeam, s.removeTeam.trigger]);

  const onRemove = (team: Team) => {
    setRemovedTeam(team);
    remove();
  };

  const rows = (teams || []).map(t => ({...t, edit: t, remove: t}));

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
      <Suspense fallback={<div>Loading...</div>}>
        <BrowseTeams/>
      </Suspense>
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

      <Suspense fallback={<div>Loading...</div>}>
        <BrowseUsers/>
      </Suspense>
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

const BrowseTasks = () => {
  const tasks = useTasksStoreAsync(s => s.tasks);
  const [setUpdatedTask, setRemovedTask, remove] = useTasksStore(s => [s.setUpdatedTask, s.setRemovedTask, s.removeTask.trigger]);

  const onRemove = (task: TaskInfo) => {
    setRemovedTask(task);
    remove();
  };

  const rows = (tasks || []).map(t => ({...t, edit: t, remove: t}));
  const columns: GridColDef[] = [
    {field: "id", headerName: "ID"},
    {field: "name", headerName: "Name", width: 200},
    {field: "ownerName", headerName: "Owner"},
    {field: "teamName", headerName: "Team"},
    {field: "status", headerName: "Status"},
    {field: "edit", headerName: "Edit", renderCell: (p) => <Button variant="contained" onClick={() => setUpdatedTask(p.value)}>Edit</Button>},
    {field: "remove", headerName: "Remove", renderCell: (p) => <Button variant="contained" onClick={() => onRemove(p.value)}>Remove</Button>},
  ];

  return (
    <Box height={800}>
      <DataGrid rows={rows} columns={columns} />
    </Box>
  );
};

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
      <NewTaskButton/>
      <Suspense fallback={<div>Loading...</div>}>
        <BrowseTasks/>
      </Suspense>
      <AddTask/>
      <EditTask/>
    </>
  );
};

const UI = () => {
  const tab = useTasksStore(s => s.tab)
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography variant="h6" component="div">
            TASKS APPLICATION
          </Typography>
        </Toolbar>
      </AppBar>
      <Box mt={8}>
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
    </>
  );
};

export default UI;
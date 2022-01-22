import {MobileDatePicker} from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterMoment";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import {
  Autocomplete,
  Checkbox,
  createFilterOptions,
  FormControlLabel,
  FormGroup,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {GetServerSideProps, NextPage} from "next";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {v4 as uuidv4} from "uuid";
import {ChoreMeAvatar} from "../../components/avatar";
import NormalButton from "../../components/button/NormalButton";
import {ChoreLayout} from "../../components/layout";
import {RecurrenceSelector} from "../../components/recurrence-selector";
import NormalTextInput from "../../components/text-input/normal-text-input";
import {useToast} from "../../hooks";
import {useCreateChoreMutation, useDeleteChoreMutation, useUpdateChoreMutation,} from "../../lib/api";
import dbConnect from "../../lib/db";
import {Chore, IChore, User} from "../../models";
import Recurrence, {IRecurrence} from "../../models/recurrence.model";
import {MongoDocument, Role} from "../../types";
import {RecurrenceType} from "../../types/enum";
import {UserVM} from "../../types/vm";
import {CreateChoreVM} from "../../types/vm/CreateChoreVM";

const filter = createFilterOptions<CreateChoreVM["chore"]>();

const initialState: CreateChoreVM = {
  chore: {
    id: uuidv4(),
    name: "",
    points: 0,
    assignedTo: [],
  },
  recurrence: {
    id: uuidv4(),
    type: RecurrenceType.None,
    repeat: [],
    startDate: new Date(),
  },
};
const Chores: NextPage<StaticProps> = ({users, chores, recurrences}) => {
  const router = useRouter();
  const session = useSession();
  const {id} = router.query;

  // Queries
  const [createChore, {isLoading}] = useCreateChoreMutation();
  const [updateChore, {isLoading: isUpdating}] = useUpdateChoreMutation();
  const [deleteChore, {isLoading: isDeleting}] = useDeleteChoreMutation();

  const {showToast} = useToast();
  const [state, setState] = useState<{ _id?: string } & CreateChoreVM>(
    initialState
  );
  const initialSelectedUsers = users.map((user) => ({
    ...user,
    isSelected: false,
  }));
  const [selectedUsers, setSelectedUsers] = useState(initialSelectedUsers);

  const mapExistingChoreToState = (id: string) => {
    const chore = chores.find((_chore) => _chore._id === id);
    if (chore) {
      const {_id, ...data} = chore;
      const recurrence = recurrences.find(
        (_recurrence) => _recurrence._id === chore.recurrence
      );

      setState({
        _id: chore._id,
        chore: {
          id: data.id,
          name: data.name,
          points: data.points,
          assignedTo: data.assignedTo,
        },
        recurrence: recurrence
          ? {
            id: recurrence.id,
            type: recurrence.type,
            repeat: recurrence.repeat,
            startDate: recurrence.startDate,
          }
          : {
            ...state.recurrence,
          },
      });

      setButtonVisibility((prevState) => {
        return {
          ...prevState,
          save: true,
          delete: true,
          new: false,
        };
      });
    }
  };

  useEffect(() => {
    if (id) {
      mapExistingChoreToState(id as string);
    }
  }, []);

  useEffect(() => {
    setSelectedUsers((preState) =>
      preState.map((user) => {
        user.isSelected = state.chore.assignedTo.includes(user._id);
        return user;
      })
    );
  }, [state]);

  const [buttonVisibility, setButtonVisibility] = useState({
    new: false,
    save: false,
    cancel: true,
    delete: false,
  });

  function resetAllState() {
    initialState.chore.id = uuidv4();
    initialState.recurrence.id = uuidv4();
    setState(initialState);
    setSelectedUsers(initialSelectedUsers);
  }

  const onTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    if (event.target.name === "chore-amount") {
      const points = isNaN(parseFloat(event.target.value))
        ? 0
        : parseFloat(event.target.value);
      setState((prevState) => ({
        ...prevState,
        chore: {...prevState.chore, points: points},
      }));
    }
  };

  const handleChange = (event: SelectChangeEvent<RecurrenceType>) => {
    const value = event.target.value as RecurrenceType;
    setState((prevState) => {
      const recurrence = prevState.recurrence
        ? {
          id: prevState.recurrence.id,
          type: value,
          repeat: prevState.recurrence.repeat,
          startDate: prevState.recurrence.startDate,
        }
        : {
          id: uuidv4(),
          type: RecurrenceType.None,
          repeat: [],
          startDate: new Date(),
        };
      return {
        ...prevState,
        recurrence,
      };
    });
  };

  return (
    <ChoreLayout
      title={"Chore"}
      isLoading={isLoading || isUpdating || isDeleting}
      avatar={<ChoreMeAvatar name={session.data?.user?.name ?? "Unknow"}/>}
    >
      <Stack spacing={2}>
        <Autocomplete
          value={state.chore}
          onChange={(event, newValue) => {
            const regex = /Add "([^"]*)"/gm;

            if (typeof newValue === "string") {
            } else if (newValue && newValue.name) {
              if (regex.test(newValue.name)) {
                const _name = newValue.name
                  .match(regex)![0]
                  .replace(regex, "$1");
                setState((prevState) => {
                  return {
                    ...prevState,
                    chore: {
                      ...prevState.chore,
                      name: _name,
                      id: newValue.id,
                    },
                  };
                });
                setButtonVisibility({
                  ...buttonVisibility,
                  new: true,
                  save: false,
                });
              } else {
                const chore = chores.find(
                  (_chore) => _chore.name === newValue.name
                );
                if (chore) {
                  mapExistingChoreToState(chore._id);
                }
              }
            }
          }}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            const {inputValue} = params;
            // Suggest the creation of a new value
            const isExisting = options.some(
              (option) => inputValue === option.name
            );
            if (inputValue !== "" && !isExisting) {
              filtered.push({
                ...state.chore,
                id: uuidv4(),
                name: `Add "${inputValue}"`,
              });
            }

            return filtered;
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          id="select-chore"
          options={chores}
          getOptionLabel={(option) => {
            // Value selected with enter, right from the input
            if (typeof option === "string") {
              return option;
            }
            return option.name;
          }}
          renderOption={(props, option) => <li {...props}>{option.name}</li>}
          freeSolo
          renderInput={(params) => (
            <NormalTextInput
              value={state.chore.name}
              label="Search or add chore name "
              color="primary"
              name="chore"
              type="text"
              onChange={onTextChanged}
              {...params}
            />
          )}
        />
        <NormalTextInput
          label="Amount"
          color="primary"
          name="chore-amount"
          type="number"
          value={state.chore.points !== 0 ? state.chore.points : undefined}
          focused={state.chore.points !== 0}
          onChange={onTextChanged}
        />
        <Stack direction={"row"} justifyContent={"space-between"}>
          <FormGroup>
            {selectedUsers.map((user) => (
              <FormControlLabel
                key={user.id}
                onChange={(_, checked) => {
                  if (checked) {
                    setState((prevState) => {
                      return {
                        ...prevState,
                        chore: {
                          ...prevState.chore,
                          assignedTo: [...prevState.chore.assignedTo, user._id],
                        },
                      };
                    });
                  } else {
                    setState((prevState) => {
                      return {
                        ...prevState,
                        chore: {
                          ...prevState.chore,
                          assignedTo: prevState.chore.assignedTo.filter(
                            (id) => id !== user._id
                          ),
                        },
                      };
                    });
                  }
                }}
                control={<Checkbox checked={user.isSelected}/>}
                label={`${user.firstName} ${user.lastName}`}
              />
            ))}
          </FormGroup>
        </Stack>
        <RecurrenceSelector
          recurrence={state.recurrence}
          onRecurrenceChange={(value) => {
            setState((prevState) => {
              const recurrence = prevState.recurrence
                ? {
                  ...prevState.recurrence,
                  type: value.type,
                  repeat: value.repeat,
                }
                : {
                  id: uuidv4(),
                  type: value.type,
                  repeat: value.repeat,
                  startDate: new Date(),
                };

              return {
                ...prevState,
                recurrence,
              };
            });
          }}
        />

        <Stack>
          <LocalizationProvider dateAdapter={DateAdapter}>
            {" "}
            <MobileDatePicker
              renderInput={(props) => <TextField {...props} />}
              label="Start Date"
              value={state.recurrence?.startDate}
              onChange={(newValue) => {
                setState((prevState) => {
                  const recurrence = prevState.recurrence
                    ? {
                      ...prevState.recurrence,
                      startDate: newValue!,
                    }
                    : {
                      id: uuidv4(),
                      type: RecurrenceType.None,
                      repeat: [],
                      startDate: newValue!,
                    };
                  return {
                    ...prevState,
                    recurrence,
                  };
                });
              }}
            />
          </LocalizationProvider>
        </Stack>
        <Stack flexDirection={"row"}>
          <NormalButton
            disabled={!buttonVisibility.save}
            variant="contained"
            color="primary"
            sx={{flex: 1}}
            onClick={() => {
              const {_id, ...data} = state;
              _id &&
              updateChore({_id, ...data})
                .unwrap()
                .then(() => {
                  resetAllState();
                  showToast("Chore updated successfully", "success");
                  router.reload();
                })
                .catch((error) => {
                  showToast(error.data.message, "error");
                });
            }}
          >
            <Typography variant="button">Save</Typography>
          </NormalButton>
          <NormalButton
            disabled={!buttonVisibility.cancel}
            variant="contained"
            color="primary"
            sx={{flex: 1}}
            onClick={() => router.replace("/parent/assigned-chores")}
          >
            <Typography variant="button">Cancel</Typography>
          </NormalButton>
        </Stack>
        <Stack flexDirection={"row"}>
          <NormalButton
            disabled={!buttonVisibility.new}
            variant="contained"
            color="primary"
            sx={{flex: 1}}
            onClick={() => {
              const {_id: _, ...data} = state;
              createChore(data)
                .unwrap()
                .then(() => {
                  resetAllState();
                  showToast("Chore created successfully", "success");
                  router.reload();
                })
                .catch((error) => {
                  showToast(error.data.message, "error");
                });
            }}
          >
            <Typography variant="button">New</Typography>
          </NormalButton>
          <NormalButton
            disabled={!buttonVisibility.delete}
            variant="contained"
            color="primary"
            sx={{flex: 1}}
            onClick={() => {
              const {_id} = state;
              _id &&
              deleteChore({_id})
                .unwrap()
                .then(() => {
                  resetAllState();
                  showToast("Chore deleted successfully", "success");
                  router.reload();
                })
                .catch((error) => {
                  showToast(error.data.message, "error");
                })
            }}
          >
            <Typography variant="button">Delete</Typography>
          </NormalButton>
        </Stack>
      </Stack>
    </ChoreLayout>
  );
};

export default Chores;
type StaticProps = {
  users: MongoDocument<UserVM>[];
  chores: MongoDocument<IChore>[];
  recurrences: MongoDocument<IRecurrence>[];
};

export const getServerSideProps: GetServerSideProps<StaticProps> = async (
  context
) => {
  await dbConnect();
  //Check existing
  const users = (await User.find({role: {$eq: Role.CHILDREN}}).exec()).map(
    (doc) => {
      const json = doc.toJSON<MongoDocument<UserVM>>();

      return JSON.parse(JSON.stringify(json));
    }
  );
  const chores = (await Chore.find({}).exec()).map((doc) =>
    JSON.parse(JSON.stringify(doc.toJSON<MongoDocument<IChore>>()))
  );

  const recurrences = (await Recurrence.find({}).exec()).map((doc) =>
    JSON.parse(JSON.stringify(doc.toJSON<MongoDocument<IRecurrence>>()))
  );

  return {
    props: {
      users,
      chores,
      recurrences,
    },
  };
};

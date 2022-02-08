import { useEffect, useReducer } from "react";
import { db } from "firebase.js";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "contexts/AuthContext";

const ACTIONS = {
  SELECT_FOLDER: "SELECT_FOLDER",
  UPDATE_FOLDER: "UPDATE_FOLDER",
  SET_CHILD_FOLDERS: "SET_CHILD_FOLDERS",
  SET_CHILD_FILES: "SET_CHILD_FILES",
};

// path = things before this folder, since it is root,
// there is nothing before the root
export const ROOT_FOLDER = { name: "Root", id: null, path: [] };

const reducer = (state, { type, payload }) => {
  switch (type) {
    case ACTIONS.SELECT_FOLDER:
      return {
        folderId: payload.folderId,
        folder: payload.folder,
        childFolders: [],
        childFiles: [],
      };
    case ACTIONS.UPDATE_FOLDER:
      return { ...state, folder: payload.folder };
    case ACTIONS.SET_CHILD_FOLDERS:
      return { ...state, childFolders: payload.childFolders };
    case ACTIONS.SET_CHILD_FILES:
      return { ...state, childFiles: payload.childFiles };
    default:
      return state;
  }
};

export const useFolder = (folderId = null, folder = null) => {
  const [state, dispatch] = useReducer(reducer, {
    folderId,
    folder,
    childFolders: [],
    childFiles: [],
  });

  const { currentUser } = useAuth();

  useEffect(() => {
    dispatch({ type: ACTIONS.SELECT_FOLDER, payload: { folderId, folder } });
  }, [folderId, folder]);

  useEffect(() => {
    // Root folder (which actually doesn't exist)
    if (folderId === null) {
      return dispatch({
        type: ACTIONS.UPDATE_FOLDER,
        payload: { folder: ROOT_FOLDER },
      });
    }

    const fetchDoc = async () => {
      const docRef = doc(db.folders, folderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return dispatch({
          type: ACTIONS.UPDATE_FOLDER,
          payload: { folder: db.formatDocSnap(docSnap) },
        });
      } else {
        console.log("No such document");
        return dispatch({
          type: ACTIONS.UPDATE_FOLDER,
          payload: { folder: ROOT_FOLDER },
        });
      }
    };

    fetchDoc();
  }, [folderId]);

  useEffect(() => {
    const fetchChildDoc = async () => {
      const q = db.getChildFoldersQuery(db.folders, folderId, currentUser);
      return onSnapshot(q, querySnapshot => {
        dispatch({
          type: ACTIONS.SET_CHILD_FOLDERS,
          payload: { childFolders: querySnapshot.docs.map(db.formatDocSnap) },
        });
      });
    };
    const cleanup = fetchChildDoc();
    return cleanup;
  }, [folderId, currentUser]);

  useEffect(() => {
    const fetchChildFiles = async () => {
      const q = db.getChildFilesQuery(db.files, folderId, currentUser);
      return onSnapshot(q, querySnapshot => {
        dispatch({
          type: ACTIONS.SET_CHILD_FILES,
          payload: { childFiles: querySnapshot.docs.map(db.formatDocSnap) },
        });
      });
    };
    const cleanup = fetchChildFiles();
    return cleanup;
  }, [folderId, currentUser]);

  return state;
};

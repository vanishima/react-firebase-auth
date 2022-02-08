import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidV4 } from "uuid";
import { storage, db } from "firebase.js";
import { addDoc, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "contexts/AuthContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ROOT_FOLDER } from "components/hooks/useFolder";
import { ProgressBar, Toast } from "react-bootstrap";

const AddFileButton = ({ currentFolder }) => {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const { currentUser } = useAuth();

  const handleUpload = e => {
    const file = e.target.files[0];
    if (currentFolder === null || file == null) return;
    const id = uuidV4();
    setUploadingFiles([
      ...uploadingFiles,
      { id: id, name: file.name, progress: 0, error: false },
    ]);

    const parentPath =
      currentFolder.path.length > 0
        ? `${currentFolder.path.map(p => p.name).join("/")}`
        : "";
    const filePath =
      currentFolder === ROOT_FOLDER
        ? `${parentPath}/${file.name}`
        : `${parentPath}/${currentFolder.name}/${file.name}`;
    console.log("filePath", filePath);
    const storageRef = ref(storage, `files/${currentUser.uid}/${filePath}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      snapshot => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        setUploadingFiles(prevUploadingFiles => {
          return prevUploadingFiles.map(uploadFile => {
            if (uploadFile.id === id) {
              return { ...uploadFile, progress: progress };
            }
            return uploadFile;
          });
        });
      },
      error => {
        setUploadingFiles(prevUploadingFiles => {
          return prevUploadingFiles.map(uploadFile => {
            if (uploadFile.id === id) {
              return { ...uploadFile, error: true };
            }
            return uploadFile;
          });
        });
      },
      () => {
        setUploadingFiles(prevUploadingFiles => {
          return prevUploadingFiles.filter(uploadFile => {
            return uploadFile.id !== id;
          });
        });
        getDownloadURL(uploadTask.snapshot.ref).then(async downloadURL => {
          const q = db.getFileQuery(
            db.files,
            currentFolder.id,
            file.name,
            currentUser
          );
          onSnapshot(q, async querySnapshot => {
            if (querySnapshot) {
              // update the url of existing file
              const fileId = db.formatDocSnap(querySnapshot.docs[0]).id;
              const docRef = doc(db.files, fileId);
              await updateDoc(docRef, { url: downloadURL });
              console.log("updated url to", downloadURL);
            } else {
              console.log("File available at", downloadURL);
              await addDoc(db.files, {
                url: downloadURL,
                name: file.name,
                createdAt: db.getCurrentTimestamp(),
                folderId: currentFolder.id,
                userId: currentUser.uid,
              });
            }
          });
        });
      }
    );
  };

  return (
    <>
      <label className="btn btn-outline-success btn-sm m-0 mr-2">
        <FontAwesomeIcon icon={faFileUpload} />
        <input
          type="file"
          onChange={handleUpload}
          style={{ opacity: 0, position: "absolution", left: "-9999999px" }}
        />
      </label>
      {uploadingFiles.length > 0 &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
              maxWidth: "250px",
            }}
          >
            {uploadingFiles.map(file => (
              <Toast
                key={file.id}
                onClose={() => {
                  setUploadingFiles(prevUploadingFiles => {
                    return prevUploadingFiles.filter(uploadFile => {
                      return uploadFile.id !== file.id;
                    });
                  });
                }}
              >
                <Toast.Header
                  closeButton={file.error}
                  className="text-truncate w-100 d-block"
                >
                  {file.name}
                </Toast.Header>
                <Toast.Body>
                  <ProgressBar
                    animated={!file.error}
                    variant={file.error ? "danger" : "primary"}
                    now={file.error ? 100 : file.progress * 100}
                    label={
                      file.error
                        ? "Error"
                        : `${Math.round(file.progress * 100)}%`
                    }
                  />
                </Toast.Body>
              </Toast>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default AddFileButton;

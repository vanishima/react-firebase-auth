import React from "react";
import { Container } from "react-bootstrap";

import Navbar from "components/google-drive/Navbar";
import AddFolderButton from "components/google-drive/AddFolderButton";
import AddFileButton from "components/google-drive/AddFileButton";
import Folder from "components/google-drive/Folder";
import File from "components/google-drive/File";
import FolderBreadcrumbs from "components/google-drive/FolderBreadcrumbs";

import { useFolder } from "components/hooks/useFolder";
import { useParams, useLocation } from "react-router-dom";

const Dashboard = () => {
  const { folderId } = useParams();
  const { state = {} } = useLocation();
  //   console.log("state from useLocation", state);
  const { folder, childFolders, childFiles } = useFolder(
    folderId,
    state ? state.folder : null
  );

  return (
    <>
      <Navbar />
      <Container fluid>
        <div className="d-flex align-items-center mt-2">
          <FolderBreadcrumbs currentFolder={folder} />
          <AddFileButton currentFolder={folder} />
          <AddFolderButton currentFolder={folder} />
        </div>
        {childFolders.length > 0 && (
          <div className="d-flex flex-wrap">
            {childFolders.map(childFolder => (
              <div
                key={childFolder.id}
                style={{ maxWidth: "250px" }}
                className="p-2"
              >
                <Folder folder={childFolder} />
              </div>
            ))}
          </div>
        )}
        {childFolders.length > 0 && childFiles.length > 0 && <hr />}
        {childFiles.length > 0 && (
          <div className="d-flex flex-wrap">
            {childFiles.map(childFile => (
              <div
                key={childFile.id}
                style={{ maxWidth: "250px" }}
                className="p-2"
              >
                <File file={childFile} />
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
};

export default Dashboard;

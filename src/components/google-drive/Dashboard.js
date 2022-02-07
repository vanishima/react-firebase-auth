import React from "react";
import { Container } from "react-bootstrap";

import Navbar from "components/google-drive/Navbar";
import AddFolderButton from "components/google-drive/AddFolderButton";
import Folder from "components/google-drive/Folder";

import { useFolder } from "components/hooks/useFolder";

const Dashboard = () => {
  const { folder, childFolders } = useFolder("dL48fwGFPWECt4bcZVXy");
  console.log(folder);

  return (
    <>
      <Navbar />
      <Container fluid>
        <AddFolderButton currentFolder={folder} />
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
      </Container>
    </>
  );
};

export default Dashboard;

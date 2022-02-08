import React from "react";
import { Breadcrumb } from "react-bootstrap";
import { Link } from "react-router-dom";

import { ROOT_FOLDER } from "components/hooks/useFolder";

const FolderBreadcrumbs = ({ currentFolder }) => {
  let path = currentFolder === ROOT_FOLDER ? [] : [ROOT_FOLDER];

  // if not in root folder, add all elements in path
  if (currentFolder) {
    path = [...path, ...currentFolder.path];
  }

  return (
    <Breadcrumb
      className="flex-grow-1"
      listProps={{ className: "bg-white pl-0 m-0" }}
    >
      {path.map((folder, index) => {
        const state = { ...folder, path: path.slice(1, index) };
        return (
          <Breadcrumb.Item
            key={folder.id}
            linkAs={Link}
            linkProps={{
              to: {
                pathname: folder.id ? `/folder/${folder.id}` : "/",
              },
              state: { folder: state },
            }}
            className="text-truncate d-inline-block"
            style={{ maxWidth: "150px" }}
          >
            {folder.name}
          </Breadcrumb.Item>
        );
      })}
      {currentFolder && (
        <Breadcrumb.Item
          key={currentFolder.id}
          className="text-truncate d-inline-block"
          style={{ maxWidth: "200px" }}
          active
        >
          {currentFolder.name}
        </Breadcrumb.Item>
      )}
    </Breadcrumb>
  );
};

export default FolderBreadcrumbs;

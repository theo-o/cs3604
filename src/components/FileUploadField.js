import React, { Component } from "react";
import { API, Auth, Storage } from "aws-amplify";
import * as mutations from "../graphql/mutations";

class FileUploadField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: {},
      hasError: false,
      isUploaded: false
    };
  }

  validFileType(expectedType, file) {
    let match = null;
    switch (expectedType) {
      case "image":
        match = file.type.match(/\/(jpeg|jpg|gif|png)$/g);
        break;
      case "text":
        match = file.type.match(/\/(plain|csv|html)$/g);
        break;
      case "application":
        match = file.type.match(/\/(msword|json|rss\+xml)$/g);
        break;
      case "audio":
        match = file.type.match(/\/(mpeg|wav)$/g);
        break;
      case "any":
        match = true;
        break;
      default:
        break;
    }
    return match !== null;
  }

  folderNameByFileType(file) {
    let foldername = "";
    switch (file.type) {
      case "text/html":
        foldername = "text";
        break;
      case "audio/mpeg":
        foldername = "audio";
        break;
      case "audio/wav":
        foldername = "audio";
        break;
      case "image/jpeg":
        foldername = "image";
        break;
      case "image/png":
        foldername = "image";
        break;
      case "image/gif":
        foldername = "image";
        break;
      default:
        foldername = "misc";
        break;
    }
    return foldername;
  }

  setFile = e => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    if (this.validFileType(this.props.fileType, file)) {
      this.setState({ file: file, hasError: false, isUploaded: false });
    } else {
      this.setState({ file: {}, hasError: true });
    }
  };

  uploadFile = async () => {
    if (!this.state.hasError) {
      const folder = this.folderNameByFileType(this.state.file);
      const pathPrefix = `public/sitecontent/${folder}/${process.env.REACT_APP_REP_TYPE.toLowerCase()}/`;
      const prefixFolder = this.props.filepath ? `${this.props.filepath}/` : "";
      Storage.configure({
        customPrefix: {
          public: `${pathPrefix}${prefixFolder}`
        }
      });

      await Storage.put(this.state.file.name, this.state.file, {
        contentType: this.state.file.type
      });
      const evt = {
        target: {
          name: this.props.name,
          value: `${prefixFolder}${this.state.file.name}`,
          type: "upload"
        }
      };

      this.setState({ isUploaded: true }, () => {
        if (
          this.props.context &&
          typeof this.props.setFileFolder === "function"
        ) {
          this.props.setFileFolder(
            this.props.context,
            this.folderNameByFileType(this.state.file),
            evt
          );
        }
        if (
          this.props.context &&
          typeof this.props.setFileCharacterization === "function"
        ) {
          this.props.setFileCharacterization(
            this.props.context,
            this.state.file,
            evt
          );
        }
        this.props.setSrc(evt);
      });

      const eventInfo = {
        upload_content: {
          name: this.state.file.name,
          type: this.state.file.type,
          size: this.state.file.size
        }
      };

      const userInfo = await Auth.currentUserPoolUser();
      let historyInfo = {
        groups:
          userInfo.signInUserSession.accessToken.payload["cognito:groups"],
        userEmail: userInfo.attributes.email,
        event: JSON.stringify(eventInfo)
      };
      await API.graphql({
        query: mutations.createHistory,
        variables: { input: historyInfo },
        authMode: "AMAZON_COGNITO_USER_POOLS"
      });
    } else {
      this.setState({ isUploaded: false });
    }
  };

  afterMessage = () => {
    let color = "green";
    let message = null;
    if (this.state.hasError) {
      color = "red";
      message = `Please upload ${this.props.fileType} file only.`;
    } else if (this.state.isUploaded) {
      message = `${this.state.file.name} is uploaded successfully!`;
    }
    return (
      <p
        id={`${this.props.input_id}_upload_message`}
        style={{ color: color }}
        data-test="upload-message"
      >
        {message}
      </p>
    );
  };

  render() {
    return (
      <div className="fileUploadField">
        {this.props.value && (
          <div>
            <span className="key">Src:</span> {this.props.value}
          </div>
        )}
        <label>{this.props.label}</label>
        <input
          type="file"
          id={this.props.input_id || ""}
          onChange={this.setFile}
        />
        <button
          id={`${this.props.input_id}_button`}
          className="ui button uploadButton"
          onClick={this.uploadFile}
        >
          Upload File
        </button>
        {this.state.hasError || this.state.isUploaded
          ? this.afterMessage()
          : ""}
      </div>
    );
  }
}

export default FileUploadField;

import React, { useState, useEffect, useRef } from "react";
import { API, Storage, Auth } from "aws-amplify";
import { Form, Upload, Input, Select, Button } from "antd";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { getAllCollections, getArchiveByIdentifier } from "../lib/fetchTools";
import { v4 as uuidv4 } from "uuid";
import * as mutations from "../graphql/mutations";
import "../css/adminForms.scss";

import { UploadOutlined } from "@ant-design/icons";

const multiFields = [
  "belongs_to",
  "contributor",
  "creator",
  "format",
  "language",
  "location",
  "medium",
  "provenance",
  "reference",
  "repository",
  "resource_type",
  "related_url",
  "source",
  "subject",
  "tags"
];

const singleFields = [
  "bibliographic_citation",
  "collection",
  "description",
  "display_date",
  "manifest_url",
  "rights_holder",
  "rights_statement",
  "title",
  "thumbnail_path"
];

const booleanFields = ["visibility"];

const embargoFields = [
  "embargo_start_date",
  "embargo_end_date",
  "embargo_note"
];

const COURSE_TOPICS = [
  "-- Select --",
  "Intellectual Property",
  "Privacy",
  "Commerce",
  "Internet (ICT)",
  "Artificial Intelligence"
];

function TopicsToJson() {
  let converted = {};
}

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
};

function UploadSection() {
  const [currFile, setCurrFile] = useState();
  const [fileIsSelected, setFileIsSelected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [titleTextValue, setTitleTextValue] = useState("");
  const [descriptionTextValue, setDescriptionTextValue] = useState("");

  const [parentCollectionValue, setParentCollectionValue] = useState(
    COURSE_TOPICS[0]
  );
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [allCollections, setAllCollections] = useState(null);
  const pageRef = useRef();

  pageRef.currTitle = titleTextValue;
  pageRef.currDesc = descriptionTextValue;
  pageRef.parentColl = parentCollectionValue;
  pageRef.fileSelected = fileIsSelected;
  pageRef.currFile = currFile;
  pageRef.allCollections = allCollections;

  const titleError = <h3>Error: No title specified</h3>;

  const noParentCollectionError = <h3>Error: No course topic selected</h3>;

  const noFileError = <h3>Error: No file selected</h3>;

  const invalidFileError = <h3>Error: Invalid file type</h3>;

  const handleFileChange = e => {
    setCurrFile(e.target.files[0]);
    setFileIsSelected(true);
  };

  function findSelectedCollection() {
    console.log("all coll:", pageRef.allCollections);
    for (var c in pageRef.allCollections) {
      if (pageRef.allCollections[c].identifier === pageRef.parentColl) {
        setSelectedCollection(pageRef.allCollections[c]);
        return pageRef.allCollections[c];
      }
    }
  }

  // ! can be replaced with antd validation rules
  function isInvalidFileType(fileName) {
    return false;
  }

  function getNewArchive(id, title, desc, key, parent_collection) {
    const archive = new Object();
    const customKeyPrefix = "ark:/53696";
    const noid = uuidv4();
    const customKey = `${customKeyPrefix}/${noid}`;

    var date = new Date();
    let day = String(date.getDate()).padStart(2, "0");
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let year = date.getFullYear();
    const currentTime = `${month}-${day}-${year}`;

    if (!desc) {
      console.log("no desc");
    }

    archive.id = id;
    archive.create_date = currentTime;
    archive.modified_date = currentTime;
    archive.start_date = currentTime;
    archive.identifier = id;
    archive.heirarchy_path = parent_collection.heirarchy_path;
    archive.custom_key = customKey;
    archive.item_category = "Default";
    archive.language = ["en"];
    archive.parent_collection = [`${parent_collection.id}`];
    archive.manifest_url = `https://collectionmap115006-dlpdev.s3.amazonaws.com/public/casestudies/${key}`;
    archive.visibility = true;
    archive.title = title;
    archive.creator = ["Demo"];
    archive.thumbnail_path =
      "https://casestudy-presentations.s3.amazonaws.com/item.png";
    archive.source = [""];
    archive.rights_holder = "";
    archive.rights_statement = "";
    archive.bibliographic_citation = "";
    archive.display_date = "";

    return archive;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (pageRef.fileSelected) {
      const id = uuidv4();
      try {
        Storage.configure({
          customPrefix: {
            public: "public/casestudies/"
          }
        });
        const findExtension = pageRef.currFile.name.split(".");
        const extension = findExtension[findExtension.length - 1];
        const renameFile = new File([pageRef.currFile], `${id}.${extension}`);
        const key = renameFile.name;
        await Storage.put(renameFile.name, renameFile, {
          contentType: renameFile.type,
          resumable: true,
          completeCallback: e => {
            console.log(e);
          },
          errorCallback: err => {
            console.log(err);
            // Alert user of error
          }
        });
        const selectedColl = findSelectedCollection();
        console.log("collection: ", selectedColl);
        var archive = getNewArchive(
          id,
          pageRef.currTitle,
          pageRef.currDesc,
          key,
          selectedColl
        );
        console.log("archive: ", archive);
        await API.graphql({
          query: mutations.createArchive,
          variables: {
            input: archive
          },
          authMode: "AMAZON_COGNITO_USER_POOLS"
        });
      } catch (err) {
        console.log("Error uploading given file: ", err);
      }
      // resetFields();
    }
  }

  async function authUser() {
    try {
      const data = await Auth.currentUserPoolUser();
      const g = data.signInUserSession.accessToken.payload["cognito:groups"];
      const type = "students";
      const type2 = "Default";
      if (g && (g.indexOf(type) !== -1 || g.indexOf(type2) !== -1)) {
        console.log("auth!");
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (err) {
      console.log("error: ", err);
      setIsAuthorized(false);
    }
  }

  async function populateCollections() {
    const TYPE = process.env.REACT_APP_REP_TYPE;
    console.log("type: ", TYPE);
    const collections = await getAllCollections({
      filter: {
        collection_category: { eq: TYPE }
      }
    });
    setAllCollections(collections);
  }

  useEffect(() => {
    authUser();
    populateCollections();
  }, []);

  // isAuthorized is part of state, and thus should cause rerender on change
  const genSubmissionForm = () => {
    if (!isAuthorized) {
      return (
        <>
          <div>
            <h1>You are not authorized to access this page.</h1>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="upload-section">
          <Form name="validate_other" {...formItemLayout}>
            <Form.Item
              name="Title"
              label="Title"
              rules={[
                {
                  required: true,
                  message: "Please input the Case Study Title"
                }
              ]}
            >
              <Input
                value={titleTextValue}
                placeholder="Enter Title"
                onChange={e => setTitleTextValue(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              name="Description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: "Please enter a Description"
                }
              ]}
            >
              <Input
                value={descriptionTextValue}
                placeholder="Enter Description"
                onChange={e => setDescriptionTextValue(e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Course Topic">
              <Select>
                {COURSE_TOPICS.map(topic => (
                  <Select.Option value={topic}>{topic}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Case Study File Upload"
              onChange={handleFileChange}
              rules={[
                {
                  required: true,
                  message: "Please add a Case Study File"
                }
              ]}
            >
              <Upload name="file">
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" onClick={handleSubmit}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </>
    );
  };

  return (
    <div>
      <div>{genSubmissionForm()}</div>
    </div>
  );
}

export default withAuthenticator(UploadSection);

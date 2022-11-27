import React, { useState, useEffect, useRef } from "react";
import { API, Storage, Auth } from "aws-amplify";
import {
  Form,
  Upload,
  Input,
  Select,
  Button,
  notification,
  message,
  Checkbox,
  Switch,
  Tooltip,
  Spin
} from "antd";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { getAllCollections } from "../lib/fetchTools";
import { v4 as uuidv4 } from "uuid";
import * as mutations from "../graphql/mutations";
import "../css/adminForms.scss";

import {
  UploadOutlined,
  CheckOutlined,
  CloseOutlined
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const TITLE_MIN_LENGTH = 6;
const TITLE_MAX_LENGTH = 50;

const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 250;

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

// TODO: Dynamic?
const COURSE_TOPICS = [
  "-- Select --",
  "Intellectual Property",
  "Privacy",
  "Commerce",
  "Internet (ICT)",
  "Artificial Intelligence"
];

function UploadSection() {
  const [currFile, setCurrFile] = useState();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [titleTextValue, setTitleTextValue] = useState("");
  const [descriptionTextValue, setDescriptionTextValue] = useState("");
  const [creatorValue, setCreatorValue] = useState("");
  const [parentCollectionValue, setParentCollectionValue] = useState(
    COURSE_TOPICS[0]
  );
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [allCollections, setAllCollections] = useState(null);

  const [anonUpload, setAnonUpload] = useState(false);
  const [honorCode, setHonorCode] = useState(false);

  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  const pageRef = useRef();

  pageRef.currTitle = titleTextValue;
  pageRef.currDesc = descriptionTextValue;
  pageRef.parentColl = parentCollectionValue;
  pageRef.currFile = currFile;
  pageRef.allCollections = allCollections;

  const onRemoveFile = file => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const beforeUpload = file => {
    const isPDF = file.type === "application/pdf";
    if (!isPDF) {
      message.error(`${file.name} is not a PDF file`);
    } else {
      setFileList([...fileList, file]);
    }
    return false;
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

  function getNewArchive(id, title, desc, key, parent_collection) {
    const archive = new Object();
    const customKeyPrefix = "ark:/53696";
    const noid = uuidv4();
    const customKey = `${customKeyPrefix}/${noid}`;

    var date = new Date();
    let day = String(date.getDate()).padStart(2, "0");
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let year = date.getFullYear();
    const currentTime = `${year}/${month}/${day}`;

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
    archive.creator = [anonUpload ? "Anonymous" : creatorValue];
    archive.thumbnail_path =
    `https://collectionmap115006-dlpdev.s3.amazonaws.com/public/thumbnail/${key.split(".")[0]}.jpg`;
    archive.source = [""];
    archive.rights_holder = "";
    archive.rights_statement = "";
    archive.bibliographic_citation = "";
    archive.display_date = "";
    archive.description = desc;
    var opts = new Object();
    archive.archiveOptions = JSON.stringify(opts);

    return archive;
  }

  async function handleSubmit(e) {
    console.log(pageRef.currTitle);
    console.log(pageRef.currDesc);
    console.log(pageRef.parentColl);
    console.log(pageRef.currFile);
    var containsError = false;
    if (fileList.length > 0) {
      setUploading(true);
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
          contentType: pageRef.currFile.type,
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
        setUploading(false);
        notification.open({
          message: "Case Study successfully uploaded!",
          description: (
            <a
              href={"/archive/" + archive.custom_key.substr(11)}
            >{`Click here to visit ${archive.title}`}</a>
          ),
          duration: 0
        });
      } catch (err) {
        console.log("Error uploading given file: ", err);
      }
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

  return (
    <>
      {!isAuthorized ? (
        <div>
          <h1>You are not authorized to access this page.</h1>
        </div>
      ) : (
        <Spin spinning={uploading} tip="Submitting...">
          <Form
            name="validate_other"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            onFinish={handleSubmit}
            onFinishFailed={errorInfo => console.log("Failed:", errorInfo)}
            autoComplete="off"
          >
            <Form.Item label="Name" style={{ marginBottom: 0 }}>
              {/* Name Field */}
              <Form.Item
                name="Name"
                style={{ display: "inline-block", width: "calc(50% - 50px)" }}
              >
                <Input
                  value={anonUpload ? "Anonymous" : creatorValue}
                  placeholder="Enter Name"
                  onChange={e => setCreatorValue(e.target.value)}
                  disabled={anonUpload}
                />
              </Form.Item>
              <span
                style={{
                  display: "inline-block",
                  width: "100px",
                  lineHeight: "32px",
                  textAlign: "center"
                }}
              >
                - Anonymous
              </span>
              {/* Anonymous Upload Switch */}
              <Form.Item
                name="Anonymous"
                valuePropName="unchecked"
                style={{ display: "inline-block", width: "calc(50% - 50px)" }}
              >
                <Tooltip title="Enable if you would like your submission to be Anonymous">
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    onChange={e => setAnonUpload(e)}
                    checked={anonUpload}
                  />
                </Tooltip>
              </Form.Item>
            </Form.Item>

            {/* Title Field */}
            <Form.Item
              name="Title"
              label="Title"
              rules={[
                {
                  required: true,
                  message: "Please input the Case Study Title"
                },
                {
                  min: TITLE_MIN_LENGTH,
                  message: `Title must be at least ${TITLE_MIN_LENGTH} characters.`
                }
              ]}
              hasFeedback
            >
              <Input
                showCount
                maxLength={TITLE_MAX_LENGTH}
                value={titleTextValue}
                placeholder="Enter Title"
                onChange={e => setTitleTextValue(e.target.value)}
              />
            </Form.Item>

            {/* Description Field */}
            <Form.Item
              name="Description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: "Please enter a Description"
                },
                {
                  min: DESCRIPTION_MIN_LENGTH,
                  message: `Description must be minimum ${DESCRIPTION_MIN_LENGTH} characters.`
                }
              ]}
              hasFeedback
            >
              <TextArea
                showCount
                maxLength={DESCRIPTION_MAX_LENGTH}
                value={descriptionTextValue}
                placeholder="Enter Description"
                onChange={e => setDescriptionTextValue(e.target.value)}
                style={{ height: 120 }}
                rows={4}
              />
            </Form.Item>

            {/* Course Topic Select */}
            <Form.Item
              label="Course Topic"
              name="Topic"
              rules={[
                {
                  required: true,
                  message: "Please select a Course Topic"
                },
                {
                  message: "Please select a valid Course Topic",
                  validator: (_, value) => {
                    if (value === COURSE_TOPICS[0]) {
                      return Promise.reject();
                    }
                    return Promise.resolve();
                  }
                }
              ]}
              hasFeedback
            >
              <Select
                defaultValue={COURSE_TOPICS[0]}
                onChange={str => setParentCollectionValue(str)}
                value={parentCollectionValue}
              >
                {COURSE_TOPICS.map(topic => (
                  <Option value={topic}>{topic}</Option>
                ))}
              </Select>
            </Form.Item>

            {/* File Upload */}
            <Form.Item
              label="Case Study File"
              onChange={e => setCurrFile(e.target.files[0])}
              rules={[
                {
                  required: true,
                  message: "Please add a Case Study File"
                }
              ]}
            >
              <Upload
                onRemove={onRemoveFile}
                beforeUpload={beforeUpload}
                name="file"
                fileList={fileList}
                maxCount={1}
              >
                <Button
                  disabled={fileList.length > 0}
                  icon={<UploadOutlined />}
                >
                  Select File (Max: 1)
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item
              wrapperCol={{ offset: 6, span: 14 }}
              style={{ marginBottom: 0 }}
            >
              {/* Submit */}
              <Form.Item
                style={{ display: "inline-block", width: "calc(15%)" }}
              >
                <Button
                  disabled={
                    !honorCode ||
                    fileList.length === 0 ||
                    descriptionTextValue.length < DESCRIPTION_MIN_LENGTH ||
                    titleTextValue.length < TITLE_MIN_LENGTH ||
                    parentCollectionValue === COURSE_TOPICS[0]
                  }
                  type="primary"
                  htmlType="submit"
                >
                  Submit
                </Button>
              </Form.Item>
              {/* Honor Code */}
              <Form.Item
                name="Honor Code"
                valuePropName="unchecked"
                help={
                  honorCode
                    ? undefined
                    : ""
                }
                style={{ display: "inline-block", width: "calc(75%)" }}
              >
                <Checkbox
                  checked={honorCode}
                  onChange={e => setHonorCode(e.target.checked)}
                >
                  I acknowledge that the information I provided is correct, accurate, and adheres to the {" "}
                  <a href="https://honorsystem.vt.edu/honor_code_policy_test.html">
                    VT Honor Code
                  </a>, and that I cannot alter this submission without contacting Professor Dunlap
                  or the system administrator.
                </Checkbox>
              </Form.Item>
            </Form.Item>
          </Form>
        </Spin>
      )}
    </>
  );
}

export default withAuthenticator(UploadSection);

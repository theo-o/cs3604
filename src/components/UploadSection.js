import React, { useState, useEffect, useRef } from 'react';
import { API, Storage, Auth } from "aws-amplify";
import {withAuthenticator} from "@aws-amplify/ui-react";
import { getAllCollections, mintNOID, getArchiveByIdentifier } from '../lib/fetchTools';
import {v4 as uuidv4} from "uuid";
import * as mutations from "../graphql/mutations";

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

function UploadSection() {

    const [currFile, setCurrFile] = useState();
    const [fileIsSelected, setFileIsSelected] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [content, setContent] = useState();
    // const [groups, setGroups] = useState();
    const [errorContent, setErrorContent] = useState([]);
    const [titleTextValue, setTitleTextValue] = useState("");
    const [descriptionTextValue, setDescriptionTextValue] = useState("");
    const [parentCollectionValue, setParentCollectionValue] = useState(COURSE_TOPICS[0]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [allCollections, setAllCollections] = useState(null);
    const pageRef = useRef();
    pageRef.currTitle = titleTextValue;
    pageRef.currDesc = descriptionTextValue;
    pageRef.parentColl = parentCollectionValue;
    pageRef.fileSelected = fileIsSelected;
    pageRef.currFile = currFile;
    pageRef.allCollections = allCollections;


    const titleError = (
        <h3>Error: No title specified</h3>
    );

    const noParentCollectionError = (
        <h3>Error: No course topic selected</h3>
    );

    const noFileError = (
        <h3>Error: No file selected</h3>
    );

    const invalidFileError = (
        <h3>Error: Invalid file type</h3>
    );

    const handleFileChange = (e) => {
        setCurrFile(e.target.files[0]);
        setFileIsSelected(true);
    };

    const handleTitleChange = (e) => {
        console.log(e.target.value);
        setTitleTextValue(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        setDescriptionTextValue(e.target.value);
    };

    const handleParentCollectionChange = (e) => {
        setParentCollectionValue(e.target.value);
    };

    // function resetFields() {
    //     console.log('resetting...');
    //     setTitleTextValue("");
    //     setDescriptionTextValue("");
    //     setParentCollectionValue(COURSE_TOPICS[0]);
    //     setCurrFile(null);
    //     setFileIsSelected(false);
    //     setErrorContent([]);
    // }

    function findSelectedCollection() {
        console.log("all coll:", pageRef.allCollections);
        for (var c in pageRef.allCollections) {
            if (pageRef.allCollections[c].identifier === pageRef.parentColl) {
                setSelectedCollection(pageRef.allCollections[c]);
                return pageRef.allCollections[c];
            }
        }
    }


    function isInvalidFileType(fileName) {
        // TODO: Implement based on file types that can be displayed
        return false;
    }

    async function getNewArchive(id, title, desc, key, parent_collection) {
        const archive = new Object();
        const customKeyPrefix = "ark:/53696";
        const customKey = `${customKeyPrefix}/${parent_collection.custom_key}`;

        var date = new Date();
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth()+1).padStart(2, '0');
        let year = date.getFullYear();
        const currentTime =  `${month}-${day}-${year}`;
        


        archive.id = id;
        archive.createdAt = currentTime;
        archive.create_date = currentTime;
        archive.modified_date = currentTime;
        archive.start_date = currentTime;
        archive.updatedAt = currentTime;
        archive.createdAt = 
        archive.identifier = id;
        archive.heirarchy_path = parent_collection.heirarchy_path;
        archive.custom_key = customKey;
        archive.item_category = "Default";
        archive.language = [ "en" ];
        archive.parent_collection = [ `${parent_collection.id}` ];
        archive.manifest_url = 
            `https://collectionmap115006-dlpdev.s3.amazonaws.com/public/casestudies/${key}`;
        archive.visibility = true;
        archive.title = title;
        archive.description = desc;
        archive.creator = [ "Demo" ];
        archive.thumbnail_path = "https://casestudy-presentations.s3.amazonaws.com/item.png";
        archive.source = [ "" ];
        archive.__typename = "Archive";
        return archive;
      }

    async function handleSubmit(e) {
        e.preventDefault();
        console.log(pageRef.currTitle);
        console.log(pageRef.currDesc);
        console.log(pageRef.parentColl);
        console.log(pageRef.fileSelected);
        console.log(pageRef.currFile);
        var containsError = false;
        setErrorContent([]);
        if (pageRef.currTitle === "") {
            containsError = true;
            errorContent.push(titleError);
        }
        if (pageRef.parentColl === COURSE_TOPICS[0]) {
            containsError = true;
            errorContent.push(noParentCollectionError);
        }
        if (!pageRef.fileSelected) {
            containsError = true;
            errorContent.push(noFileError);
        }
        else if (isInvalidFileType(pageRef.currFile.name)) {
            containsError = true;
            errorContent.push(invalidFileError);
        }
        if (pageRef.fileSelected) {
            const id = uuidv4();
            try {
                Storage.configure({
                    customPrefix: {
                        public: 'public/casestudies/'
                    }
                });
                const findExtension = pageRef.currFile.name.split(".");
                const extension = findExtension[findExtension.length-1];
                const renameFile = new File([pageRef.currFile], `${id}.${extension}`);
                const key = renameFile.name;
                await Storage.put(renameFile.name, renameFile, {
                    contentType: renameFile.type, 
                    resumable: true, 
                    completeCallback: (e) => {
                        console.log(e);

                    }, 
                    errorCallback: (err) => {
                        console.log(err);
                        // Alert user of error
                    }
                });
                const selectedColl = findSelectedCollection();
                console.log("collection: ", selectedColl);
                var archive = getNewArchive(
                    id, pageRef.currTitle, pageRef.currDesc, key, selectedColl
                );
                console.log("archive: ", archive);
                await API.graphql( {
                    query: mutations.createArchive, 
                    variables: {
                        input: archive
                    }, 
                    authMode: "AMAZON_COGNITO_USER_POOLS"
                });
            } 
            catch (err) {
                console.log("Error uploading given file: ", err);
            }
            // resetFields();
        }

    }

    async function authUser() {
        try {
            const data = await Auth.currentUserPoolUser();
            const g = data.signInUserSession.accessToken.payload["cognito:groups"];
            const type = 'students';
            if (g && g.indexOf(type) !== -1) {
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
                collection_category: {eq: TYPE}
            }
        });
        setAllCollections(collections);
    }
    

    useEffect(() => {
        authUser();
        populateCollections();
    }, [])

    useEffect(() => {
        if (isAuthorized) {
            setContent((
                <div>
                    <label htmlFor='casestudy-title'>Title:</label> 
                    <input id ='casestudy-title' type='text' onChange={handleTitleChange}/>
                    <label htmlFor='casestudy-desc'>Description:</label>
                    <input id='casestudy-desc' type='text' onChange={handleDescriptionChange}/>
                    <label htmlFor='course-topic-select'>Course Topic:</label>
                    <select id='course-topic-select' onChange={handleParentCollectionChange}>
                        {COURSE_TOPICS.map(
                            (topic) => <option value={topic}>{topic}</option>
                        )}
                    </select>
                    <label htmlFor='casestudy-file-select'>File:</label>
                    <input id='casestudy-file-select' type='file' name='file' onChange={handleFileChange} />
                    <div>
                        <button onClick={handleSubmit}>Submit Case Study</button>
                    </div>
                </div>
                ))
        } else {
            setContent((
            <div>
                <h1>You are not authorized to access this page.</h1>
            </div>))
        }
    }, [isAuthorized]);

    return (
        <div>
            <div>
                {content}
            </div>
            <div>
                {errorContent}
            </div>
        </div>
    )
}

export default withAuthenticator(UploadSection);
import React, { useEffect, useState, useContext } from "react";
import { Form } from "semantic-ui-react";
import ViewMetadata from "./ViewMetadata";
import EditMetadata from "./EditMetadata";
import { API, Storage } from "aws-amplify";
import { getCollectionByIdentifier, mintNOID } from "../../../lib/fetchTools";
import { addedDiff, updatedDiff } from "deep-object-diff";
import * as mutations from "../../../graphql/mutations";
import { v4 as uuidv4 } from "uuid";
import SiteContext from "../SiteContext";
import FileUploadField from "../../../components/FileUploadField";

const multiFields = [
  "belongs_to",
  "creator",
  "language",
  "location",
  "provenance",
  "related_url",
  "source",
  "subject"
];

const singleFields = [
  "bibliographic_citation",
  "circa",
  "collection_category",
  "description",
  "display_date",
  "end_date",
  "ownerinfo_email",
  "ownerinfo_name",
  "rights_holder",
  "rights_statement",
  "start_date",
  "title",
  "thumbnail_path"
];

const booleanFields = ["explicit_content", "visibility"];

const editableFields = singleFields.concat(multiFields).concat(booleanFields);

const CollectionForm = React.memo(props => {
  const { identifier, newCollection } = props;
  const [error, setError] = useState(null);
  const [oldCollection, setOldCollection] = useState(null);
  const [collection, setCollection] = useState(null);
  const [collectionId, setCollectionId] = useState(null);
  const [viewState, setViewState] = useState("view");
  const [validForm, setValidForm] = useState(true);

  const siteContext = useContext(SiteContext);

  useEffect(() => {
    async function loadItem() {
      let editableCollection = {};
      let item_id = null;
      try {
        const item = await getCollectionByIdentifier(identifier);
        setError(null);

        const defaultValue = key => {
          let value = null;
          if (singleFields.includes(key)) {
            value = "";
          } else if (multiFields.includes(key)) {
            value = [];
          } else if (booleanFields.includes(key)) {
            value = false;
          }
          return value;
        };

        for (const idx in editableFields) {
          const field = editableFields[idx];
          editableCollection[field] = item[field] || defaultValue(field);
        }
        item_id = item.id;
      } catch (e) {
        console.log(e);
        console.error(`Error fetch collection for ${identifier} due to ${e}`);
        setError(`No item found for identifier: ${identifier}!`);
      }

      setOldCollection(editableCollection);
      setCollection(editableCollection);
      setCollectionId(item_id);
    }

    function setNewCollection() {
      let newCollection = {};
      for (const item in singleFields) {
        const key = singleFields[item];
        newCollection[key] = null;
      }
      for (const item in multiFields) {
        const key = multiFields[item];
        newCollection[key] = [];
      }
      for (const item in booleanFields) {
        const key = booleanFields[item];
        newCollection[key] = false;
      }
      setOldCollection(newCollection);
      setCollection(newCollection);
      setCollectionId(null);
    }

    if (identifier && !newCollection) {
      loadItem();
    } else if (newCollection) {
      setNewCollection();
    }
  }, [identifier, newCollection]);

  const isRequiredField = attribute => {
    const requiredFields = ["title", "collection_category", "visibility"];
    return requiredFields.includes(attribute);
  };

  const viewChangeHandler = (e, { value }) => {
    setViewState(value);
  };

  const submitCollectionHandler = async event => {
    delete collection.ownerinfo_name;
    delete collection.ownerinfo_email;

    for (const key in collection) {
      if (isRequiredField(key) && !collection[key]) {
        setValidForm(false);
        return null;
      }
      if (Array.isArray(collection[key])) {
        collection[key] = [...collection[key].filter(val => val !== null)];
        if (collection[key].length === 0) {
          collection[key] = null;
        }
      }
      if (collection[key] === null) {
        delete collection[key];
      }
    }
    if (
      collection.ownerinfo &&
      collection.ownerinfo.constructor === {}.constructor
    ) {
      collection.ownerinfo = JSON.stringify(collection.ownerinfo);
    }

    if (newCollection) {
      const id = uuidv4();
      const noid = await mintNOID();
      const customKeyPrefix = "ark:/53696";
      const customKey = `${customKeyPrefix}/${noid}`;

      collection.id = id;
      collection.identifier = id.toString();
      collection.heirarchy_path = [id.toString()];
      collection.custom_key = customKey;
    }

    setValidForm(true);
    setViewState("view");

    const collectionInfo = {
      id: collectionId,
      ...collection
    };
    let mutation = mutations.updateCollection;
    if (newCollection) {
      mutation = mutations.createCollection;
    }

    await API.graphql({
      query: mutation,
      variables: { input: collectionInfo },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });

    const addedData = addedDiff(oldCollection, collection);
    const newData = updatedDiff(oldCollection, collection);
    const oldData = updatedDiff(collection, oldCollection);
    const deletedData = addedDiff(collection, oldCollection);
    const updatedData = Object.keys(newData).reduce((acc, key) => {
      return {
        ...acc,
        [key]: {
          new: newData[key],
          old: oldData[key]
        }
      };
    }, {});
    const eventInfo = {
      [`collection_${identifier}`]: {
        added: addedData,
        deleted: deletedData,
        updated: updatedData
      }
    };

    siteContext.updateSite(eventInfo);
  };

  const changeValueHandler = (event, field, valueIdx) => {
    let inputValue = event.target.value;
    if (inputValue.trim() === "") {
      inputValue = null;
    }
    if (field === "explicit_content" || field === "visibility") {
      inputValue = event.target.checked;
    }
    if (field.indexOf("ownerinfo") !== -1) {
      const ownerField = field.split("_")[1];
      let ownerinfo = collection.ownerinfo || {};
      ownerinfo[ownerField] = ownerinfo[ownerField] || "";
      ownerinfo[ownerField] = inputValue;
      field = "ownerinfo";
      inputValue = ownerinfo;
    }
    setCollection(prevCollection => {
      if (valueIdx === undefined) {
        return {
          ...prevCollection,
          [field]: inputValue
        };
      } else {
        const values = [...prevCollection[field]];
        values[valueIdx] = inputValue;
        return {
          ...prevCollection,
          [field]: values
        };
      }
    });
  };

  const deleteMetadataHandler = (field, valueIdx) => {
    setCollection(prevCollection => {
      const values = [...prevCollection[field]];
      values.splice(valueIdx, 1);
      return {
        ...prevCollection,
        [field]: values.length === 0 ? null : values
      };
    });
  };

  const addMetadataHandler = field => {
    setCollection(prevCollection => {
      const values = Array.isArray(prevCollection[field])
        ? [...prevCollection[field]]
        : [];
      values.push(`new ${field}`);
      return {
        ...prevCollection,
        [field]: values
      };
    });
  };

  const getFileUrl = (name, value) => {
    const bucket = Storage._config.AWSS3.bucket;
    const folder = "image";
    const pathPrefix = `public/sitecontent/${folder}/${process.env.REACT_APP_REP_TYPE.toLowerCase()}/`;
    return `https://${bucket}.s3.amazonaws.com/${pathPrefix}${value}`;
  };

  const setThumbnailSrc = event => {
    const fileUrl = getFileUrl(event.target.name, event.target.value);
    event.target.value = fileUrl;
    changeValueHandler(event, "thumbnail_path");
  };

  const formElement = (attribute, index) => {
    let element = null;
    if (attribute === "ownerinfo_email" || attribute === "ownerinfo_name") {
      const keyName = attribute.split("_")[1];
      let values = "";
      try {
        values = collection.ownerinfo[keyName];
      } catch (error) {
        //"Ownerinfo undefined";
      }
      element = (
        <EditMetadata
          key={`edit_${index}_${keyName}`}
          required={isRequiredField(attribute)}
          field={`ownerinfo_${keyName}`}
          label={`Owner info: ${keyName}`}
          isMulti={false}
          isBoolean={false}
          values={values}
          onChangeValue={changeValueHandler}
        />
      );
    } else if (attribute === "thumbnail_path") {
      element = (
        <FileUploadField
          key={`thumbnail_path_upload_${index}`}
          value={collection["thumbnail_path"]}
          site={siteContext.site}
          label="Upload thumbnail image"
          input_id={`thumbnail_path_upload_${index}`}
          name={`thumbnail_path_upload_${index}`}
          placeholder="Enter thumbnail source"
          setSrc={setThumbnailSrc}
          siteID={siteContext.site.id}
          fileType="image"
        />
      );
    } else if (attribute !== "ownerinfo") {
      element = (
        <EditMetadata
          key={`edit_${index}`}
          required={isRequiredField(attribute)}
          field={attribute}
          label={
            attribute[0].toUpperCase() +
            attribute.substring(1).replace("_", " ")
          }
          isMulti={multiFields.includes(attribute)}
          isBoolean={booleanFields.includes(attribute)}
          values={collection[attribute]}
          onChangeValue={changeValueHandler}
          onRemoveValue={deleteMetadataHandler}
          onAddValue={addMetadataHandler}
        />
      );
    }
    return element;
  };

  let collectionDisplay = null;
  if (collection) {
    if (viewState === "view") {
      collectionDisplay = Object.keys(collection).map((entry, index) => {
        const label =
          entry[0].toUpperCase() + entry.substring(1).replace("_", " ");
        const attribute = { label: label, field: entry };
        const retVal =
          collection[attribute.field] !== null &&
          collection[attribute.field].length !== 0 ? (
            <ViewMetadata
              key={`view_${index}`}
              attribute={attribute}
              isMulti={multiFields.includes(attribute.field)}
              isBoolean={booleanFields.includes(attribute.field)}
              values={collection[attribute.field]}
            />
          ) : null;
        return retVal;
      });
    } else {
      let errorMsg = null;
      if (!validForm) {
        errorMsg = (
          <p className="validation_msg">
            Please fill in the required fields (marked with *) !{" "}
          </p>
        );
      }
      collectionDisplay = (
        <Form>
          {errorMsg}
          {Object.keys(collection).map((attribute, index) => {
            return formElement(attribute, index);
          })}
          {errorMsg}
          <Form.Button onClick={submitCollectionHandler}>
            Update Collection Metadata
          </Form.Button>
        </Form>
      );
    }
  } else {
    collectionDisplay = (
      <p>
        <strong>{error}</strong>
      </p>
    );
  }

  return (
    <div className="col-lg-9 col-sm-12 admin-content">
      <Form>
        <Form.Group inline>
          <label>Current mode:</label>
          <Form.Radio
            label="Edit"
            name="editCollectionRadioGroup"
            value="edit"
            checked={viewState === "edit"}
            onChange={viewChangeHandler}
          />
          <Form.Radio
            label="View"
            name="viewCollectionRadioGroup"
            value="view"
            checked={viewState === "view"}
            onChange={viewChangeHandler}
          />
        </Form.Group>
      </Form>
      {collectionDisplay}
    </div>
  );
});

export default CollectionForm;

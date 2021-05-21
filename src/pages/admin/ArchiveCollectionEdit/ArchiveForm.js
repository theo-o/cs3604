import React, { useEffect, useState, useContext } from "react";
import { Form } from "semantic-ui-react";
import ViewMetadata from "./ViewMetadata";
import EditMetadata from "./EditMetadata";
import { API, Storage } from "aws-amplify";
import { getArchiveByIdentifier } from "../../../lib/fetchTools";
import { addedDiff, updatedDiff } from "deep-object-diff";
import * as mutations from "../../../graphql/mutations";
import SiteContext from "../SiteContext";
import FileUploadField from "../../../components/FileUploadField";

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
  "description",
  "display_date",
  "rights_holder",
  "rights_statement",
  "title",
  "thumbnail_path"
];

const editableFields = singleFields.concat(multiFields);

const ArchiveForm = React.memo(props => {
  const { identifier } = props;
  const [error, setError] = useState(null);
  const [oldArchive, setOldArchive] = useState(null);
  const [archive, setArchive] = useState(null);
  const [archiveId, setArchiveId] = useState(null);
  const [viewState, setViewState] = useState("view");
  const [validForm, setValidForm] = useState(true);

  const siteContext = useContext(SiteContext);

  useEffect(() => {
    async function loadItem() {
      let editableArchive = null;
      let item_id = null;
      try {
        const item = await getArchiveByIdentifier(identifier);
        setError(null);
        editableArchive = Object.keys(item)
          .filter(k => editableFields.includes(k))
          .reduce((acc, key) => {
            if (item[key]) {
              acc[key] = item[key];
            }
            return acc;
          }, {});
        item_id = item.id;
      } catch (e) {
        console.error(`Error fetch archive for ${identifier} due to ${e}`);
        setError(`No item found for identifier: ${identifier}!`);
      }

      setOldArchive(editableArchive);
      setArchive(editableArchive);
      setArchiveId(item_id);
    }
    loadItem();
  }, [identifier]);

  const isRequiredField = attribute => {
    const requiredFields = ["title"];
    return requiredFields.includes(attribute);
  };

  const viewChangeHandler = (e, { value }) => {
    setViewState(value);
  };

  const editableAttributes = () => {
    const displayedAttributes = JSON.parse(
      siteContext.site.displayedAttributes
    )["archive"].filter(attribute => editableFields.includes(attribute.field));
    displayedAttributes.unshift(
      {
        field: "title",
        label: "Title"
      },
      {
        field: "description",
        label: "Description"
      },
      {
        field: "thumbnail_path",
        label: "Thumbnail image"
      }
    );
    return displayedAttributes;
  };

  const submitArchiveHandler = async event => {
    for (const key in archive) {
      if (isRequiredField(key) && !archive[key]) {
        setValidForm(false);
        return null;
      }
      if (Array.isArray(archive[key])) {
        archive[key] = [...archive[key].filter(val => val !== null)];
        if (archive[key].length === 0) {
          archive[key] = null;
        }
      }
    }
    setValidForm(true);
    setViewState("view");

    const archiveInfo = {
      id: archiveId,
      ...archive
    };
    await API.graphql({
      query: mutations.updateArchive,
      variables: { input: archiveInfo },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });

    const addedData = addedDiff(oldArchive, archive);
    const newData = updatedDiff(oldArchive, archive);
    const oldData = updatedDiff(archive, oldArchive);
    const deletedData = addedDiff(archive, oldArchive);
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
      [`archive_${identifier}`]: {
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
    setArchive(prevArchive => {
      if (valueIdx === undefined) {
        return {
          ...prevArchive,
          [field]: inputValue
        };
      } else {
        const values = [...prevArchive[field]];
        values[valueIdx] = inputValue;
        return {
          ...prevArchive,
          [field]: values
        };
      }
    });
  };

  const deleteMetadataHandler = (field, valueIdx) => {
    setArchive(prevArchive => {
      const values = [...prevArchive[field]];
      values.splice(valueIdx, 1);
      return {
        ...prevArchive,
        [field]: values.length === 0 ? null : values
      };
    });
  };

  const addMetadataHandler = field => {
    setArchive(prevArchive => {
      const values = Array.isArray(prevArchive[field])
        ? [...prevArchive[field]]
        : [];
      values.push(`new ${field}`);
      return {
        ...prevArchive,
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
    if (attribute.field === "thumbnail_path") {
      element = (
        <FileUploadField
          key={`thumbnail_path_upload_${index}`}
          value={archive["thumbnail_path"]}
          site={siteContext.site}
          label="Thumbnail image"
          input_id={`thumbnail_path_upload_${index}`}
          name={`thumbnail_path_upload_${index}`}
          placeholder="Enter thumbnail source"
          setSrc={setThumbnailSrc}
          siteID={siteContext.site.id}
          fileType="image"
        />
      );
    } else {
      element = (
        <EditMetadata
          key={`edit_${index}`}
          required={isRequiredField(attribute.field)}
          field={attribute.field}
          label={attribute.label}
          isMulti={multiFields.includes(attribute.field)}
          values={archive[attribute.field]}
          onChangeValue={changeValueHandler}
          onRemoveValue={deleteMetadataHandler}
          onAddValue={addMetadataHandler}
        />
      );
    }
    return element;
  };

  let archiveDisplay = null;
  if (archive) {
    if (viewState === "view") {
      archiveDisplay = editableAttributes().map((attribute, index) => {
        return (
          <ViewMetadata
            key={`view_${index}`}
            attribute={attribute}
            isMulti={multiFields.includes(attribute.field)}
            values={archive[attribute.field]}
          />
        );
      });
    } else {
      let errorMsg = null;
      if (!validForm) {
        errorMsg = (
          <p className="validation_msg">Please fill in the required field!</p>
        );
      }
      archiveDisplay = (
        <Form>
          {errorMsg}
          {editableAttributes().map((attribute, index) => {
            return formElement(attribute, index);
          })}
          <Form.Button onClick={submitArchiveHandler}>
            Update Archive Metadata
          </Form.Button>
        </Form>
      );
    }
  } else {
    archiveDisplay = (
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
            name="editArchiveRadioGroup"
            value="edit"
            checked={viewState === "edit"}
            onChange={viewChangeHandler}
          />
          <Form.Radio
            label="View"
            name="viewArchiveRadioGroup"
            value="view"
            checked={viewState === "view"}
            onChange={viewChangeHandler}
          />
        </Form.Group>
      </Form>
      {archiveDisplay}
    </div>
  );
});

export default ArchiveForm;

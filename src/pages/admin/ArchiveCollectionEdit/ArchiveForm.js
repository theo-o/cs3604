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

const booleanFields = ["visibility"];

const editableFields = singleFields.concat(multiFields).concat(booleanFields);

const ArchiveForm = React.memo(props => {
  const { identifier } = props;
  const [error, setError] = useState(null);
  const [fullArchive, setFullArchive] = useState(null);
  const [oldArchive, setOldArchive] = useState(null);
  const [archive, setArchive] = useState(null);
  const [archiveId, setArchiveId] = useState(null);
  const [viewState, setViewState] = useState("view");
  const [validForm, setValidForm] = useState(true);
  const [url, setURL] = useState(null);

  const siteContext = useContext(SiteContext);

  useEffect(() => {
    async function loadItem() {
      let item;
      let editableArchive = {};
      let item_id = null;
      try {
        item = await getArchiveByIdentifier(identifier);
        setFullArchive(item);
        setError(null);
        setURL(item.manifest_url);

        if (item.manifest_url) {
          if (
            item.manifest_url.match(/\.(mp3|ogg|wav)$/) ||
            item.manifest_url.match(/\.(mp4|mov)$/)
          ) {
            editableFields.push("audioTranscript");
          }
        }

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

        const inOptions = key => {
          let retVal = null;
          if (item.archiveOptions && item.archiveOptions[key] !== null) {
            const options = JSON.parse(item.archiveOptions);
            retVal = options[key];
          }
          return retVal;
        };

        for (const idx in editableFields) {
          const field = editableFields[idx];
          editableArchive[field] =
            item[field] || inOptions(field) || defaultValue(field);
        }
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

    let options = null;
    if (archive.archiveOptions) {
      options = JSON.parse(archive.archiveOptions);
      options.audioTranscript = archive.audioTranscript;
    } else {
      options = {
        audioTranscript: archive.audioTranscript
      };
    }
    archive.archiveOptions = JSON.stringify(options);
    delete archive.audioTranscript;

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

    archive.audioTranscript = options.audioTranscript;
    setValidForm(true);
    setViewState("view");
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

  const changeValueHandler = (event, field, valueIdx) => {
    let inputValue = event.target.value;
    if (inputValue.trim() === "") {
      inputValue = null;
    }
    if (booleanFields.indexOf(field) !== -1) {
      inputValue = event.target.checked;
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

  const getFileUrl = (name, value, type) => {
    const bucket = Storage._config.AWSS3.bucket;
    const pathPrefix = `public/sitecontent/${type}/${process.env.REACT_APP_REP_TYPE.toLowerCase()}/`;
    return `https://${bucket}.s3.amazonaws.com/${pathPrefix}${value}`;
  };

  const setSrc = (event, type, field) => {
    const fileUrl = getFileUrl(event.target.name, event.target.value, type);
    event.target.value = fileUrl;
    changeValueHandler(event, field);
  };

  const formElement = (attribute, index) => {
    let element = null;
    if (
      attribute.field === "thumbnail_path" ||
      attribute.field === "audioTranscript"
    ) {
      element = (
        <FileUploadField
          key={`${attribute.field}_${index}`}
          value={archive[`${attribute.field}`]}
          site={siteContext.site}
          label={
            attribute.field === "thumbnail_path"
              ? "Thumbnail image"
              : "HTML Audio Transcript"
          }
          input_id={`${attribute.field}_upload_${index}`}
          name={`${attribute.field}_upload_${index}`}
          placeholder="Enter source url"
          setSrc={setSrc}
          siteID={siteContext.site.id}
          fileType={attribute.field === "thumbnail_path" ? "image" : "text"}
          field={attribute.field}
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
          isBoolean={booleanFields.includes(attribute.field)}
          values={archive[attribute.field]}
          onChangeValue={changeValueHandler}
          onRemoveValue={deleteMetadataHandler}
          onAddValue={addMetadataHandler}
        />
      );
    }
    return element;
  };

  const editableAttributes = () => {
    const displayedAttributes = JSON.parse(
      siteContext.site.displayedAttributes
    )["archive"].filter(
      attribute =>
        attribute.field !== "custom_key" &&
        editableFields.includes(attribute.field)
    );
    if (url) {
      if (url.match(/\.(mp3|ogg|wav)$/) || url.match(/\.(mp4|mov)$/)) {
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
          },
          {
            field: "audioTranscript",
            label: "HTML audio transcript"
          }
        );
      } else {
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
      }
    }
    return displayedAttributes;
  };

  let archiveDisplay = null;
  if (archive) {
    if (viewState === "view") {
      archiveDisplay = [
        <a
          key="view_custom_key"
          href={`/archive/${fullArchive.custom_key.split("/").pop()}`}
        >
          View Item
        </a>
      ];
      archiveDisplay.push(
        editableAttributes().map((attribute, index) => {
          return archive[attribute.field] !== null &&
            archive[attribute.field].length ? (
            <ViewMetadata
              key={`view_${attribute.field}`}
              attribute={attribute}
              isMulti={multiFields.includes(attribute.field)}
              isBoolean={booleanFields.includes(attribute.field)}
              values={archive[attribute.field]}
            />
          ) : null;
        })
      );
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
            Update Item Metadata
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

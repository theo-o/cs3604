import React from "react";
import { Form } from "semantic-ui-react";
import FileUploadField from "./FileUploadField";

export const input = (options, type) => {
  let retVal = null;
  switch (type) {
    case "select":
      retVal = selectInput(options);
      break;
    case "textArea":
      retVal = textAreaInput(options);
      break;
    case "date":
      retVal = dateInput(options);
      break;
    case "checkBox":
      retVal = checkBox(options);
      break;
    case "file":
      retVal = fileInput(options);
      break;
    default:
      retVal = defaultInput(options);
      break;
  }
  return retVal;
};

const defaultInput = options => {
  const { label, id, name, placeholder, onChange, onBlur } = options;
  return (
    <Form.Input
      key={id || name}
      id={id || name}
      label={label}
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
};

const selectInput = options => {
  const { label, id, name, value, onChange, entries } = options;
  return (
    <label key={id || name}>
      {label}
      <select id={id || name} name={name} value={value} onChange={onChange}>
        {entries.map(entry => (
          <option key={entry.id} value={entry.id}>
            {entry.text}
          </option>
        ))}
      </select>
    </label>
  );
};

const textAreaInput = options => {
  const { id, label, name, placeholder, onChange } = options;
  return (
    <Form.TextArea
      key={id || name}
      id={id || name}
      label={label}
      name={name}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
};

const dateInput = options => {
  const { outerClass, innerClass, label, id, name, onChange } = options;
  return (
    <div className={outerClass} key={id || name}>
      <label htmlFor={id || name}>{label}</label>
      <div className={innerClass}>
        <input
          type="date"
          id={id || name}
          name={name}
          onChange={onChange}
        ></input>
      </div>
    </div>
  );
};

const checkBox = options => {
  const { outerClass, label, id, name, onChange, checked } = options;
  return (
    <div className={outerClass} key={`${id || name}_wrapper`}>
      <label htmlFor={id || name}>
        {label}
        <input
          id={id || name}
          type="checkbox"
          onChange={onChange}
          key={id || name}
          name={name}
          checked={checked}
        />
      </label>
    </div>
  );
};

const fileInput = options => {
  const {
    label,
    id,
    name,
    placeholder,
    setSrc,
    fileType,
    setFileFolder,
    setFileCharacterization,
    context
  } = options;
  return (
    <FileUploadField
      key={id || name}
      label={label}
      input_id={id || name}
      name={name}
      placeholder={placeholder}
      setSrc={setSrc}
      fileType={fileType}
      setFileFolder={setFileFolder}
      setFileCharacterization={setFileCharacterization}
      context={context}
    />
  );
};

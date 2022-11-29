import React from "react";
import qs from "query-string";
import "../css/ListPages.scss";
import ReactHtmlParser from "react-html-parser";

export function labelAttr(attr, filter, languages) {
  if (attr === "resource_type") return "Type";
  else if (attr === "rights_statement") return "Rights";
  else if (attr === "custom_key") return "Permanent Link";
  else if (attr === "related_url") return "Relation";
  else if (attr === "start_date") return "Date";
  else if (attr === "archive") return "Item";
  else if (filter === "language") return (attr = languages[attr]);
  else return (attr.charAt(0).toUpperCase() + attr.slice(1)).replace("_", " ");
}

export function breadcrumbTitle(title) {
  const titleArray = title.split(",");
  return titleArray[0];
}

export function getCategory(item) {
  return item.collection_category ? "collection" : "archive";
}

export function arkLinkFormatted(customKey) {
  return customKey.split("/").pop();
}

export function htmlParsedValue(value) {
  return value.includes("<a href=") ? ReactHtmlParser(value) : value;
}

export function titleFormatted(item, category) {
  return (
    <h3>
      <a href={`/${category}/${arkLinkFormatted(item.custom_key)}`}>
        {item.title}
      </a>
    </h3>
  );
}
export function dateFormatted(item) {
  if (item.display_date) return item.display_date;
  let circa_date = item.circa ? item.circa : "";
  let end_date = item.end_date ? " - " + yearmonthDate(item.end_date) : "";
  let start_date = item.start_date ? yearmonthDate(item.start_date) : "";
  return circa_date + start_date + end_date;
}

function yearmonthDate(date) {
  if (date.length === 6) {
    return [date.slice(0, 4), "/", date.slice(4)].join("");
  } else return date;
}

export function collectionSizeText(collection) {
  let subCollections = null;
  subCollections =
    collection.subCollection_total != null ? collection.subCollection_total : 0;
  let archives = collection.archives || 0;
  return (
    <div>
      {subCollections > 0 && <div>Collections: {subCollections}</div>}
      {archives > 0 && <div>Items: {archives}</div>}
    </div>
  );
}

export function addNewlineInDesc(content) {
  if (content) {
    content = content.split("\n").map((value, index) => {
      return <p key={index} dangerouslySetInnerHTML={{ __html: value }} />;
    });
    return <span>{content}</span>;
  }
  return <></>;
}

function listValue(category, attr, value, languages) {
  const LinkedFields = [
    "creator",
    "belongs_to",
    "language",
    "medium",
    "resource_type",
    "tags"
  ];
  if (LinkedFields.indexOf(attr) > -1) {
    let attrValue = [value];
    if (["creator", "language"].includes(attr)) {
      attrValue = value;
    }
    let parsedObject = {
      category: category,
      [attr]: attrValue,
      field: "title",
      q: "",
      view: "Gallery"
    };

    if (attr === "language" && languages !== undefined) {
      value = languages[value];
    }
    return <a href={`/search/?${qs.stringify(parsedObject)}`}>{value}</a>;
  } else if (attr === "source" || attr === "related_url") {
    return htmlParsedValue(value);
  } else {
    return value;
  }
}

function textFormat(item, attr, languages, collectionCustomKey, site) {
  if (attr === "display_date" && item[attr] === null) attr = "start_date";
  if (item[attr] === null) return null;
  let category = "archive";
  if (item.collection_category) category = "collection";
  if (Array.isArray(item[attr])) {
    return (
      <div>
        {item[attr].map((value, i) => (
          <span className="list-unstyled" key={i} data-cy="multi-field-span">
            {attr === "belongs_to" && i === 0 ? (
              <a href={`/collection/${arkLinkFormatted(collectionCustomKey)}`}>
                {value}
              </a>
            ) : (
              listValue(category, attr, value, languages)
            )}
          </span>
        ))}
      </div>
    );
  } else if (attr === "identifier") {
    return (
      <a href={`/${category}/${arkLinkFormatted(item.custom_key)}`}>
        {item[attr]}
      </a>
    );
  } else if (attr === "rights_statement") {
    return htmlParsedValue(item[attr]);
  } else if (attr === "custom_key") {
    let redirect = "";
    try {
      const options = JSON.parse(site.siteOptions);
      if (options.redirectURL) {
        redirect = options.redirectURL;
      }
    } catch (error) {
      console.log("Redirect url not defined in site config.");
    }
    return htmlParsedValue(
      `<a href="${redirect}/${item.custom_key}">${redirect}/${item.custom_key}</a>`
    );
  } else if (attr === "description") {
    if (item["description"].length <= 120) {
      return item["description"];
    } else {
      return <MoreLink category={category} item={item} />;
    }
  } else if (attr === "bibliographic_citation") {
    return htmlParsedValue(
      `<a href=${item[attr]}>${item[attr]}</a>`
    );
  } else if (attr === "display_date" || attr === "start_date") {
    return dateFormatted(item);
  } else if (attr === "size") {
    if (category === "collection") return collectionSizeText(item);
    else return 0;
  } else {
    return item[attr];
  }
}

const MoreLink = ({ category, item }) => {
  return (
    <span>
      <span>{item["description"].substring(0, 120)}</span>
      <a
        className="more-link"
        href={`/${category}/${arkLinkFormatted(item.custom_key)}`}
      >
        . . .[more]
      </a>
    </span>
  );
};

const RenderAttribute = ({ item, attribute, languages, site }) => {
  const item_value = textFormat(item, attribute.field, languages, null, site);
  if (item_value) {
    let value_style = attribute.field === "identifier" ? "identifier" : "";
    return (
      <div className="collection-detail">
        <table aria-label="Item Metadata">
          <tbody>
            <tr>
              <th className="collection-detail-key" scope="row">
                {attribute.label}:
              </th>
              <td className={`collection-detail-value ${value_style}`}>
                {attribute.label === "Associated File" ?
                <a href={attribute.value}>{attribute.value}</a>
                :
                {item_value}}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  } else {
    return <></>;
  }
};

const RenderAttrDetailed = ({
  item,
  attribute,
  languages,
  collectionCustomKey,
  type,
  site
}) => {
  const item_value = item[attribute.field];
  const item_label = attribute.label;
  if (textFormat(item, attribute.field, languages, collectionCustomKey, site)) {
    let value_style = attribute.field === "identifier" ? "identifier" : "";
    if (type === "table") {
      if (
        Array.isArray(item_label) &&
        Array.isArray(item_value) &&
        item_label.length >= item_value.length
      ) {
        return item_value.map((i_value, idx) => {
          return (
            <tr
              key={`${item_label}_${idx}`}
              className={item_label[idx].toLowerCase().replace(" ", "_")}
            >
              <th className="collection-detail-key" scope="row">
                {item_label[idx]}
              </th>
              <td className={`collection-detail-value ${value_style}`}>
                {i_value}
              </td>
            </tr>
          );
        });
      } else {
        return (
          <tr
            key={item_label}
            className={item_label.toLowerCase().replace(" ", "_")}
          >
            <th className="collection-detail-key" scope="row">
              {item_label}
            </th>
            <td className={`collection-detail-value ${value_style}`}>
              {textFormat(
                item,
                attribute.field,
                languages,
                collectionCustomKey,
                site
              )}
            </td>
          </tr>
        );
      }
    } else if (type === "grid") {
      return (
        <div
          className={`collection-detail-entry ${item_label
            .toLowerCase()
            .replace(" ", "_")}`}
        >
          <div className="collection-detail-key">{item_label}</div>
          <div className={`collection-detail-value ${value_style}`}>
            {textFormat(
              item,
              attribute.field,
              languages,
              collectionCustomKey,
              site
            )}
          </div>
        </div>
      );
    }
  } else {
    return <></>;
  }
};
export const RenderItems = ({ keyArray, item, languages, site }) => {
  let render_items = [];
  keyArray.forEach((value, index) => {
    render_items.push(
      <RenderAttribute
        item={item}
        attribute={value}
        key={index}
        languages={languages}
        site={site}
      />
    );
  });
  return render_items;
};

export const RenderItemsDetailed = ({
  keyArray,
  item,
  languages,
  collectionCustomKey,
  type = "table",
  site
}) => {
  let render_items_detailed = [];
  keyArray.forEach((value, index) => {
    render_items_detailed.push(
      <RenderAttrDetailed
        item={item}
        attribute={value}
        key={index}
        languages={languages}
        collectionCustomKey={collectionCustomKey}
        type={type}
        site={site}
      />
    );
  });
  return render_items_detailed;
};

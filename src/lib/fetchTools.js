import { API, graphqlOperation, Storage } from "aws-amplify";
import * as queries from "../graphql/queries";
import { language_codes } from "./language_codes";
import { available_attributes } from "./available_attributes";

export function getFile(copyURL, type, component, attr) {
  if (
    (type === "image" || type === "audio") &&
    copyURL &&
    copyURL.indexOf("http") === 0 &&
    copyURL.indexOf(Storage._config.AWSS3.bucket) === -1
  ) {
    const stateObj = {};
    const stateAttr = attr || "copy";
    stateObj[stateAttr] = copyURL;
    component.setState(stateObj);
  } else {
    try {
      fetchCopyFile(copyURL, type, component, attr);
    } catch (error) {
      console.error("Error setting copy for component");
    }
  }
}

export const asyncGetFile = async (copyURL, type, component, attr) => {
  let response = {};
  if (
    (type === "image" || type === "audio") &&
    copyURL &&
    copyURL.indexOf("http") === 0 &&
    copyURL.indexOf(Storage._config.AWSS3.bucket) === -1
  ) {
    response.success = true;
    response.data = copyURL;
    const stateObj = {};
    const stateAttr = attr || "copy";
    stateObj[stateAttr] = response.data;
    component.setState(stateObj);
  } else {
    try {
      response = await fetchCopyFile(copyURL, type, component, attr);
    } catch (error) {
      console.error("Error setting copy for component");
    }
  }
  return response;
};

const fetchCopyFile = async (copyURL, type, component, attr) => {
  let data = null;
  let filename = copyURL;
  let prefix = `public/sitecontent/${type}/${process.env.REACT_APP_REP_TYPE.toLowerCase()}/`;
  if (copyURL.indexOf("https") === 0) {
    filename = copyURL.split("/").pop();
    const bucket = Storage._config.AWSS3.bucket;
    prefix = copyURL
      .replace(`https://${bucket}.s3.amazonaws.com/`, "")
      .replace(filename, "");
  }

  try {
    Storage.configure({
      customPrefix: {
        public: prefix
      }
    });
    const copyLink = await Storage.get(filename);
    console.log(`fetching copy from: ${copyLink}`);
    if (type === "html") {
      const response = await fetch(copyLink);
      data = await response.text();
    } else {
      data = copyLink;
    }
  } catch (error) {
    console.error(
      `Error fetching html for ${component.constructor.name} component`
    );
    console.error(error);
  }
  if (data) {
    const stateObj = {};
    const stateAttr = attr || "copy";
    stateObj[stateAttr] = data;
    component.setState(stateObj);
    return { success: true, data: data };
  } else {
    return { success: false };
  }
};

export const mintNOID = async () => {
  const apiKey = process.env.REACT_APP_MINT_API_KEY;
  const noidLink = process.env.REACT_APP_MINT_LINK;
  const headers = new Headers({
    "X-Api-Key": apiKey
  });
  let response = null;
  try {
    response = await fetch(noidLink, {
      method: "GET",
      mode: "cors",
      headers: headers
    }).then(resp => {
      return resp.json();
    });
  } catch (error) {
    console.error("Error minting noid -- ", error);
  }
  let retVal = null;
  if (response) {
    try {
      retVal = response.message.match(/^New NOID: ([a-zA-Z0-9]+)/)[1];
    } catch (error) {
      console.error("Error extracting noid from response -- ", error);
    }
  }
  return retVal;
};

export const fetchSubjectValues = async () => {
  let sites = [];
  let subjects = [];
  let nextToken = null;
  let items = null;
  do {
    try {
      const results = await fetchObjects(queries.listSites, {
        nextToken: nextToken
      });
      items = results.data.listSites.items;
      nextToken = results.data.listSites.nextToken;
    } catch (error) {
      console.error(`Error fetching sites: ${error}`);
    }
    if (items) {
      sites = sites.concat(items);
    }
  } while (nextToken);
  for (const idx in sites) {
    try {
      const site = sites[idx];
      const subjectList = JSON.parse(site.searchPage).facets.subject.values;
      for (const i in subjectList) {
        if (subjects.indexOf(subjectList[i]) === -1) {
          subjects.push(subjectList[i]);
        }
      }
    } catch (error) {}
  }
  return subjects.sort();
};

export const fetchAvailableDisplayedAttributes = async () => {
  return available_attributes;
};

export const fetchLanguages = async (component, site, key, callback) => {
  const data = language_codes[key];
  if (data !== null) {
    component.setState({ languages: data }, function() {
      if (typeof component.loadItems === "function") {
        component.loadItems();
      }
    });
  }
};

export const fetchSearchResults = async (
  component,
  { filter, sort, limit, nextToken }
) => {
  const REP_TYPE = process.env.REACT_APP_REP_TYPE;
  let archiveFilter = {
    item_category: { eq: REP_TYPE },
    visibility: { eq: true }
  };
  let collectionFilter = {
    collection_category: { eq: REP_TYPE },
    visibility: { eq: true },
    parent_collection: { exists: false }
  };
  let objectFilter = {
    or: [
      {
        collection_category: { eq: REP_TYPE },
        visibility: { eq: true },
        parent_collection: { exists: false }
      },
      {
        item_category: { eq: REP_TYPE },
        visibility: { eq: true }
      }
    ]
  };
  let searchResults = null;
  let category = "";
  let filters = {};
  let andArray = [];
  let allFields = null;
  for (const key of Object.keys(filter)) {
    if (key === "all") {
      allFields = filter["all"];
      delete filter["allFields"];
    } else if (key === "category") {
      category = filter.category;
    } else if (key === "collection") {
      let parent_collection_id = await getCollectionIDByTitle(filter[key]);
      filters["heirarchy_path"] = { eq: parent_collection_id };
    } else if (key === "title" || key === "description") {
      filters[key] = { matchPhrasePrefix: filter[key] };
    } else if (Array.isArray(filter[key])) {
      if (key === "date") {
        filter[key].forEach(function(value) {
          let dates = value.split(" - ");
          andArray.push({
            start_date: {
              gte: `${dates[0]}/01/01`,
              lte: `${dates[1]}/12/31`
            }
          });
        });
      } else {
        filter[key].forEach(function(value) {
          andArray.push({ [key]: { eq: value } });
        });
      }
      filters["and"] = andArray;
    } else {
      filters[key] = { eq: filter[key] };
    }
  }
  let options = {
    filter: filters,
    sort: sort,
    limit: limit,
    nextToken: nextToken
  };
  if (allFields) {
    options["otherArgs"] = { allFields: allFields };
  }
  if (category === "collection") {
    const item_fields = ["format", "medium", "resource_type", "tags"];
    if (
      filters.hasOwnProperty("and") &&
      item_fields.some(e => Object.keys(filter).indexOf(e) > -1)
    ) {
      searchResults = {
        items: [],
        total: 0,
        nextToken: null
      };
    } else {
      options["filter"] = { ...collectionFilter, ...filters };
      let Collections = null;
      if (allFields) {
        Collections = await fetchObjects(queries.fulltextCollections, options);
        searchResults = Collections.data.fulltextCollections;
      } else {
        Collections = await fetchObjects(queries.searchCollections, options);
        searchResults = Collections.data.searchCollections;
      }
    }
  } else if (category === "archive") {
    options["filter"] = { ...archiveFilter, ...filters };
    let Archives = null;
    if (allFields) {
      Archives = await fetchObjects(queries.fulltextArchives, options);
      searchResults = Archives.data.fulltextArchives;
    } else {
      Archives = await fetchObjects(queries.searchArchives, options);
      searchResults = Archives.data.searchArchives;
    }
  } else {
    options["filter"] = { ...objectFilter, ...filters };
    const Objects = await fetchObjects(queries.searchObjects, options);
    searchResults = Objects.data.searchObjects;
  }
  return searchResults;
};

export const getAllCollections = async filter => {
  let collections = [];
  let nextToken = null;
  let items = null;

  do {
    let myFilter = {};
    myFilter["nextToken"] = nextToken;
    if (filter) {
      for (const entry in filter) {
        if (!myFilter.hasOwnProperty(entry)) {
          myFilter[entry] = filter[entry];
        }
      }
    }
    try {
      const results = await fetchObjects(queries.listCollections, myFilter);
      items = results.data.listCollections.items;
      nextToken = results.data.listCollections.nextToken;
    } catch (error) {
      console.error(`Error fetching all collections: ${error}`);
    }
    if (items) {
      collections = collections.concat(items);
    }
  } while (nextToken);
  return collections;
};

const fetchObjects = async (
  gqlQuery,
  { filter, sort, limit, nextToken, otherArgs }
) => {
  const Objects = await API.graphql(
    graphqlOperation(gqlQuery, {
      filter: filter,
      sort: sort,
      limit: limit,
      nextToken: nextToken,
      ...otherArgs
    })
  );
  return Objects;
};

const getCollectionIDByTitle = async title => {
  const Results = await API.graphql(
    graphqlOperation(queries.searchCollections, {
      order: "ASC",
      limit: 1,
      filter: {
        title: {
          eq: title
        }
      }
    })
  );
  let id = null;
  try {
    id = Results.data.searchCollections.items[0].id;
  } catch (error) {
    console.error(`Error getting id for collection title: ${title}`);
  }
  return id;
};

export const getPodcastCollections = async () => {
  let items = null;
  const results = await API.graphql(
    graphqlOperation(queries.searchCollections, {
      order: "ASC",
      filter: {
        collection_category: {
          eq: "podcasts"
        }
      }
    })
  );
  try {
    items = results.data.searchCollections.items;
  } catch (error) {
    console.error(`Error getting podcast collections`);
  }
  return items;
};

export const getTopLevelParentForCollection = async collection => {
  const topLevelId = collection.heirarchy_path[0];
  let retVal = null;
  const response = await API.graphql(
    graphqlOperation(queries.getCollection, {
      id: topLevelId
    })
  );
  try {
    retVal = response.data.getCollection;
  } catch (error) {
    console.error(`Error getting top level parent for: ${collection.id}`);
  }
  return retVal;
};

export const fetchHeirarchyPathMembers = async collection => {
  let retVal = null;
  const orArray = [];
  for (var idx in collection.heirarchy_path) {
    orArray.push({ id: { eq: collection.heirarchy_path[idx] } });
  }
  const response = await API.graphql(
    graphqlOperation(queries.searchCollections, {
      filter: { or: orArray }
    })
  );
  try {
    retVal = response.data.searchCollections.items;
  } catch (error) {
    console.error(`Error getting heirarchy path for: ${collection.id}`);
  }

  return retVal;
};

export const getSite = async () => {
  const REP_TYPE = process.env.REACT_APP_REP_TYPE;
  const apiData = await API.graphql({
    query: queries.siteBySiteId,
    variables: { siteId: REP_TYPE.toLowerCase(), limit: 1 }
  });
  const {
    data: {
      siteBySiteId: { items }
    }
  } = apiData;
  const site = items[0];
  return site;
};

export const getImgUrl = key => {
  let data = null;
  try {
    data = sessionStorage.getItem(key);
  } catch (error) {
    console.log(`${key} not in sessionStorage`);
  }
  if (!data) {
    Storage.configure({
      customPrefix: {
        public: `public/sitecontent/image/${process.env.REACT_APP_REP_TYPE.toLowerCase()}/`
      }
    });
    return Storage.get(key)
      .then(res => res)
      .catch(err => console.log(err));
  } else {
    return data;
  }
};

export const getArchiveByIdentifier = async identifier => {
  const REP_TYPE = process.env.REACT_APP_REP_TYPE;
  const apiData = await API.graphql({
    query: queries.archiveByIdentifier,
    variables: {
      identifier: identifier,
      filter: {
        item_category: { eq: REP_TYPE }
      },
      limit: 1
    }
  });
  const {
    data: {
      archiveByIdentifier: { items }
    }
  } = apiData;
  const archive = items[0];
  return archive;
};

export const getCollectionByIdentifier = async identifier => {
  const REP_TYPE = process.env.REACT_APP_REP_TYPE;
  const apiData = await API.graphql({
    query: queries.collectionByIdentifier,
    variables: {
      identifier: identifier,
      filter: {
        collection_category: { eq: REP_TYPE }
      },
      limit: 1
    }
  });
  const {
    data: {
      collectionByIdentifier: { items }
    }
  } = apiData;
  const collection = items[0];
  return collection;
};

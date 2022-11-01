import React from "react";
import { Route } from "react-router-dom";
import AboutPage from "../pages/AboutPage";
import PermissionsPage from "../pages/PermissionsPage";
import AdditionalPages from "../pages/AdditionalPages";
import CaseStudyUploadPage from "../pages/CaseStudyUploadPage";
const pageComponents = {
  AboutPage: AboutPage,
  PermissionsPage: PermissionsPage,
  CaseStudyUploadPage: CaseStudyUploadPage,
  AdditionalPages: AdditionalPages
};

function route(site, key, path, PageComponent, childKey = null) {
  let elemKey = key;
  if (childKey) {
    elemKey += "." + childKey;
  }
  return (
    <Route
      key={elemKey}
      path={path}
      exact
      render={props => (
        <PageComponent site={site} parentKey={key} childKey={childKey} />
      )}
    />
  );
}

export function buildRoutes(site) {
  let routes = [];
  for (const [key, obj] of Object.entries(JSON.parse(site.sitePages))) {
    const pageComponent = pageComponents[obj.component];
    routes.push(route(site, key, obj.local_url, pageComponent));
    if (obj.children) {
      for (const [childKey, childObj] of Object.entries(obj.children)) {
        const childPageComponent = pageComponents[childObj.component];
        routes.push(
          route(site, key, childObj.local_url, childPageComponent, childKey)
        );
      }
    }
  }
  return routes;
}

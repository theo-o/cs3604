import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../graphql/queries";
import * as mutations from "../graphql/mutations";

export const validEmbargo = item => {
  return !!item["embargo_start_date"] || !!item["embargo_end_date"];
};

export const loadEmbargo = async (itemResponse, setEmbargo) => {
  if (itemResponse && itemResponse.id) {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.getEmbargo, { id: itemResponse.id })
      );
      if (response.data.getEmbargo) {
        setEmbargo(response.data.getEmbargo);
        return response.data.getEmbargo;
      }
    } catch (error) {
      console.error("Error fetching embargo", error);
    }
  }
};

export const createEmbargoRecord = async (item, fullItem, embargo, type) => {
  let embargoMutation = mutations.createEmbargo;
  if (embargo) {
    embargoMutation = mutations.updateEmbargo;
  }
  const embargoObj = {
    id: item.id || fullItem.id,
    identifier: item.identifier || fullItem.identifier,
    start_date: item.embargo_start_date,
    end_date: item.embargo_end_date,
    note: item.embargo_note,
    record_type: type
  };
  await API.graphql({
    query: embargoMutation,
    variables: { input: embargoObj },
    authMode: "AMAZON_COGNITO_USER_POOLS"
  });
};

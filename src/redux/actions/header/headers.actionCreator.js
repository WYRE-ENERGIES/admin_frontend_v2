import headersType from "../../reducers/headers/headers.types";

export const changeSearchDateType = payload => ({
  type: headersType.CHANGE_DATE_TYPE,
  payload,
});

export const changeSearchDate = payload => ({
  type: headersType.CHANGE_DATE,
  payload,
});

import moment from 'moment';
import headersType from './headers.types';

const INITIAL_STATE = {
  selectedDateType: 'monthly',
  selectedDate: moment().format('DD-MM-YYYY'),
};

const headersReducers = (state = INITIAL_STATE, action) => {

  switch (action.type) {

    case headersType.CHANGE_DATE_TYPE:
      return {
        ...state,
        selectedDateType: action.payload,
      };
    case headersType.CHANGE_DATE:
      return {
        ...state,
        selectedDate: action.payload,
      };

    default: return state;

  }

};

export default headersReducers;
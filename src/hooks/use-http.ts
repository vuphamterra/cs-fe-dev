import { useReducer, useCallback } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosInterceptors from '~/api';

const REQUESTING = 'REQUESTING';
const COMPLETED = 'COMPLETED';

type ACTIONTYPE = { type: string; payload?: any };
type CALLBACKTYPE = (res?: any) => void;

const initialState = {
  resData: null,
  isCompleted: true,
  isRequesting: false,
};

const reducer = (state: typeof initialState, action: ACTIONTYPE) => {
  if (action.type === REQUESTING) {
    return { ...state, isCompleted: false, isRequesting: true };
  }
  if (action.type === COMPLETED) {
    return {
      ...state,
      isCompleted: true,
      isRequesting: false,
      resData: action.payload,
    };
  }

  return initialState;
};

const useHttp = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const sendRequest = useCallback(
    async (options: AxiosRequestConfig, successCb: CALLBACKTYPE = () => {}, failureCb: CALLBACKTYPE = () => {}) => {
      dispatch({ type: REQUESTING });
      try {
        const { method, url } = options;
        const res = await axiosInterceptors[method](url, options);
        const { data: { payload } } = res;
        dispatch({ type: COMPLETED, payload });
        if (typeof successCb === 'function') {
          successCb(payload);
        }
      } catch (error) {
        if (typeof failureCb === 'function') {
          failureCb(error);
        }
        dispatch({ type: COMPLETED, payload: null });
      }
    },
    [],
  );

  return {
    sendRequest,
    loading: state.isRequesting,
    completed: state.isCompleted,
    resData: state.resData,
  };
};

export default useHttp;

import React from 'react';
import Api from '../services/Api';

type Props = {
  children: any;
};

type Values = {
  api?: Api;
};

const ApiContext = React.createContext<Values>({});

const ApiProvider = ({ children }: Props) => {
  const token = 'TOKEN_FROM_AUTH_CONTEXT';
  const api = new Api(token);
  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
};

export { ApiProvider };

export default ApiContext;

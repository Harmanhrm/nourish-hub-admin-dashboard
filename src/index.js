import React from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

//Apollo Client
const client = new ApolloClient({
  uri: 'http://localhost:4000/', 
  cache: new InMemoryCache()
});

const container = document.getElementById('root'); 
const root = createRoot(container); 


root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);


// Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

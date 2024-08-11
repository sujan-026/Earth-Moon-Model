import React from 'react';
import EarthMoonSimulation from './EarthMoonSimulation';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400;700&display=swap');

  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
`;

const App = () => {
  return (
    <>
      <GlobalStyle />
      <EarthMoonSimulation />
    </>
  );
};

export default App;
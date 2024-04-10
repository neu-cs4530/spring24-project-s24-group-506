import './App.css';
import './styles.css';
import React from 'react';
import dynamic from 'next/dynamic';
import './styles.css';

//eslint-disable-next-line @typescript-eslint/naming-convention
const DynamicComponentWithNoSSR = dynamic(() => import('../src/App'), { ssr: false });

function NextApp() {
  return <DynamicComponentWithNoSSR />;
}

export default NextApp;

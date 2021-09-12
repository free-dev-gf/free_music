import React from 'react';
import ReactDOM from 'react-dom';
import Application from './Application';
import { inDev } from './utils/helpers';

// react-contexify 会读取环境变量，缺少的话会报错
// @ts-ignore
window.process = {
    env: {
        NODE: 'dev',
    },
};

// Application to Render
const app = <Application ipcRenderer={window.api.ipcRenderer} />;

// Render application in DOM
ReactDOM.render(app, document.getElementById('app'));

// Hot module replacement
if (inDev() && module.hot) module.hot.accept();

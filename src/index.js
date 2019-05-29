import './styles/main.scss';
import React from 'react';
import ReactDOM from 'react-dom';


const appRoot=document.getElementById('app');
const jsx= (
  <div>
    <p>test jsx react</p>
  </div>
);
const pug= pug`
  div.pug-in-react
    p hello
    img(src='assets/img/xiyouji.jpg')
`;
ReactDOM.render(pug,appRoot);
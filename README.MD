webpack4/babel7/react/pug/scss

- css：在入口js中手动引入scss入口文件，配置了postcss自动添加浏览器前缀

- 图片打包：html/css中引用图片都放在assets/img下即可，无需再js中引入

- 无需手动引入polyfill，会根据package.json中的browserslist智能引入polyfill中的模块

- 可以在JSX中使用pug语法

  ```
  const pug_in_jsx = pug`
  	div.test
  		p use pug in jsx
  `;
  ```

- ``` npm run build ``` 打包dist
- ```npm run dev``` 启动web-dev-server
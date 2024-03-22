# GitHub Actions Generator
The GitHub Actions Generator is a tool that allows you to automatically generate GitHub Actions configuration files based on customizable templates provided by the user. With this project, you can automate repetitive tasks and set up custom workflows according to your project's needs.

## Installation
To start using the GitHub Actions Generator, you need to install the npm or yarn package. Run the following command in your terminal:

```bash
npm install gen-github-actions
```
or
```bash
yarn install gen-github-actions
```

## How to Use
After installing the package, you can use the generate command followed by an array of environments for which the files will be generated and whether to use the variables from your env-sample and env-ci=sample. For example:
```javascript
genActions.generate([
{
"<WORKSPACE>": "dev",
"<SERVER_PATH>": "/test/url/",
"<TASK_NAME>": "fill env dev"
},
{
"<WORKSPACE>": "main",
"<SERVER_PATH>": "/test-main/url/",
"<TASK_NAME>": "fill env main"
}
], true, true);
```

## Contribution
If you encounter any issues or have suggestions for improvement, feel free to open an issue in this repository. We welcome contributions from all levels of experience.


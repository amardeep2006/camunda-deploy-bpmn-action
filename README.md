# camunda-deploy-github-action
Reusable GitHub Action to deploy Camunda Models. 

* Supports multiple file formats for deployments (bpmn, dms, form, html, js)
* Deploy Individual model file
* Deploy Multiple files in one go / All files in a folder
* Dynamic directory name in git repo to deploy files from
* Support for deploy-changed-only
* Custom Deployment name
* Support for Basic authentication
* Support for Auth Bearer Token (JWT)
* Multitenant Deployments
* Custom HTTP Headers for Apigee like gateway Authentication
* Log Deployment Summary (Color Coded)
* Checkout specific Tag from Git Repo for deployment

## Example for Using this action to deploy
You can simply refer this github action in any GitHub workflow.

This is just one example, there are lots of configurations available listed in a table in this page.

```yaml
      - name: Deploy Camunda Workflows GitHub Action
        uses: amardeep2006/camunda-deploy-bpmn-action@v1
        with:
          CAMUNDA_ENDPOINT_URL: ${{ env.CAMUNDA_TARGET_API }}
          BPMN_FILE_PATTERN: ${{ github.event.inputs.in_bpmn_pattern }}
          CAMUNDA_AUTH_USERNAME: ${{ secrets.CAMUNDA_API_USER }}
          CAMUNDA_AUTH_PASSWORD: ${{ secrets.CAMUNDA_API_PASSWORD }}
          CAMUNDA_AUTH_BEARER: ""
          DEPLOYMENT_NAME: ${{ github.event.inputs.in_deployment_name }}
          CUSTOM_HTTP_HEADER_NAME : "na"
          CUSTOM_HTTP_HEADER_VALUE: "na"
          BPMN_MODEL_FOLDER: ${{ github.event.inputs.in_bpmn_folder }}
          DEPLOY_CHANGED_ONLY: ${{ github.event.inputs.in_deploy_changed_only }}          
```

Here are all the inputs available through `with`:

| Input               | Description                                                                                                                                          | Default | Required |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `CAMUNDA_ENDPOINT_URL`               | The URL for Camunda REST endpoint e.g. https://camundasandbox.fly.dev/engine-rest                                                                                                                       |         | ✔        |
| `BPMN_FILE_PATTERN`           | Pipe separate glob File patterns to select which all files need to be deployed.  | Multiple patterns are allowed. You may pass name of single file or you may pass multiple file names (Pipe separated) . This is entirely upto you which file/patterns you want to use to choose deployment files.  `*.dmn\|*.bpmn\|*.form\|*.html`   OR `*.bpmn`  |          |
| `CAMUNDA_AUTH_USERNAME`         | Username for Camunda basic Authentication                                                            |         |          |
| `CAMUNDA_AUTH_PASSWORD`            | Password for Camunda basic Authentication |  |          |
| `CAMUNDA_AUTH_BEARER`              | Token for JWT authentication without keyword `Bearer`   |         |          |
| `DEPLOYMENT_NAME`              | Release Name |         |          |
| `CUSTOM_HTTP_HEADER_NAME`             | If you need to pass some token for example x-api-key for apigee                                                                                                |   `x-api-key`      |          |
| `CUSTOM_HTTP_HEADER_VALUE`            | The value of custom token |         |          |
| `BPMN_MODEL_FOLDER`          | The folder name in your repository from where you want to deploy models. Nested folders allowed                                                                                                            |  examples: `models` OR `models/onboarding`        |          |
| `DEPLOY_CHANGED_ONLY`       | Read more at [this link](https://docs.camunda.org/manual/7.18/reference/rest/deployment/post-deployment/#request-body)                                                                                               |  A flag indicating whether the process engine should perform duplicate checking on a per-resource basis. If set to true, only those resources that have actually changed are deployed. Checks are made against resources included previous deployments of the same name and only against the latest versions of those resources. If set to true, the option enable-duplicate-filtering is overridden and set to true.       |          |
| `DEPLOYMENT_SOURCE`     | The source of deployment , Can be a CI/CD pipeline name  | e.g.  `github-action-cd`      |          |



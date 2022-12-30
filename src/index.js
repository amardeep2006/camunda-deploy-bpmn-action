const glob = require('glob');
const isGlob = require('is-glob');
const core = require('@actions/core');
const deploy = require("./deploy");
const path = require('path');

async function run() {


    const BPMN_FILE_PATTERN = core.getInput('BPMN_FILE_PATTERN');
    const BPMN_MODEL_FOLDER = core.getInput('BPMN_MODEL_FOLDER');

    const env =
    {
        CAMUNDA_ENDPOINT_URL: core.getInput("CAMUNDA_ENDPOINT_URL"),
        CAMUNDA_AUTH_USERNAME: core.getInput("CAMUNDA_AUTH_USERNAME"),
        CAMUNDA_AUTH_PASSWORD: core.getInput("CAMUNDA_AUTH_PASSWORD"),
        CAMUNDA_AUTH_BEARER: core.getInput("CAMUNDA_AUTH_BEARER"),
        CUSTOM_HTTP_HEADER_NAME: core.getInput("CUSTOM_HTTP_HEADER_NAME"),
        CUSTOM_HTTP_HEADER_VALUE: core.getInput("CUSTOM_HTTP_HEADER_VALUE")
    };

    const deploymentConfig = {
        tenantId: core.getInput('CAMUNDA_TENANT_ID'),
        source: core.getInput('DEPLOYMENT_SOURCE'),
        name: core.getInput('DEPLOYMENT_NAME'),
        deployChangedOnly: core.getInput('DEPLOY_CHANGED_ONLY')
    };

    // Prepare the direcory to read BPMN Artifacts
    const cwd = process.cwd();

    //Prepare the Pattern Dynamically
    // Some valid pattern 1.  **/models/?(*.dmn|*.bpmn)   2. **/models/?(myworkflow.bpmn)

    const fileSearchGlobPattern = "**/" + BPMN_MODEL_FOLDER + "/?(" + BPMN_FILE_PATTERN + ")";

    console.log("The pattern is : ", fileSearchGlobPattern);
    core.info(`\u001b[43mThe input File Pattern is ${fileSearchGlobPattern} `);


    const resourceGlobs = [fileSearchGlobPattern];
    console.log("Searching for  : " + resourceGlobs);

    //Get the file names to be deployed
    const resources = getAssetPaths(cwd, resourceGlobs);

    console.log("below files will be deployed:");
    resources.forEach(x => { console.log(x.name, x.path) });


    const endpointConfig = getEndpointConfig(env);
    console.log("Deployment started");

    try {
        const deployment = await deploy(endpointConfig, {
            ...deploymentConfig,
            resources
        });


        let createdCount = 0;
        let updatedCount = 0;

        const deployedArtifacts = {};

        [
            { key: 'deployedProcessDefinitions', name: 'processDefinitions' },
            { key: 'deployedCaseDefinitions', name: 'caseDefinitions' },
            { key: 'deployedDecisionDefinitions', name: 'decisionDefinitions' },
            { key: 'deployedDecisionRequirementsDefinitions', name: 'decisionRequirementsDefinitions' }
        ].forEach((deployedType) => {

            const {
                key,
                name
            } = deployedType;

            const deployed = Object.values(deployment[key] || {});

            const actualDeployed = deployed.map(d => ({
                key: d.key,
                resource: d.resource,
                version: d.version,
                versionTag: d.versionTag
            }));

            if (actualDeployed.length) {
                deployedArtifacts[name] = actualDeployed;
            }

            createdCount += actualDeployed.filter(a => a.version === 1).length;
            updatedCount += actualDeployed.filter(a => a.version !== 1).length;
        });

        if (!createdCount && !updatedCount) {
            core.warning('Zero files were updated/added.');
            console.log('Deployment complete no artifacts updated/added');
        } else {
            console.log(createdCount + updatedCount + " Artifacts deployed.");
            core.info(`\u001b[48;2;0;128;0m Artifacts deployed see details below`)
            console.log(createdCount + " Artifacts added.");
            console.log(updatedCount + " Artifacts updated.");
            let result = JSON.stringify(deployedArtifacts);
            core.info(`\u001b[48;2;0;128;0m List of Models ${result}`);
        }
        // console.log("Final deployment result ...")
        // console.log(JSON.stringify(deployedArtifacts));
    } catch (error) {
        core.info('\u001b[48;2;255;0;0mDeployment Faiure.')

        core.setFailed("Deployment Failed,see logs for details.");
    }
}

//Helper Function to get the BPMN/DMN/Html file names
function getAssetPaths(cwd, globs) {
    return Object.keys(
        globs.reduce((assets, maybeGlob) => {
            if (isGlob(maybeGlob)) {
                glob.sync(maybeGlob).forEach((file) => {
                    assets[file] = true;
                });
            } else {
                assets[maybeGlob] = true;
            }

            return assets;
        }, {})
    ).map(name => {
        return { name, path: path.join(cwd, name) };
    });
}

//Helper Function to prepare the Environment
function getEndpointConfig(env) {

    const url = env.CAMUNDA_ENDPOINT_URL;
    const custom_http_header_name = env.CUSTOM_HTTP_HEADER_NAME;
    const custom_http_header_value = env.CUSTOM_HTTP_HEADER_VALUE;

    if (!url) {
        throw new Error('CAMUNDA_ENDPOINT_URL not configured');
    }

    const auth = (
        env.CAMUNDA_AUTH_USERNAME ? {
            type: 'basic',
            username: env.CAMUNDA_AUTH_USERNAME,
            password: env.CAMUNDA_AUTH_PASSWORD
        } : (
            env.CAMUNDA_AUTH_BEARER ? {
                type: 'bearer',
                token: env.CAMUNDA_AUTH_BEARER
            } : {
                type: 'none'
            }
        )
    );

    return {
        url,
        custom_http_header_name,
        custom_http_header_value,
        auth
    };
};

run();

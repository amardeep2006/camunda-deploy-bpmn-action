const fs = require('fs');
const FormData = require('form-data');
var axios = require('axios');


/**
 * Deploy a number of resources to a running Camunda instance.
 * https://docs.camunda.org/manual/7.17/reference/rest/deployment/post-deployment/
 * @example
 * const endpointUrl = 'http://localhost:8080/engine-rest';
 *
 * const result = await deploy(endpointUrl, {
 *   name: 'some-deployment',
 *   resources: [
 *     { name: 'foo.bpmn', path: './foo.bpmn' },
 *     { name: 'script.js', content: 'return false;' }
 *   ]
 * });
 */

module.exports = async function deploy(endpointConfig, deployment) {
    return new Deployer().deploy(endpointConfig, deployment);
}

class Deployer {

    /**
     * Deploy Models to the given endpoint URL.
     */
    async deploy(endpointConfig, deployment) {

        const {
            auth,
            url,
            custom_http_header_name,
            custom_http_header_value
        } = endpointConfig;

        try {

            var data = this.getBody(deployment);
            var config = {
                method: 'post',
                url: `${url}/deployment/create`,
                headers: {
                    ...getAuthHeaders(auth),
                    ...getApigeeHeaders(custom_http_header_name, custom_http_header_value),
                    ...data.getHeaders()
                },
                data: data
            };
            //Make POST Call to Camunda Server
            let response = await axios(config);

            console.log("Status : ", response.status);
            console.log("Response status text : ", response.statusText);

            return response.data;
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log("Deployent failed: ", deployment);
                console.log("Response Data:", error.response.data);
                console.log("Response HTTP status code : ", error.response.status);
            } else if (error.request) {
                // The request was made but no response was received
                console.log(`No response recieved for deployment: ${deployment}`);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            //Uncomment to debug in extreme cases
            //console.log(error.config);
        }

    }

    getBody(deployment) {

        const {
            name,
            source,
            tenantId,
            resources,
            deployChangedOnly
        } = deployment;

        const form = new FormData();

        form.append('deployment-name', name);

        if (tenantId) {
            form.append('tenant-id', tenantId);
        }

        if (source) {
            form.append('deployment-source', source);
        }

        //To Avoid the Duplicate Deployments
        form.append('deploy-changed-only', deployChangedOnly);

        for (const resource of resources) {
            const { name, path } = resource;

            form.append(name, fs.createReadStream(path));
        }

        return form;
    }

}

function getApigeeHeaders(custom_http_header_name, custom_http_header_value) {

    return {
        custom_http_header_value: custom_http_header_value
    }
}


function getAuthHeaders(auth) {

    switch (auth.type) {
        case 'none':
            return {};
        case 'bearer':
            return {
                'Authorization': `Bearer ${auth.token}`
            };
        case 'basic':
            return {
                'Authorization': `Basic ${btoa(`${auth.username}:${auth.password}`)}`
            }
        default:
            throw new Error(`unknown auth type: ${auth.type}`);
    }
}

function btoa(input) {
    return Buffer.from(input, 'utf8').toString('base64');
}
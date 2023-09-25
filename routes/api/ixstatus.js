const axios = require('axios');
const { URL } = require('url');

let api_ix_status = {

    regex_name : /.*\.(?<name>resi\d*-\d*)\..*/,

    fetchStatuses: async function() {
        let result = {};

        // Ein Array von Promises erstellen, das später mit Promise.all aufgelöst wird
        let promises = [];

        for (let i = 1; i <= 12; i++) {
            let url = `https://repo-1.resilienztest.resi00-${i}.elo.cloud/repo-1/ix?cmd=status&mode=text`;
            let promise = axios.get(url)
                .then(response => {
                    let data = this._convertToObj(response)
                    result[`${i}`] = data;
                })
                .catch(error => {
                    let data = this._convertErrorToObj(error);
                    result[`${i}`] = data;
                });
            promises.push(promise);
        }

        // Warten, bis alle Promises aufgelöst sind
        await Promise.all(promises);

        return this._sortObjectByKey(result);
    },

    _convertErrorToObj : function(_error){
        const obj = {};

        obj.name = this._extractGroup( _error.request.host, this.regex_name, "name");
        obj.protocol = _error.request.protocol;
        obj.host = _error.request.host;
        let path = _error.request.path.split("?");
        obj.path = path.length >= 1 ? path[0] : "";
        obj.query = path.length >= 2 ? path[1] : "";
        obj.httpstatus = _error.response.status;
        obj.httpstatustext = _error.response.statusText;

        return obj;
    },

    _convertToObj : function(_response) {
        const obj = {};

        obj.name = this._extractGroup(_response.request.host, this.regex_name, "name");
        obj.protocol = _response.request.protocol;
        obj.host = _response.request.host;
        let path = _response.request.path.split("?");
        obj.path = path.length >= 1 ? path[0] : "";
        obj.query = path.length >= 2 ? path[1] : "";
        obj.httpstatus = _response.status;
        obj.httpstatustext = _response.statusText;

        const arr = _response.data.split('\n').filter(Boolean);
        arr.forEach(entry => {
            const [key, value] = entry.split('=');
            switch (key.toLowerCase()) {
                case 'status':
                    obj.ixstatus = value;
                    break;
                case 'version':
                    obj.version = value;
                    break;
                case 'build':
                    obj.build = value;
                    break;
                case 'streamversion':
                    obj.stream_version = value;
                    break;
                case 'current.time':
                    obj.current_time = value;
                    break;
                default:
                    break;
            }
        });

        return obj;
    },

    _extractGroup : function(inputString, regex, groupName) {
        const match = inputString.match(regex);

        if (match && match.groups && match.groups[groupName]) {
            return match.groups[groupName];
        }

        return null;
    },

    _sortObjectByKey : function(obj) {
        return Object.keys(obj)
            .sort()
            .reduce((sortedObj, key) => {
                sortedObj[key] = obj[key];
                return sortedObj;
            }, {});
    }

}

module.exports = api_ix_status;


var express = require("express");
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var _ = require('lodash');

app.use(cors());
app.use(bodyParser.json());

let port = 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

var projects = [{
    "id": "01abfe27-d7f6-4b26-b816-762241f1f72b",
    "name": "github"
}, {
    "id": "e7762708-35bf-48e7-ae2c-45e031f4bf62",
    "name": "test2ss"
}, {
    "id": "673d8b39-a0c8-40dd-aab4-a43ddfbbe02b",
    "name": "test"
}
];

var riskReports = {
    "01abfe27-d7f6-4b26-b816-762241f1f72b": [{
        "riskReportId": "5eddc4f8-a3f4-4b6d-8947-babde53d7931",
        "highVulnerabilitiesCount": 4,
        "mediumVulnerabilitiesCount": 7,
        "lowVulnerabilitiesCount": 0,
        "totalPackages": 27,
        "directPackages": 8,
        "createdOn": "2019-09-19T20:37:29.330924"
    },
        {
            "riskReportId": "5eddc4f8-a3f4-4b6d-8947-babde53d7932",
            "highVulnerabilitiesCount": 4,
            "mediumVulnerabilitiesCount": 7,
            "lowVulnerabilitiesCount": 1,
            "totalPackages": 27,
            "directPackages": 8,
            "createdOn": "2019-09-22T20:37:29.330924"
        }
    ],
    "673d8b39-a0c8-40dd-aab4-a43ddfbbe02b": [{
        "riskReportId": "36a59362-e2c2-4346-b1da-08726075181f",
        "highVulnerabilitiesCount": 1,
        "mediumVulnerabilitiesCount": 0,
        "lowVulnerabilitiesCount": 0,
        "totalPackages": 250,
        "directPackages": 8,
        "createdOn": "2019-09-23T08:32:17.596454"
    }
    ],
    "e7762708-35bf-48e7-ae2c-45e031f4bf62": []
};

app.get("/projects", (req, res, next) => {
    res.json(projects);
});

app.get("/riskReports", (req, res, next) => {
    var projectId = req.query.projectId;
    res.json(riskReports[projectId]);
});

app.post("/projects", (req, res) => {
    const uuidv1 = require('uuid/v1');
    let id = uuidv1();
    let newProject = {id, name: req.body.projectName};
    projects.push(newProject);
    riskReports[id] = [];
    res.send(newProject);
});

app.put("/projects", (req, res) => {
    let requestBody = req.body;
    console.log(requestBody);
    let project = _.find(projects, project => project.id === requestBody.id) || {};
    if (!_.isEmpty(project)) {
        project.name = requestBody.name;
    }
    res.send(project);
});

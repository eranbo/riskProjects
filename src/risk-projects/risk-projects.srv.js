import _ from 'lodash';

let baseUrl = 'http://localhost:3001'

export default class RiskProjectsService {

    static async getProjects() {
        return fetch(`${baseUrl}/projects`)
            .then(response => response.json(), err => err);
    }

    static async getRiskReports(projectId) {
        return fetch(`${baseUrl}/riskReports?projectId=${projectId}`)
            .then(response => {
                return response.json().then(reports => {
                    _.forEach(reports, report => {
                        report.projectId = projectId;
                    });
                    return reports;
                });
            }, err => err);
    }
}

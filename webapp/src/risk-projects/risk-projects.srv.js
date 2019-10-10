let baseUrl = 'http://localhost:3001';

export default class RiskProjectsService {

    static async getProjects() {
        return fetch(`${baseUrl}/projects`)
            .then(response => response.json(), err => err);
    }

    static async getRiskReports(projectId) {
        return fetch(`${baseUrl}/riskReports?projectId=${projectId}`)
            .then(response => {
                return response.json().then(reports => {
                    return {projectId, reports};
                });
            }, err => err);
    }

    static async addProject(projectName) {
        return fetch(`${baseUrl}/projects`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({projectName})
            })
            .then(response => {
                return response.json();
            });
    }

    static async updateProject(project) {
        return fetch(`${baseUrl}/projects`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: project.id, name: project.name})
            })
            .then(response => {
                return response.json();
            });
    }
}

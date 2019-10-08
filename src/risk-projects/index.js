import React, {Component} from 'react';
import _ from 'lodash';
import moment from 'moment';
import MaterialTable from "material-table";
import Q from 'q';
import Menu from '@material-ui/core/Menu';
import MenuItem from "@material-ui/core/MenuItem";

import './risk-projects.scss';
import styles from "./risk-projects-table.css";
import RiskProjectsService from "./risk-projects.srv";

import riskNone from './images/risk.png';
import riskLow from './images/risk_yellow.png';
import riskMedium from './images/risk_orange.png';
import riskHigh from './images/risk_red.png';
import runScan from './images/run-scan.png';
import menu from './images/ic_sysbar_menu.png';

export default class RiskProjects extends Component {
    constructor(props) {
        super(props);
        this.tableData = [];
        this.state = {
            searchPhrase: '',
            columns: [
                {
                    title: 'Risk level',
                    field: 'calculatedRiskLevel',
                    editable: 'never',
                    searchable: false,
                    render: rowData => <img src={rowData.calculatedRiskLevel.image} alt={`${rowData.calculatedRiskLevel.value}`}/>
                },
                {title: 'Project name', field: 'name'},
                {title: 'Dependencies', field: 'calculatedDependencies', editable: 'never', searchable: false},
                {
                    title: 'Vulnerabilities',
                    field: 'vulnerabilitiesCount',
                    editable: 'never',
                    searchable: false,
                    render: rowData => <VulnerabilitiesCount vulnerabilitiesCount={rowData.vulnerabilitiesCount}/>
                },
                {
                    title: 'Last scanned',
                    field: 'createdOn',
                    editable: 'never',
                    searchable: false,
                    render: rowData => <span>{rowData.createdOn ? moment(rowData.createdOn).fromNow() : 'Never scanned'}</span>
                },
            ],
            data: [],
            menuAnchorElement: null
        };
    }

    componentDidMount = async () => {
        let projects = await RiskProjectsService.getProjects();
        let riskReportsPromises = [];
        _.forEach(projects, project => {
            riskReportsPromises.push(RiskProjectsService.getRiskReports(project.id));
        });

        Q.all(riskReportsPromises).then(allRiskReports => {
            _.forEach(allRiskReports, reports => {
                if (!_.isEmpty(reports)) {
                    let latestReport = _.chain(reports).orderBy(report => report.createdOn, 'desc').head().value();
                    let rowData = {
                        projectId: latestReport.projectId,
                        calculatedRiskLevel: this.calculateRiskLevel(latestReport),
                        name: (_.find(projects, project => project.id === latestReport.projectId)).name,
                        calculatedDependencies: latestReport.totalPackages ? `${latestReport.totalPackages}(${latestReport.directPackages})` : 'No dependencies',
                        vulnerabilitiesCount: {low: latestReport.lowVulnerabilitiesCount, medium: latestReport.mediumVulnerabilitiesCount, high: latestReport.highVulnerabilitiesCount},
                        createdOn: latestReport.createdOn
                    };
                    this.tableData.push(rowData);
                }
            });
            this.setState({data: this.tableData});
        });
    };

    calculateRiskLevel = (riskReport) => {
        if (riskReport.highVulnerabilitiesCount) {
            return {value: 'high', image: riskHigh};
        }
        if (riskReport.mediumVulnerabilitiesCount) {
            return {value: 'medium', image: riskMedium};
        }
        if (riskReport.lowVulnerabilitiesCount) {
            return {value: "low", image: riskLow};
        }
        return {value: 'none', image: riskNone};
    };

    runScan = (event, rowData) => {
        console.log('run scan', event, rowData);
    };

    openMenu = (event, rowData) => {
        this.setState({menuAnchorElement: event.currentTarget});
    };

    handleCloseMenu = () => {
        this.setState({menuAnchorElement: null});
    };

    addProject = () => {
        let rowData = {
            projectId: 'newProjectId',
            calculatedRiskLevel: {value: 'none', image: riskNone},
            name: 'New Project',
            calculatedDependencies: 'No dependencies',
            vulnerabilitiesCount: {low: 0, medium: 0, high: 0},
            createdOn: null
        };
        this.tableData.push(rowData)
        this.setState({data: this.tableData});
    };

    render() {
        return (
            <div className="risk-projects portlet">
                <div className="title">Risk Projects</div>
                <MaterialTable
                    style={styles.tableContainer}
                    options={{
                        searchFieldAlignment: 'left',
                        actionsColumnIndex: -1,
                        searchFieldStyle: styles.searchTable,
                        showTitle: false,
                    }}
                    columns={this.state.columns}
                    data={this.state.data}
                    actions={[
                        {
                            icon: () => <img src={menu} alt={'Menu'}/>,
                            onClick: this.openMenu,
                            tooltip: 'Menu'
                        },
                        {
                            icon: () => <img src={runScan} alt={'Run Scan'}/>,
                            onClick: this.runScan,
                            tooltip: 'Run Scan'
                        },
                        {
                            icon: 'add',
                            tooltip: 'Add Project',
                            isFreeAction: true,
                            onClick: this.addProject
                        }
                    ]}
                    editable={{
                        onRowUpdate: (newData, oldData) =>
                            new Promise(resolve => {
                                setTimeout(() => {
                                    resolve();
                                    const data = [...this.state.data];
                                    data[data.indexOf(oldData)] = newData;
                                    this.setState({...this.state, data});
                                }, 600);
                            }),
                    }}
                />
                <Menu id="simple-menu"
                      anchorEl={this.state.menuAnchorElement}
                      keepMounted
                      open={Boolean(this.state.menuAnchorElement)}
                      onClose={this.handleCloseMenu}
                >
                    <MenuItem onClick={this.handleCloseMenu}>Project configuration</MenuItem>
                    <MenuItem onClick={this.handleCloseMenu}>Scan history</MenuItem>
                    <MenuItem onClick={this.handleCloseMenu}>Delete</MenuItem>
                </Menu>
            </div>
        )
    }
}

const VulnerabilitiesCount = ({vulnerabilitiesCount}) => {
    let total = _.reduce(vulnerabilitiesCount, (result, value) => result + value, 0);
    return (
        total ?
            <div>
            <span className={'vulnerabilityCount high'}
                  style={{width: `${Math.round((vulnerabilitiesCount.high / total) * 100)}%`}}>{vulnerabilitiesCount.high ? vulnerabilitiesCount.high : null}</span>
                <span className={'vulnerabilityCount medium'}
                      style={{width: `${Math.round((vulnerabilitiesCount.medium / total) * 100)}%`}}>{vulnerabilitiesCount.medium ? vulnerabilitiesCount.medium : null}</span>
                <span className={'vulnerabilityCount low'}
                      style={{width: `${Math.round((vulnerabilitiesCount.low / total) * 100)}%`}}>{vulnerabilitiesCount.low ? vulnerabilitiesCount.low : null}</span>
            </div>
            :
            <span>No vulnerabilities</span>
    )
};

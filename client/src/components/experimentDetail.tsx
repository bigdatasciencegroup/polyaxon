import * as _ from 'lodash';
import * as React from 'react';

import { Bookmark } from '../constants/bookmarks';
import {
  getExperimentUrl,
  getGroupUrl,
  getProjectUrl,
  getUserUrl,
  isTrue,
  splitUniqueName,
} from '../constants/utils';
import EntityBuild from '../containers/EntityBuild';
import ExperimentJobs from '../containers/experimentJobs';
import Logs from '../containers/logs';
import Metrics from '../containers/metrics';
import Statuses from '../containers/statuses';
import { ExperimentModel } from '../models/experiment';
import Breadcrumb from './breadcrumb';
import { EmptyList } from './empty/emptyList';
import ExperimentOverview from './experimentOverview';
import ExperimentInstructions from './instructions/experimentInstructions';
import LinkedTab from './linkedTab';
import YamlText from './yamlText';

export interface Props {
  experiment: ExperimentModel;
  onDelete: () => any;
  fetchData: () => any;
  bookmark: () => any;
  unbookmark: () => any;
}

export default class ExperimentDetail extends React.Component<Props, Object> {
  public componentDidMount() {
    this.props.fetchData();
  }

  public render() {
    const experiment = this.props.experiment;
    if (_.isNil(experiment)) {
      return EmptyList(false, 'experiment', 'experiment');
    }

    const bookmark: Bookmark = {
      active: isTrue(this.props.experiment.bookmarked),
      callback: isTrue(this.props.experiment.bookmarked) ? this.props.unbookmark : this.props.bookmark
    };
    const values = splitUniqueName(experiment.project);
    const experimentUrl = getExperimentUrl(values[0], values[1], this.props.experiment.id);
    let group = null;
    if (!_.isNil(experiment.experiment_group)) {
      group = parseInt(splitUniqueName(experiment.experiment_group)[2], 10);
    }
    const projectUrl = getProjectUrl(values[0], values[1]);
    let breadcrumbLinks: Array<{name: string; value?: string|undefined}>;
    breadcrumbLinks = [
      {name: values[0], value: getUserUrl(values[0])},
      {name: values[1], value: projectUrl}];
    if (group) {
      const groupUrl = getGroupUrl(values[0], values[1], group);
      breadcrumbLinks.push(
        {name: `Group ${group}`, value: groupUrl},
        {name: 'Experiments', value: `${groupUrl}#experiments`});
    } else {
      breadcrumbLinks.push({name: 'Experiments', value: `${projectUrl}#experiments`});
    }
    breadcrumbLinks.push({name: `Experiment ${experiment.id}`});

    return (
      <div className="row">
        <div className="col-md-12">
          <div className="entity-details">
            <Breadcrumb
              icon="fa-cube"
              links={breadcrumbLinks}
              bookmark={bookmark}
            />
            <LinkedTab
              baseUrl={experimentUrl}
              tabs={[
                {
                  title: 'Overview',
                  component: <ExperimentOverview experiment={experiment}/>,
                  relUrl: ''
                }, {
                  title: 'Logs',
                  component: <Logs
                    fetchData={() => null}
                    logs={''}
                    user={experiment.user}
                    project={experiment.project}
                    resource="experiments"
                    id={experiment.id}
                  />,
                  relUrl: 'logs'
                }, {
                  title: 'Jobs',
                  component: <ExperimentJobs
                    fetchData={() => null}
                    user={experiment.user}
                    experiment={experiment}
                  />,
                  relUrl: 'jobs'
                }, {
                  title: 'Build',
                  component: <EntityBuild buildName={experiment.build_job}/>,
                  relUrl: 'build'
                }, {
                  title: 'Statuses',
                  component: <Statuses
                    project={experiment.project}
                    resource="experiments"
                    id={experiment.id}
                  />,
                  relUrl: 'statuses'
                }, {
                  title: 'Metrics',
                  component: <Metrics
                    project={experiment.project}
                    resource="experiments"
                    id={experiment.id}
                  />,
                  relUrl: 'metrics'
                }, {
                  title: 'Config',
                  component: <YamlText title="Config" config={experiment.config}/>,
                  relUrl: 'config'
                }, {
                  title: 'Instructions',
                  component: <ExperimentInstructions id={experiment.id}/>,
                  relUrl: 'instructions'
                }
              ]}
            />
          </div>
        </div>
      </div>
    );
  }
}

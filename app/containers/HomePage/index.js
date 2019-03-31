/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import { Row, Col, Button, Input, Table, Pagination, Icon } from 'antd';
import styled from 'styled-components';
import campaigns from './campaigns';
const Wrapper = styled.div`
  width: 1140px;
  position: absolute;
  top: 10%;
  left: 10%;

  /* bring your own prefixes */
`;
/* eslint-disable react/prefer-stateless-function */
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Type',
    dataIndex: 'type',
  },
  {
    title: 'Company',
    dataIndex: 'company',
  },
  {
    title: 'Actions',
    dataIndex: 'address',
  },
];

export default class HomePage extends React.PureComponent {
  constructor(props) {
    super(props);
    const pageLimit = 10;
    this.state = {
      selectedCampaigns: [],
      campaignsList: this.getCampaignsList(),
      page: 1,
      pageLimit,
    };
    this.currentRecordIndex = pageLimit;
  }

  getCampaignsList = pagination => {
    const campaignsList = campaigns
      .slice()
      .map(campaign => ({ ...campaign, key: campaign._id }));
    if (pagination) {
      const { page } = pagination;
      const { pageLimit } = this.state;
      if (page === 1) {
        return campaignsList.slice(0, pageLimit);
      }
      const { currentRecordIndex } = this;
      const newRecordIndex = page * pageLimit;
      this.currentRecordIndex = newRecordIndex;

      if (newRecordIndex > currentRecordIndex) {
        return campaignsList.slice(currentRecordIndex + 1, newRecordIndex + 1);
      }
      if (newRecordIndex < currentRecordIndex) {
        return campaignsList.slice(currentRecordIndex + 1, newRecordIndex + 1);
      }
    }
    return campaignsList;
  };

  paginateData = mode => {
    this.setState(prevState => {
      const page = mode === 'next' ? prevState.page + 1 : this.state.page - 1;
      const campaignsList = this.getCampaignsList({ page });
      return {
        campaignsList,
        page,
      };
    });
  };

  getColumns = () => {
    columns[3].render = (text, record) => (
      <Icon
        type="delete"
        onClick={() => {
          this.deleteCampaigns([record._id]);
        }}
      />
    );
    return columns;
  };

  deleteSelected = () => {
    this.deleteCampaigns(this.state.selectedCampaigns, () =>
      this.setState({ selectedCampaigns: [] }),
    );
  };

  deleteCampaigns = (campaigns, callback) => {
    this.setState(
      prevState => {
        let { campaignsList, selectedCampaigns } = prevState;
        campaignsList = campaignsList.filter(
          campaign => campaigns.indexOf(campaign._id) === -1,
        );
        selectedCampaigns = [];
        return { campaignsList, selectedCampaigns };
      },
      () => callback && callback(),
    );
  };

  setSelectedCampaigns = selectedCampaignsDetails => {
    const selectedCampaigns = selectedCampaignsDetails.map(
      campaign => campaign._id,
    );
    this.setState({ selectedCampaigns });
  };

  filterCampaings = ev => {
    const { value } = ev.target;
    this.setState(prevState => {
      const { campaignsList } = prevState;
      let newCampaignsList = campaignsList.slice();
      if (value.trim() !== '') {
        newCampaignsList = campaignsList.filter(
          campaign =>
            campaign.name.toLowerCase().indexOf(value.toLowerCase()) > -1,
        );
      } else {
        newCampaignsList = this.getCampaignsList();
      }

      return { campaignsList: newCampaignsList };
    });
  };

  render() {
    const { campaignsList, selectedCampaigns } = this.state;
    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.setSelectedCampaigns(selectedRows);
      },
      onSelectInvert: selectedRows => {
        this.setSelectedCampaigns(selectedRows);

        if (selectedRows.length === 0) {
          this.hideMultiSelectionActions();
        }
      },
      onSelectAll: (selected, selectedRows) => {
        this.setSelectedCampaigns(selectedRows);
      },
    };
    return (
      <Wrapper>
        <Row>
          <Row>
            <Col>
              <Input
                onChange={this.filterCampaings}
                placeholder="Search with name"
              />
            </Col>
          </Row>
          <Row>
            {selectedCampaigns.length ? (
              <Button onClick={this.deleteSelected}>
                Delete selcted campaigns
              </Button>
            ) : (
              ''
            )}
          </Row>
          <Row>
            <Table
              columns={this.getColumns()}
              dataSource={campaignsList}
              rowSelection={rowSelection}
              pagination={<Pagination defaultPageSize={10} />}
            />
          </Row>
        </Row>
        {this.state.page > 1 && (
          <Button onClick={() => this.paginateData('prev')}> Prev</Button>
        )}

        {this.state.page < 10 && (
          <Button onClick={() => this.paginateData('next')}> Next</Button>
        )}
      </Wrapper>
    );
  }
}

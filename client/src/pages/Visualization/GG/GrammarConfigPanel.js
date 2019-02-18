import React, { PureComponent } from 'react';
import { Row, Col, Select, Tabs } from 'antd';
import { connect } from 'dva';

import GeomConfigPanel from './GeomConfigPanel';
import styles from './GrammarConfigPanel.less';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

@connect(({ gg }) => ({
  gg,
}))
class GrammarConfigPanel extends PureComponent {
  constructor(props) {
    super(props);

    this.newTabIndex = 0;
    const panes = [];

    const { gg } = this.props;
    this.buildPanel(gg.grammar.geom, panes);

    this.state = {
      activeKey: panes[0].key,
      panes,
    };
  }

  buildPanel = (geom, panes) => {
    Object.entries(geom).map(item => {
      const activeKey = item[0];
      panes.push({ title: item[0], content: '', key: item[0] });
    });
  };

  onTabChange = activeKey => {
    this.setState({ activeKey });
  };

  onTabEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  add = () => {
    const panes = this.state.panes;
    const activeKey = `Geom_${this.newTabIndex++}`;
    panes.push({ title: `Geom${this.newTabIndex}`, content: '', key: activeKey });
    this.setState({ panes, activeKey });
  };

  remove = targetKey => {
    const { dispatch } = this.props;
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (panes.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    } else {
      activeKey = null;
    }

    this.setState({ panes, activeKey });
    this.newTabIndex--;
    dispatch({
      type: 'gg/geomDelete',
      payload: targetKey,
    });
  };

  render() {
    const { gg, dispatch } = this.props;
    const { currentDataset } = gg;
    const facatOptions = [];

    const handleGeomUpdate = (type, value, key) => {
      let payload = {};
      payload.key = key;
      payload.value = {};
      payload.value[type] = value;
      dispatch({
        type: 'gg/geomUpdate',
        payload: payload,
      });
    };

    const handlefacatUpdate = value => {
      dispatch({
        type: 'gg/facatUpdate',
        payload: value,
      });
    };

    const handleCoordinationUpdate = value => {
      dispatch({
        type: 'gg/coordUpdate',
        payload: value,
      });
    };

    const coordStr = ['rect', 'polar', 'theta', 'helix'];
    const coordList = coordStr.map(value => {
      return <Option key={value}>{value}</Option>;
    });

    if (currentDataset && currentDataset.columns) {
      currentDataset.columns.map(col => {
        facatOptions.push(<Option key={col.key}>{col.key}</Option>);
      });
    }

    const facatValue = gg.grammar.facat ? gg.grammar.facat : [];
    const coordinationValue = gg.grammar.coordination ? gg.grammar.coordination : [];
    const getGeom = function(key) {
      return gg.grammar.geom[key];
    };

    return (
      <div className={styles.grammarConfigPanel}>
        <Row gutter={16}>
          facat:
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Please select facat"
            onChange={handlefacatUpdate}
            value={facatValue}
          >
            {facatOptions}
          </Select>
        </Row>

        <Row gutter={16}>
          Coordination:
          <Select
            style={{ width: '100%' }}
            placeholder="Please select coordination"
            onChange={handleCoordinationUpdate}
            value={coordinationValue}
          >
            {coordList}
          </Select>
        </Row>
        <Row gutter={16}>
          <Tabs
            onChange={this.onTabChange}
            activeKey={this.state.activeKey}
            type="editable-card"
            onEdit={this.onTabEdit}
            tabPosition="top"
            style={{ 'margin-top': '10px' }}
          >
            {this.state.panes.map(pane => (
              <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
                <GeomConfigPanel
                  geomKey={pane.key}
                  geomValues={getGeom(pane.key)}
                  cols={currentDataset.columns}
                  handleUpdate={handleGeomUpdate}
                />
              </TabPane>
            ))}
          </Tabs>
        </Row>
      </div>
    );
  }
}

export default GrammarConfigPanel;
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Table,
  Modal,
  Icon,
  Dropdown,
  Menu,
  Badge,
  Select,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import UserCard from './UserCard';
import { formatTimestamp } from '../../utils/utils';

import styles from './UserList.less';

@connect(state => ({
  loading: state.loading.models.user,
  user: state.user,
  role: state.role,
}))
@Form.create()
export default class UserList extends PureComponent {
  state = {
    selectedRows: [],
  };

  componentDidMount() {
    this.dispatch({
      type: 'role/fetchSelect',
    });

    this.dispatch({
      type: 'user/fetch',
      search: {},
      pagination: {},
    });
  }

  onDelBatchOKClick = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) {
      return;
    }
    this.setState({
      selectedRows: [],
    });
    this.dispatch({
      type: 'user/delMany',
      payload: { batch: selectedRows.join(',') },
    });
  };

  onBatchDelClick = () => {
    Modal.confirm({
      title: '确认删除选中的数据吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: this.onDelBatchOKClick.bind(this),
    });
  };

  onItemDisableClick = id => {
    this.dispatch({
      type: 'user/changeStatus',
      payload: { record_id: id, status: 2 },
    });
  };

  onItemEnableClick = id => {
    this.dispatch({
      type: 'user/changeStatus',
      payload: { record_id: id, status: 1 },
    });
  };

  onItemEditClick = id => {
    this.dispatch({
      type: 'user/loadForm',
      payload: {
        type: 'E',
        id,
      },
    });
  };

  onAddClick = () => {
    this.dispatch({
      type: 'user/loadForm',
      payload: {
        type: 'A',
      },
    });
  };

  onDelOKClick(id) {
    this.dispatch({
      type: 'user/del',
      payload: { record_id: id },
    });
  }

  onItemDelClick = item => {
    Modal.confirm({
      title: `确定删除【用户数据：${item.name}】？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: this.onDelOKClick.bind(this, item.record_id),
    });
  };

  onTableSelectRow = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  onTableChange = pagination => {
    this.dispatch({
      type: 'user/fetch',
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
    });
  };

  onResetFormClick = () => {
    const { form } = this.props;
    form.resetFields();
    this.dispatch({
      type: 'user/fetch',
      search: {},
      pagination: {},
    });
  };

  onSearchFormSubmit = e => {
    if (e) {
      e.preventDefault();
    }
    const { form } = this.props;
    form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        this.dispatch({
          type: 'user/fetch',
          search: values,
          pagination: {},
        });
      }
    });
  };

  onDataFormSubmit = data => {
    this.dispatch({
      type: 'user/submit',
      payload: data,
    });
  };

  onDataFormCancel = () => {
    this.dispatch({
      type: 'user/changeFormVisible',
      payload: false,
    });
  };

  dispatch = action => {
    const { dispatch } = this.props;
    dispatch(action);
  };

  renderDataForm() {
    return <UserCard onCancel={this.onDataFormCancel} onSubmit={this.onDataFormSubmit} />;
  }

  renderSearchForm() {
    const {
      form: { getFieldDecorator },
      role: { selectData: roleData },
    } = this.props;
    return (
      <Form onSubmit={this.onSearchFormSubmit} layout="inline">
        <Row gutter={16}>
          <Col md={8} sm={24}>
            <Form.Item label="用户名">
              {getFieldDecorator('user_name')(<Input placeholder="请输入" />)}
            </Form.Item>
          </Col>
          <Col md={8} sm={24}>
            <Form.Item label="真实姓名">
              {getFieldDecorator('real_name')(<Input placeholder="请输入" />)}
            </Form.Item>
          </Col>
          <Col md={8} sm={24}>
            <Form.Item label="所属角色">
              {getFieldDecorator('role_id')(
                <Select style={{ width: '100%' }} placeholder="请选择">
                  {roleData.map(item => (
                    <Select.Option key={item.record_id} value={item.record_id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={8} sm={24}>
            <Form.Item label="用户状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Select.Option value="1">正常</Select.Option>
                  <Select.Option value="2">停用</Select.Option>
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col md={8} sm={24}>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ marginBottom: 24 }}>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.onResetFormClick}>
                  重置
                </Button>
              </span>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      loading,
      user: {
        data: { list, pagination },
      },
    } = this.props;

    const { selectedRows } = this.state;

    const columns = [
      {
        dataIndex: 'record_id',
        width: 80,
        render: (val, record) => (
          <div>
            {
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item>
                      <a
                        onClick={() => {
                          this.onItemEditClick(val);
                        }}
                      >
                        编辑
                      </a>
                    </Menu.Item>
                    <Menu.Item>
                      {record.status === 1 ? (
                        <a
                          onClick={() => {
                            this.onItemDisableClick(val);
                          }}
                        >
                          设置为停用
                        </a>
                      ) : (
                        <a
                          onClick={() => {
                            this.onItemEnableClick(val);
                          }}
                        >
                          设置为启用
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      <a
                        onClick={() => {
                          this.onItemDelClick(record);
                        }}
                      >
                        删除
                      </a>
                    </Menu.Item>
                  </Menu>
                }
              >
                <a>
                  操作 <Icon type="down" />
                </a>
              </Dropdown>
            }
          </div>
        ),
      },
      {
        title: '用户名',
        dataIndex: 'user_name',
      },
      {
        title: '真实姓名',
        dataIndex: 'real_name',
      },
      {
        title: '角色名称',
        dataIndex: 'role_names',
        render: val => <span>{val.join(';')}</span>,
      },
      {
        title: '用户状态',
        dataIndex: 'status',
        render: val => {
          if (val === 1) {
            return <Badge status="success" text="启用" />;
          }
          return <Badge status="error" text="停用" />;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'created',
        render: val => <span>{formatTimestamp(val)}</span>,
      },
    ];

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: total => <span>共{total}条</span>,
      ...pagination,
    };

    return (
      <PageHeaderLayout title="用户管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSearchForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.onAddClick()}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button icon="delete" type="danger" onClick={() => this.onBatchDelClick()}>
                    删除
                  </Button>
                </span>
              )}
            </div>
            <div>
              <Table
                rowSelection={{
                  selectedRowKeys: selectedRows,
                  onChange: this.onTableSelectRow,
                }}
                loading={loading}
                rowKey={record => record.record_id}
                dataSource={list}
                columns={columns}
                pagination={paginationProps}
                onChange={this.onTableChange}
                size="small"
              />
            </div>
          </div>
        </Card>
        {this.renderDataForm()}
      </PageHeaderLayout>
    );
  }
}

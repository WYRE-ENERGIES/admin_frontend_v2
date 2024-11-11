import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Modal, notification, Table, Space, Card } from 'antd';

// import AdminBranchUsersViewTable from '../../../components/tables/adminTables/AdminBranchUsersViewTable';
// import AdminBranchDevicesViewTable from '../../../components/tables/adminTables/AdminBranchDevicesViewTable';
// import AdminBranchEnergyStatsViewTable from '../../../components/tables/adminTables/AdminBranchEnergyStatsViewTable';

import { connect, useSelector } from 'react-redux';
// import { getABranch, getABranchEnergyStats } from '../../../redux/actions/branches/branches.action';

import moment from 'moment';
import { useSearchParams } from 'react-router-dom';
import { getBranchDetailsData } from '../../redux/actions/branch/branch.action';



function BranchDetails(props) {

    const [searchParams] = useSearchParams();
    const headers = '';
    const [dateChange, setDateChange] = useState(false);

    // const branch_id_ = searchParams.get("branch_id") || props.auth.deviceData.user_id;
    console.log("Auths data ==> ", props.auth.userData.client_id);
    console.log("Branch Redux State ==> ", props.branchPage.branchDetailsData);
    

    const userRoletextData = 'props.auth.userData.role_text';

    useEffect(() => {
        const branch_id = searchParams.get("ee")

        if (dateChange !== headers.selectedDate) {
            setDateChange(headers.selectedDate);
            props.getBranchDetailsData(branch_id);
        }
    }, [headers.selectedDate]);
    
    const data = props.branchPage.branchDetailsData;
    let arrayData = []
    arrayData.push(props.branchPage.branchDetailsData)
    console.log("Array of Data ==> ", data);

    const column = [
      {
        title: "address",
        dataIndex: "address",
        key: "address",
      },
      {
        title: "email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "name",
        dataIndex: "name",
        key: "name",
      },
    ];

    return (
        <>
            <article className='total-energy-bar-chart'>
            {/* <article className='table-with-header-container h-no-mt'> */}
                {/* <div className='table-header h-border-bottom'>
                    <h3 className='table-header__heading'>{props.branches?.fetchedBranch[0]?.name}</h3>
                </div>
                <Spin spinning={props.branches?.fetchBranchLoading}>
                    <div className="view_branch_top">
                        <Row>
                            <Col md={8}>
                                <div>
                                    <p className='view_branch-text'>Total Energy: <span>{props.branches?.fetchedBranch[0]?.total_energy.toFixed(2)}</span></p>
                                    <p className='view_branch-text'>Cost of Energy: <span> {props.branches?.fetchedBranch[0]?.energy_cost.toFixed(2)}</span></p>
                                </div>
                            </Col>
                            <Col md={8}>
                                <div>
                                    <p className='view_branch-text'>Fuel Efficiency: <span> {props.branches?.fetchedBranch[0]?.fuel_efficiency.toFixed(2)}</span></p>
                                    <p className='view_branch-text'>PAPR: <span>{props.branches?.fetchedBranch[0]?.papr?.toFixed(2)}</span></p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Spin> */}
                <div className='h-overflow-auto'>
                    <div className='text-center'>
                        <h3 className='table-header__heading'>Branch Details</h3>
                    </div>
                    {/* <AdminBranchDevicesViewTable
                        loading={props.devices?.fetchDeviceOverviewLoading}
                        listOfDevicesData={props.devices?.fetchedDeviceOverview}
                        deviceType={props.devices?.fetchedDeviceType}
                        setVisibleDevice={setVisibleDevice}
                        setDeviceData={setDeviceData}
                        setDeviceSwitch={setDeviceSwitch}
                        setCheckedStatus={setCheckedStatus}
                        userRoletextData={userRoletextData}
                    /> */}
                    <div style={{width: "100%"}}>
                    <Space>
                        <Card>
                            <h1>Total energy</h1>
                            {data.name}
                        </Card>
                        <Card>
                           <h1>Power Demand</h1>
                            {data.address}
                        </Card>
                        <Card>
                            <h1>Carbon Emmission</h1>
                            {data.email}
                        </Card>
                        <Card>
                            <h1>Blended Cost of Energy</h1>
                            {data.name}
                        </Card>
                    </Space>
                    </div>
                    <div style={{width: "100%"}}>
                    <Space className='device_Consumption'>
                        <Card className='device_card_size'>
                            <h1>Utility</h1>
                            {data.email}
                        </Card>
                        <Card className='device_card_size'>
                            <h1>Generator</h1>
                            {data.email}
                        </Card>
                        {/* <Card className='device_card_size'>
                            <h1>Generator 2</h1>
                            {data.email}
                        </Card> */}
                    </Space>
                    </div>
                </div>
                <div className='h-overflow-auto'>
                    <div className='text-center'>
                        <h3 className='table-header__heading'>Users</h3>
                    </div>

                    {/* <AdminBranchUsersViewTable
                        loading={props.user?.fetchUserOverviewLoading}
                        branchName={props.branches?.fetchedBranch[0]?.name}
                        listOfBranchUsersViewData={props.user?.fetchedUserOverview}
                        showUserModal={setVisibleUser}
                        setUserData={setUserData}
                        setUserSwitch={setUserSwitch}
                        userRoletextData={userRoletextData}
                    /> */}
                </div>
                <div className='h-overflow-auto'>
                    <div className='text-center'>
                        {/* <h3 className='table-header__heading'>Energy Stats</h3> */}
                    </div>
                    {/* <AdminBranchEnergyStatsViewTable
                        loading={props.branches?.fetchBranchEnergyStatsLoading}
                        listOfBranchEnergyStatsViewData={props.branches?.fetchedBranchEnergyStats}
                    /> */}
                </div>
            </article>

        </>
    );
}

const mapDispatchToProps = {
    getBranchDetailsData,
    // getABranch,
    // getABranchEnergyStats,
    // getDevicesOverview,
    // getDeviceTypes,
    // disableDevice,
    // getUsersOverview,
    // removeUser,
    // // disableUser,
    // updateUser,
}

const mapStateToProps = (state) => ({
    branchPage: state.branchPage,
    auth: state.auth,
    // devices: state.devices,
    // user: state.user
});

export default connect(mapStateToProps, mapDispatchToProps)(BranchDetails)
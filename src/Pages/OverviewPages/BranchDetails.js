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

    useEffect(() => {
        const branch_id = searchParams.get("ee")

        if (dateChange !== headers.selectedDate) {
            setDateChange(headers.selectedDate);
            props.getBranchDetailsData(branch_id);
        }
    }, [headers.selectedDate]);
    
    const data = props.branchPage.branchDetailsData;

    return (
        <>
            <article className='total-energy-bar-chart'>
                <div className='h-overflow-auto'>
                    <div className='text-center'>
                        <h3 className='table-header__heading'>Branch Details</h3>
                    </div>
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
                    </Space>
                    </div>
                </div>
            </article>

        </>
    );
}

const mapDispatchToProps = {
    getBranchDetailsData,
}

const mapStateToProps = (state) => ({
    branchPage: state.branchPage,
    auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(BranchDetails)
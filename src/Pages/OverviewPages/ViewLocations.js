import { Button, DatePicker, Dropdown, Form, Image, Input, Modal, Space, Table, Typography, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { getLocationsData } from "../../redux/actions/location/location.action";

function ViewLocations(props) {
  const [dieselDataTable, setDieselDataTable] = useState({})

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const showLocationList = () => {
    const clientId = props.auth.userData.client_id
    props.getLocationsData(clientId);
  }

  const onSelectDateLocation = (date) => {
    const clientId = props.auth.userData.client_id
    const date1 = dayjs(date[0]).format("DD-MM-YYYY HH:mm");
    const date2 = dayjs(date[1]).format("DD-MM-YYYY HH:mm");
    props.getLocationsData(clientId, date1, date2)
  }

  useEffect(() => {
    showLocationList()
  }, [])

  const data = props.locationPage.fetchedLocation.results

  const viewLocationPaginate = props.locationPage.fetchedLocation
  const fetchNextPage = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(viewLocationPaginate.page) || 0;
    const itemsPerPage = Number(viewLocationPaginate.count) || 10;
    const totalPages = Number( viewLocationPaginate.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      const paginationQuery = `&page=${currentPage+1}`;
      props.getLocationsData(clientId, paginationQuery);
    }
  };

  const fetchPrevPage = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(viewLocationPaginate.page) || 0;
    const itemsPerPage = Number(viewLocationPaginate.count) || 10;
    if (currentPage && currentPage > 1) {
      const paginationQuery = `&page=${currentPage-1}`;
      props.getLocationsData(clientId, paginationQuery);
    }
  };
  
  const columns = [
    {
      title: "Branch Name",
      dataIndex: "name",
      width: "200px",
      render: (text) => {
        return (
          <span
            style={{
              fontWeight: 'bold',
            }}
          >
            {text}
          </span>
        )
      },
      key: "name",
      // sorter: (a, b) => a.name.length - b.name.length,
      // sortDirections: ["descend"],
    },
    {
      title: "Zone",
      dataIndex: "current_month_consumption_in_litres",
      render: (value) => <>{- + '-'}</>,
      key: "current_month_consumption_in_litres",
    },
    {
      title: "Geo Location",
      dataIndex: "previous_day_consumption_in_litres",
      render: (value) => <>{}</>,
      key: "previous_day_consumption_in_litres",
    },
    {
      title: "City",
      dataIndex: "remaining_diesel_litres",
      render: (value) => <>{}</>,
      key: "remaining_diesel_litres",
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="AppHeader">
        <Typography.Title style={{ fontSize: "30Px", fontWeight: "bold" }}>
          View Location
        </Typography.Title>
        {/* <Space>
          <RangePicker
            style={{
              width: 264.29,
              height: 41.19,
              borderRadius: 11,
            }}
            defaultValue={[
              dayjs().startOf('month'),
              dayjs()
            ]}
            format={dateFormat}
            onChange={onSelectDateDieselOverview}
          />
        </Space> */}
      </div>
      <div className="##########">
        <section className="total-energy-bar-chart">
          <Table
            className="custom-row-hover"
            loading={props.locationPage.fetchLocationLoading}
            dataSource={data}
            columns={columns}
            onChange={onChange}
            pagination={false}
          />
          <div className="pagination">
            <div>
              <Button onClick={fetchPrevPage}>Previous</Button>
            </div>
            <div>
              <Button onClick={fetchNextPage}>Next</Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getLocationsData
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  locationPage: state.locationPage
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewLocations);
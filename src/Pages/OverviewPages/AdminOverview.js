import { Button, Space, Typography } from "antd";
import { 
  MailOutlined,
  BulbTwoTone,
  DollarCircleOutlined,
  DownloadOutlined,
  CloudDownloadOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getTotalEnergyTopCard } from "../../redux/actions/overview/overview.action";
import { useSearchParams } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import moment from "moment";

function AdminOverview(props) {
  const [clientId, setClientId] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams()
  const [dateChange, setDateChange] = useState(false);

  const headers = useSelector((state) => state.headers);

  useEffect(() => {
    const defaultDataValue =  moment(headers, 'DD-MM-YYYY');
    const startDate = defaultDataValue.startOf('month').format('DD-MM-YYYY HH:mm');
    const endDate = defaultDataValue.endOf('month').format('DD-MM-YYYY HH:mm');
    console.log("Something is expected here!>>>>>>>>>>>>>>>>");
    props.getTotalEnergyTopCard(client_id, startDate, endDate)

    if(dateChange !== headers){
      setDateChange(headers);
      getTotalEnergyTopCard(client_id, startDate, endDate)
    }

  }, [headers]);

  const client_id = searchParams.get("client_id") || props.auth.userData.client_id;
  console.log("Checking for Overview page details=========", props.overviewPage?.fetchedTotalEnergyTopCard);
  console.log("Checking for Client-Id=========", client_id);
  
    return (
      <>
        <div className="AppHeader">
          <Typography.Title>Admin Overview</Typography.Title>
          <Space>
            <div>
              <Button>
                <DownloadOutlined />
                Download Report
              </Button>
            </div>
            <div>
              <Button style={{backgroundColor:'#5C12A7', color:'white'}}>
                <PlusOutlined />
                Add User
              </Button>
            </div>
          </Space>
        </div>
        <div className="table-with-header-container h-no-mt">
          <section className="">
            <Space>
              <div className="admin-energy-top">
                <Space>
                  <BulbTwoTone />
                  <p>0000kWh</p>
                  <p>Total Energy</p>
                </Space>
              </div>
              <div className="admin-energy-top">
                <p>0000tons</p>
                <p>Carbon Emission</p>
              </div>
            </Space>
          </section>

          <section className="total-energy-page">
            <table />
          </section>
        </div>
      </>
    );
  }

  const mapDispatchToProps = {
    getTotalEnergyTopCard,
  }

  const mapStateToProps = (state) => ({
    overviewPage: state.overviewPage,
    auth: state.auth
  })

  export default connect(mapStateToProps, mapDispatchToProps)(AdminOverview);
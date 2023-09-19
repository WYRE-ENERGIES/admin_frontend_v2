import { Button, Image, Space, Typography } from "antd";
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getTotalEnergyTopCard } from "../../redux/actions/overview/overview.action";
import { useSearchParams } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import moment from "moment";

function AdminOverview(props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const client_id =
    searchParams.get("client_id") || props.auth.userData.client_id;

  useEffect(() => {
    const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
    const endDate = moment().endOf("month").format("DD-MM-YYYY HH:mm");
    props.getTotalEnergyTopCard(client_id, startDate, endDate);
  }, []);

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
            <Button style={{ backgroundColor: "#5C12A7", color: "white" }}>
              <PlusOutlined />
              Add User
            </Button>
          </div>
        </Space>
      </div>
      <div className="##########">
        <section className="co2 & total-energy-card">
          <Space>
            <div className="top-card">
              <Space>
                <div className="card-content">
                  <Image
                    style={{ marginLeft: "0px" }}
                    src="/Images/energy-consumption.png"
                  />
                </div>
                <div className="card-content">
                  <header style={{ fontWeight: "bold" }}>
                    {props.overviewPage?.fetchedTotalEnergyTopCard.total_energy?.toFixed(
                      2
                    )}
                    kWh
                  </header>
                  <header>Total Energy</header>
                </div>
              </Space>
            </div>
            <div className="top-card">
              <Space>
                <div className="card-content">
                  <Image
                    style={{ marginLeft: "0px" }}
                    src="/Images/co2-emmission.png"
                  />
                </div>
                <div className="card-content">
                  <header style={{ fontWeight: "bold" }}>
                    {props.overviewPage?.fetchedTotalEnergyTopCard.co2_emmission?.toFixed(
                      2
                    )}
                    tons
                  </header>
                  <header>Co2 Emission</header>
                </div>
              </Space>
            </div>
          </Space>
        </section>

        <section className="total-energy-bar-chart">
          <table />
        </section>
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getTotalEnergyTopCard,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminOverview);

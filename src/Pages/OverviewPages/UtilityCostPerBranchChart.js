import React from "react";
import { Bar } from "react-chartjs-2";
import { Card, Input, DatePicker, Select, Space, Spin } from "antd";

const { Search } = Input;
const { Option } = Select;

const UtilityCostPerBranchChart = ({
  data,
  onSearch,
  onRegionChange,
  onDateChange,
  regionOptions = [],
  selectedRegion,
  selectedDate,
  loading = false,
}) => {
  // Fallback to empty arrays if no data
  console.log("data", data);
  const labels = data?.map(item => item.name) || [];
  const costs = data?.map(item => item.utility_cost) || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Utility Cost (naira)",
        data: costs,
        backgroundColor: "#5C12A7",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Amount (naira)" } },
      x: { title: { display: true, text: "Branches" } },
    },
  };

  return (
    <Card style={{ borderRadius: 22 }}>
      <Spin spinning={loading} size="large">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h1 style={{ fontSize: "17px", margin: 0 }}>Utility Cost Per Branch</h1>
          <Space>
            <Search
              placeholder="Search by name"
              allowClear
              enterButton
              className="search-bar"
              onChange={onSearch}
              style={{ width: 180 }}
            />
  
            <Select
              placeholder="Search by Region"
              allowClear
              onChange={onRegionChange}
              value={selectedRegion}
              style={{ width: 180 }}
            >
              {regionOptions.map(region => (
                <Option key={region} value={region}>{region}</Option>
              ))}
            </Select>
            <DatePicker
              picker="month"
              onChange={onDateChange}
              value={selectedDate}
              style={{ width: 140 }}
              format="MM/YYYY"
              allowClear
            />
          </Space>
        </div>
        <Bar data={chartData} options={options} />
      </Spin>
    </Card>
  );
};

export default UtilityCostPerBranchChart;
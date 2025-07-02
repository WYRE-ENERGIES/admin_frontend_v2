import React from "react";
import { Bar } from "react-chartjs-2";
import { Card, Input, DatePicker, Select, Space } from "antd";

const { Search } = Input;
const { Option } = Select;

const GenericBranchBarChart = ({
  data,
  onSearch,
  onRegionChange,
  onDateChange,
  regionOptions = [],
  selectedRegion,
  selectedDate,
  tabIndex,
  chartLabel
}) => {
  const labels = data?.map(item => item.name) || [];
  const values = data?.map(item => item.value) || [];

  return (
    <Card style={{ borderRadius: 22 }}>
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
        <h1 style={{ fontSize: "17px", margin: 0 }}>
          {chartLabel}
        </h1>
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
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: chartLabel,
              data: values,
              backgroundColor: "#5C12A7",
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false },
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: chartLabel } },
            x: { title: { display: true, text: "Branches" } },
          },
        }}
      />
    </Card>
  );
};

export default GenericBranchBarChart;
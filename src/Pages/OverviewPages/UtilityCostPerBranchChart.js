import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Card, Input, DatePicker, Select, Space, Spin } from "antd";

const { Search } = Input;
const { Option } = Select;

const UtilityCostPerBranchChart = ({
  data,
  onBranchSelect,
  selectedBranches = [],
  onRegionChange,
  onDateChange,
  regionOptions = [],
  selectedRegion,
  selectedDate,
  loading = false,
  downloading = false,
}) => {
  const branchOptions = useMemo(
    () => data?.map(item => ({ label: item.name, value: item.name })) || [],
    [data]
  );

  const filteredData = useMemo(() => {
    if (!selectedBranches.length) return data;
    return data.filter(item => selectedBranches.includes(item.name));
  }, [data, selectedBranches]);

  const labels = filteredData?.map(item => item.name) || [];
  const wyreCosts = filteredData?.map(item => item.wyre_cost ?? 0) || [];
  const averageCosts = filteredData?.map(item => item.average_cost ?? 0) || [];

  const barStyle = {
    borderRadius: { topLeft: 6, topRight: 6 },
    borderSkipped: false,
    barThickness: 40,
    maxBarThickness: 60,
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Wyre Calculated Cost",
        data: wyreCosts,
        backgroundColor: "#5C12A7",
        ...barStyle,
      },
      {
        label: "Average Cost",
        data: averageCosts,
        backgroundColor: "#F9CF40",
        ...barStyle,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: false },
    },
    scales: {
      x: { 
        title: { display: true, text: "Branches" },
        grid: { display: false }
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    }
  };

  return (
    <Card style={{ overflow: "hidden", borderRadius: 22 }}>
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
            <Select
              mode="multiple"
              showSearch
              allowClear
              placeholder="Search & select branches"
              value={selectedBranches}
              onChange={onBranchSelect}
              style={{ width: 250 }}
              options={branchOptions}
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
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
          style={{ maxWidth: downloading ? "78vw" : "" }}
          data={chartData} 
          options={options} 
        />
      </Spin>
    </Card>
  );
};

export default UtilityCostPerBranchChart;
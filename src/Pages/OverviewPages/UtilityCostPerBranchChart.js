import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Card, Input, DatePicker, Select, Spin } from "antd";

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
    maintainAspectRatio: true,
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
  };

  return (
    <Card className="chart-card">
      <Spin spinning={loading} size="large">
        <div className="chart-header">
          <h1 className="chart-header-title">Utility Cost Per Branch</h1>
          <div className="chart-filters">
            <Select
              mode="multiple"
              showSearch
              allowClear
              placeholder="Search & select branches"
              value={selectedBranches}
              onChange={onBranchSelect}
              className="chart-filter-branch"
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
              className="chart-filter-region"
            >
              {regionOptions.map(region => (
                <Option key={region} value={region}>{region}</Option>
              ))}
            </Select>
            <DatePicker
              picker="month"
              onChange={onDateChange}
              value={selectedDate}
              className="chart-filter-date"
              format="MM/YYYY"
              allowClear
            />
          </div>
        </div>
        <div className="chart-scroll-container">
          <div className="chart-min-width-wrapper">
            <Bar
              style={{ maxWidth: downloading ? "78vw" : "" }}
              data={chartData} 
              options={options} 
            />
          </div>
        </div>
      </Spin>
    </Card>
  );
};

export default UtilityCostPerBranchChart;

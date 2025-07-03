import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Card, Input, DatePicker, Select, Space, Spin } from "antd";

const { Search } = Input;
const { Option } = Select;

const GenericBranchBarChart = ({
  data,
  onBranchSelect,
  selectedBranches = [],
  onRegionChange,
  onDateChange,
  regionOptions = [],
  selectedRegion,
  selectedDate,
  tabIndex,
  chartLabel,
  loading = false,
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
  const values = filteredData?.map(item => item.value) || [];

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
          <h1 style={{ fontSize: "17px", margin: 0 }}>
            {chartLabel}
          </h1>
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
      </Spin>
    </Card>
  );
};

export default GenericBranchBarChart;
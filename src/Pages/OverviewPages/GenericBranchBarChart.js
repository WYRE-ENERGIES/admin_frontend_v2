import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Card, Input, DatePicker, Select, Spin } from "antd";

const { Search } = Input;
const { Option } = Select;

const barStyle = {
  borderRadius: { topLeft: 6, topRight: 6 },
  borderSkipped: false,
  maxBarThickness: 60,
};

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
  seriesConfig,
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
  const values = filteredData?.map(item => item.value ?? 0) || [];

  const datasets = useMemo(() => {
    if (seriesConfig?.length) {
      return seriesConfig.map(({ key, label, color }) => ({
        label,
        data: filteredData?.map(item => item[key] ?? 0) || [],
        backgroundColor: color,
        ...barStyle,
      }));
    }
    return [
      {
        label: chartLabel,
        data: values,
        backgroundColor: "#5C12A7",
        ...barStyle,
      },
    ];
  }, [seriesConfig, filteredData, chartLabel, values]);

  return (
    <Card className="chart-card">
      <Spin spinning={loading} size="large">
        <div className="chart-header">
          <h1 className="chart-header-title">{chartLabel}</h1>
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
              data={{ labels, datasets }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: !!seriesConfig?.length },
                  title: { display: false },
                },
                scales: {
                  x: { 
                    title: { display: true, text: "Branches" },
                    grid: { display: false }
                  },
                },
              }}
            />
          </div>
        </div>
      </Spin>
    </Card>
  );
};

export default GenericBranchBarChart;

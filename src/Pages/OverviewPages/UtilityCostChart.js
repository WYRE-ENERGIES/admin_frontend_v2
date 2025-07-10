import { Button, Card, DatePicker, Image, Input, Select, Space, Table, Typography } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import { getClientUtilityCostData, getUtilityCostPerBranch } from "../../redux/actions/overview/overview.action";
import { useSearchParams } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import moment from "moment";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chart.js/auto'
import { Bar } from "react-chartjs-2";
import Pagination from "../../components/Pagination";
import ColumnGroup from "antd/es/table/ColumnGroup";
import Column from "antd/es/table/Column";
import Search from "antd/es/input/Search";
import TotalEnergyChart from "./TotalEnergyChart";
import { getYear } from "date-fns";
import { APIService } from "../../config/Api/apiServices";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


function UtilityCostChart(props, showUtilityCostPage, setShowUtilityCostPage) {
  const [dateSearch, setDateSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState()
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [regionOptions, setRegionOptions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(undefined);
  const [regionBranchMap, setRegionBranchMap] = useState({});
  const [holdLocationData, setHoldLocationData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'YYYY';
  const { RangePicker } = DatePicker;

  const showUtilityCostBarchart = () => {
    const clientId = props.auth.userData.client_id;
    props.getClientUtilityCostData(clientId);
  }

  // Fetch per-branch utility cost data
  useEffect(() => {
    const clientId = props.auth.userData.client_id;
    if (clientId && selectedYear) {
      props.getUtilityCostPerBranch(clientId, undefined, selectedYear);
    }
  }, [props.auth.userData.client_id, selectedYear]);

  // Branch select options
  let selectOptions = [];
  if (holdLocationData) {
    selectOptions = holdLocationData.map((item) => ({
      value: item.id,
      label: item.name,
      key: item.id
    }));
  }

  // Filter branch options by selected region
  const filteredSelectOptions = useMemo(() => {
    if (!selectedRegion) return selectOptions;
    const regionBranches = regionBranchMap[selectedRegion] || [];
    return selectOptions.filter(option => regionBranches.includes(option.label));
  }, [selectOptions, selectedRegion, regionBranchMap]);

  // Prepare per-branch data for chart
  const branchCostData = useMemo(() => {
    let branches = props.overviewPage.fetchedUtilityCostPerBranch?.branches || [];
    // Filter by region
    if (selectedRegion && regionBranchMap[selectedRegion]) {
      const allowed = new Set(regionBranchMap[selectedRegion]);
      branches = branches.filter(branch => allowed.has(branch.branch_name));
    }
    // Filter by selected branch ids
    if (selectedIds.length > 0) {
      const allowed = new Set(
        filteredSelectOptions.filter(opt => selectedIds.includes(opt.value)).map(opt => opt.label)
      );
      branches = branches.filter(branch => allowed.has(branch.branch_name));
    }
    return branches;
  }, [props.overviewPage.fetchedUtilityCostPerBranch, selectedRegion, regionBranchMap, selectedIds, filteredSelectOptions]);

  // Chart data for per-branch utility cost
  const branchChartData = useMemo(() => {
    const labels = branchCostData.map(branch => branch.branch_name);
    const costs = branchCostData.map(branch => branch.average_cost);
    return {
      labels,
      datasets: [
        {
          label: "Utility Cost (Naira)",
          data: costs,
          backgroundColor: "#5C12A7",
          borderRadius: 6,
          barThickness: 40,
          maxBarThickness: 60,
        },
      ],
    };
  }, [branchCostData]);

  // Restore previous monthly overview chart logic
  const [costChartData, setCostChartData] = useState({
    labels: [],
    datasets: []
  });
  const costReducerStates = props.overviewPage.fetchedTotalCostBarChart;
  useEffect(() => {
    if (costReducerStates) {
      const labels = costReducerStates.cost_overview.map((reducer) => {
        return reducer.month;
      });
      const clientCost = costReducerStates.cost_overview.map((reducer) => {
        return reducer.phcn_cost;
      });
      const wyreCost = costReducerStates.cost_overview.map((reducer) => {
        return reducer.wyre_cost;
      });
      const historicalAverage = Array.from({ length: 12 }, (_, i) => costReducerStates.historic_average)

      const costDataSource = {
        labels,
        datasets: [
          {
            label: "Historical Average",
            data: historicalAverage,
            backgroundColor: "#EF0000",
            type: "line",
            borderColor: "#EF0000",
            borderWidth: 1,
            fill: false,
          },
          {
            label: "PHCN Cost",
            data: clientCost,
            backgroundColor: "#43D540",
            borderRadius: 6,
            barThickness: 30,
            maxBarThickness: 30,
          },
          {
            label: "Wyre Cost",
            data: wyreCost,
            backgroundColor: "#5C12A7",
            borderRadius: 6,
            barThickness: 30,
            maxBarThickness: 30,
          },
        ],
      };
      setCostChartData(costDataSource);
    }
  }, [costReducerStates]);

  // Date change handler for year
  const onDateChange = (date) => {
    if (date) {
      setSelectedYear(date.year());
      setSelectedDate(date);
    } else {
      setSelectedYear(dayjs().year());
      setSelectedDate(dayjs());
    }
  };

  // Update per-branch fetch to use year only
  useEffect(() => {
    const clientId = props.auth.userData.client_id;
    if (clientId && selectedYear) {
      props.getUtilityCostPerBranch(clientId, undefined, selectedYear);
    }
  }, [props.auth.userData.client_id, selectedYear]);

  // Update overview fetch to use year only
  useEffect(() => {
    const clientId = props.auth.userData.client_id;
    if (clientId && selectedYear) {
      props.getClientUtilityCostData(clientId, selectedYear);
    }
  }, [props.auth.userData.client_id, selectedYear]);
  
  useEffect(() => {
    showUtilityCostBarchart()
  }, []);

  useEffect(() => {
    async function fetchRegions() {
      const clientId = props.auth.userData.client_id;
      if (!clientId) return;
      try {
        const res = await APIService.get(`/api/v1/accounts/client/${clientId}/regions-branches/`);
        const regions = res.data.regions || [];
        setRegionOptions(regions.map(r => r.region));
        // Mapping region name to branch names for fast lookup
        const map = {};
        regions.forEach(r => {
          map[r.region] = (r.branches || []).map(b => b.branch_name);
        });
        setRegionBranchMap(map);
      } catch (e) {
        setRegionOptions([]);
        setRegionBranchMap({});
      }
    }
    fetchRegions();
  }, [props.auth.userData.client_id]);

  useEffect(() => {
    async function fetchBranches() {
      const clientId = props.auth.userData.client_id;
      if (!clientId) return;
      try {
        const res = await APIService.get(`/api/v1/accounts/client/${clientId}/branches/`);
        setHoldLocationData(res.data.results || []);
      } catch (e) {
        setHoldLocationData([]);
      }
    }
    fetchBranches();
  }, [props.auth.userData.client_id]);

  // Filter chart data by selected region and selectedIds
  const filteredChartData = useMemo(() => {
    if (!branchChartData.labels || !branchChartData.datasets) return branchChartData;
    let labels = branchChartData.labels;
    let datasets = branchChartData.datasets.map(ds => ({ ...ds }));
    if (selectedRegion) {
      const regionBranches = regionBranchMap[selectedRegion] || [];
      labels = labels.filter(label => regionBranches.includes(label));
      datasets.forEach(ds => {
        ds.data = ds.data.filter((_, idx) => regionBranches.includes(branchChartData.labels[idx]));
      });
    }
    if (selectedIds.length > 0) {
      labels = labels.filter(label => filteredSelectOptions.find(opt => selectedIds.includes(opt.value) && opt.label === label));
      datasets.forEach(ds => {
        ds.data = ds.data.filter((_, idx) => labels.includes(branchChartData.labels[idx]));
      });
    }
    return { labels, datasets };
  }, [branchChartData, selectedRegion, selectedIds, regionBranchMap, filteredSelectOptions]);

  const handleRegionChange = value => {
    setSelectedRegion(value);
  };

  const handleCompareBranch = (Ids) => {
    setSelectedIds(Ids);
  };
  
  // Remove all logic related to costChartData, costReducerStates, and the old monthly overview chart.

  const options2 = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        display: true,
        labels: {
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Amount (Naira)",
        fontWeight: "bold",
        position: "left",
      },
    },

    scales: {
      x: {
        ticks: {
          font: {
            weight: "bold",
          },
        },
        title: {
          display: true,
          text: "Period (Month)",
          fontWeight: "bold",
          position: "left",
        },
        stacked: false,
        grid: {
          drawOnChartArea: false,
        },
      },
      y: {
        stacked: false,
        grid: {
          drawOnChartArea: true,
        },
      },
    },
  };


  return (
    <>
      <div className="##########">
        {/* {showUtilityCostPage ? (
        ) : (
          setShowUtilityCostPage(false)
      )} */}
          <section className="total-energy-bar-chart">
            <Card
              style={{
                borderRadius: 22,
              }}
              loading={props.overviewPage.fetchTotalCostBarChartLoading}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h1
                    style={{
                      fontSize: "17Px",
                    }}
                  >
                    Utility Cost
                  </h1>
                </div>
                {/* <div>
                  <DatePicker
                    defaultValue={selectedDate}
                    picker="year"
                    style={{ width: 120.65, height: 44 }}
                    onChange={onDateChange}
                  />
                </div> */}
                <div className="">
                <Select
                  className="select-bar"
                  mode="multiple"
                  maxTagCount={1}
                  maxTagTextLength={10}
                  maxTagPlaceholder={omittedValues => `+${omittedValues.length} more`}
                  placeholder="Select branches"
                  onChange={handleCompareBranch}
                  value={selectedIds}
                  style={{ width:165, marginRight: 10 }}
                  options={filteredSelectOptions}
                />
                {/* <Button
                  type="default"
                  onClick={() => setSelectedIds([])}
                  disabled={selectedIds.length === 0}
                  style={{ marginTop: 16 }}
                >
                  Reset Selection
                </Button> */}
                <Select
                  className="select-bar"
                  placeholder="Search by Region"
                  allowClear
                  style={{ marginRight: 10, width:165 }}
                  onChange={handleRegionChange}
                  value={selectedRegion}
                  options={regionOptions.map(region => ({ value: region, label: region }))}
                />
                <DatePicker
                  picker="year"
                  value={selectedDate}
                  style={{}}
                  onChange={onDateChange}
                  format="YYYY"
                  allowClear
                />
              </div>
              </div>
               {selectedRegion || selectedIds.length > 0 ? (
                 <Bar options={options2} data={branchChartData} />
               ) : (
                 <Bar options={options2} data={costChartData} />
               )}
            </Card>
          </section>
        
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getClientUtilityCostData,
  getUtilityCostPerBranch
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(UtilityCostChart);

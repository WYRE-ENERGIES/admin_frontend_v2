import { Button, DatePicker, Image, Input, Space, Spin, Table, Select, Typography, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined } from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import { getKeyMetricsData, getTotalCostTopCard, getTotalEnergyBarChartData, getTotalEnergyTopCard, getUtilityCostPerBranch, getUtilityEnergyPerBranch, getDieselCostPerBranch, getDieselLitresPerBranch } from "../../redux/actions/overview/overview.action";
import { useSearchParams } from "react-router-dom";
import { connect } from "react-redux";
import moment, { months } from "moment";
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
import ColumnGroup from "antd/es/table/ColumnGroup";
import Column from "antd/es/table/Column";
import UtilityCostChart from "./UtilityCostChart";
import TotalEnergyChart from "./TotalEnergyChart";
import UtilityEnergyChart from "./UtilityEnergyChart";
import DieselCostChart from "./DieselCostChart";
import DieselLitreChart from "./DieselLitreChart";
import ChartGroupButtons from "./ChartGroupButtons";
import { PiLightningDuotone } from "react-icons/pi";
import { getLocationsData } from "../../redux/actions/location/location.action";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import UtilityCostPerBranchChart from "./UtilityCostPerBranchChart";
import GenericBranchBarChart from "./GenericBranchBarChart";
import { APIService } from "../../config/Api/apiServices";
import React, { useMemo } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const buttons = [
  {
    label: "Total Energy",
    // key: "/",
    icon: <Image preview={false} src="/Images/total-energy-icon.jpeg" alt="" style={{ width: 20, height: 20 }} />,
  },
  {
    label: "Utility Cost",
    // key: "/",
    icon: <Image preview={false} src="/Images/cost-icon.jpeg" alt="" style={{ width: 20, height: 20 }} />,
  },
  {
    label: "Utility Energy",
    // key: "/",
    icon: <Image preview={false} src="/Images/utility-energy-icon.jpeg" alt="" style={{ width: 20, height: 20 }} />,
  },
  {
    label: "Diesel Cost",
    // key: "/",
    icon: <Image preview={false} src="/Images/cost-icon.jpeg" alt="" style={{ width: 20, height: 20 }} />,
  },
  {
    label: "Diesel Liters",
    // key: "/",
    icon: <Image preview={false} src="/Images/diesel-litre-icon.jpeg" alt="" style={{ width: 20, height: 20 }} />,
  },
]

const RendeChartsComponents = ({index}) => {
  switch (index) {
    case 0: return <TotalEnergyChart />
     break;
    case 1: return <UtilityCostChart /> 
     break;
    case 2: return <UtilityEnergyChart /> 
     break;
    case 3: return <DieselCostChart /> 
     break;
    case 4: return <DieselLitreChart /> 
     break;
    default:
      break;
  }
}

function AdminOverview(props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [holdSearchData, setHoldSearchData] = useState('')
  const [isSelectChart, setIsSelectChart] = useState(0)
  const [keyMetricsData, setkeyMetricsData] = useState([])
  const [pageDataHolder, setPageDataHolder] = useState([])
  const [holdLocationData, setHoldLocationData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  let options=[]
  if (holdLocationData) {
    holdLocationData.map((item) => {
    options.push({
      value: item.id,
      label: item.name,
      key: item.id
    })
  })
  }
  // const selectRegion = OPTIONS.map((o) => !selectedItems.includes(o));
  const handleRegionChange = value => {
    console.log(`selected ${value}`);
  };
  
  console.log('pageDataHolder-------> ', pageDataHolder);
  console.log('keyMetricsData-------> ', keyMetricsData);
  console.log('Check IDs-------> ', selectedIds);

  const { Search } = Input;
    const [downloading, setDownloading] = useState(false);
    const reportRef = useRef(null);
    const [regionOptions, setRegionOptions] = useState([]);
    const [regionBranchMap, setRegionBranchMap] = useState({});
    const [selectedRegion, setSelectedRegion] = useState(undefined);

    const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    setDownloading(true);
    message.loading({ content: 'Generating PDF...', key: 'pdfDownload' });

    try
    {
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      console.log("props:", props)
      const branchName = props?.auth?.userData?.client_name || 'branch';
      const month = new Date().getMonth();
      const year = new Date().getFullYear();
 
      const filename = `${branchName}_${month}_energy_report_${year}.pdf`;

      pdf.save(filename);
      message.success({ content: 'PDF downloaded successfully!', key: 'pdfDownload' });
    } catch (error)
    {
      console.error('Error generating PDF:', error);
      message.error({ content: 'Failed to generate PDF', key: 'pdfDownload' });
    } finally
    {
      setDownloading(false);
    }
    };
  
  // const handleDateSearch = (e) => setDateSearch(e.target.value)
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'MM/YYYY';
  const { RangePicker } = DatePicker;

  const clientId = searchParams.get("client_id") || props.auth.userData.client_id;
  const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
  // const endDate = moment().endOf("month").format("DD-MM-YYYY HH:mm");
  const endDate = moment().format("DD-MM-YYYY HH:mm");

  // const showKeyMetricsTable = () => {
  //   const clientId = props.auth.userData.client_id
  //   props.getKeyMetricsData(clientId, startDate, endDate);
  // }
  const showKeyMetricsTable = (date) => {
    const clientId = props.auth.userData.client_id
    const month = dayjs(date).month() + 1; // JS month is 0-indexed, so add 1
    const year = dayjs(date).year();
    props.getKeyMetricsData(clientId, month, year)
  }

  // const onSelectDateKeyMetrics = (date) => {
  //   const date1 = dayjs(date[0]).format("DD-MM-YYYY HH:mm");
  //   const date2 = dayjs(date[1]).format("DD-MM-YYYY HH:mm");
  //   props.getKeyMetricsData(clientId, date1, date2)
  // }
  const handleDateChange = (date) => {
      if (!date) return;
      const month = dayjs(date).month() + 1; // JS month is 0-indexed, so add 1
      const year = dayjs(date).year();
      props.getKeyMetricsData(clientId, month, year);
    };

  useEffect(() => {
    const client_id = clientId
    props.getTotalEnergyTopCard(client_id, startDate, endDate);
    props.getTotalCostTopCard(client_id, startDate, endDate);
  }, []);
  useEffect(() => {
    showKeyMetricsTable()
  }, [])
  useEffect(() => {
    const handleBranch = async () => {
      const requestBranchesData = await props.getLocationsData(clientId)
      if (requestBranchesData?.fulfilled) {
        setHoldLocationData(requestBranchesData?.data?.results)
      }
    }
    handleBranch()
  },[])
  useEffect(() => {
    if (props.overviewPage.fetchedKeyMetrics) {
      setkeyMetricsData(props.overviewPage.fetchedKeyMetrics.results)
    }
  }, [props.overviewPage.fetchedKeyMetrics])
  useEffect(() => {
    setPageDataHolder(keyMetricsData)
  }, [keyMetricsData])

  const onSearchKeyMetrics = (e, date) => {
    const month = dayjs(date).month() + 1; // JS month is 0-indexed, so add 1
    const year = dayjs(date).year();
    props.getKeyMetricsData(clientId, month, year , 1, e.target.value)
  }
  const displayedData = selectedIds.length === 0
    ? keyMetricsData
    : keyMetricsData.filter(item => selectedIds.includes(item.id));

  // const handleCompareBranches = (e) => {
  //   const filtered = data.filter((item) =>
  //     item
  //   );
  //   setPageDataHolder(filtered)
  //   console.log('id-Value--------> ', filtered.e)
  //   return filtered.e
  //   setCurrentPage(1);
  // };

  const handleCompareBranches = (Ids) => {
    console.log('id == ', Ids);
  if (Ids.length <= 5) {
    setSelectedIds(Ids);
  } else {
    message.warning('You can only select up to 5 branches');
  }

    // setCurrentPage(1);
    const filteredBranches = keyMetricsData.filter(item => Ids.includes(item.id))
    // setEnergyChartData(filteredBranches)
    console.log('filteredBranches == ', filteredBranches);
    // setkeyMetricsData(filteredBranches)


  };
  const suffix = (
    <SearchOutlined
      onClick={onSearchKeyMetrics}
      style={{
        fontSize: 16,
        color: "white",
      }}
    />
  );

  const data = props.overviewPage.fetchedKeyMetrics.results
  const getGenEfficiency = (value) => {
    if (value >= 86) return "#FFBF00";
    if (value >= 66) return "#43D540";
    if (value >= 50) return "#FFBF00";
    if (value < 50) return "#EF0000";
  };
  const getUsageAccuracy = (value, record, index ) => {
    if (index === 0) return "#5C12A7"; 
    if (value < 95) return "#EF0000";
    if (value >= 95) return "#43D540";
  }; 
  const checkData = props.overviewPage?.fetchedKeyMetrics?.results?.[0]

  const fetchNextPaginatedKeyMetric = (date) => {
    if (!date) return;
    const month = dayjs(date).month() + 1;
    const year = dayjs(date).year();
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(keyMetricsData.page) || 0;
    const itemsPerPage = Number(keyMetricsData.count) || 10;
    const totalPages = Number( keyMetricsData.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      const paginationQuery = `&page=${currentPage+1}`;
      props.getKeyMetricsData(clientId, month, year, paginationQuery);
    }
  };

  const fetchPrevPaginatedKeyMetric = (date) => {
    if (!date) return;
    const month = dayjs(date).month() + 1;
    const year = dayjs(date).year();
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(keyMetricsData.page) || 0;
    const itemsPerPage = Number(keyMetricsData.count) || 10;
    if (currentPage && currentPage > 1) {
      const paginationQuery = `&page=${currentPage-1}`;
      props.getKeyMetricsData(clientId, month, year, paginationQuery);
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
      sorter: (a, b) => a.name.length - b.name.length,
      // sortDirections: ["descend"],
    },
    {
      title: "Baseline Energy (kWh)",
      dataIndex: "baseline_energy",
      key: "baseline_energy",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.baseline_energy - b.baseline_energy,
    },
    {
      title: "Blended Cost of Energy",
      dataIndex: "blended_cost_of_energy",
      key: "blended_cost_of_energy",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.blended_cost_of_energy - b.blended_cost_of_energy,
    },
    {
      title: "Usage Accuracy Diesel",
      dataIndex: "diesel_usage_accuracy",
      key: "diesel_usage_accuracy",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.diesel_usage_accuracy - b.diesel_usage_accuracy,
    },
    {
      title: "Usage Accuracy Utility",
      dataIndex: "utility_usage_accuracy",
      key: "utility_usage_accuracy",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.utility_usage_accuracy - b.utility_usage_accuracy,
    },
    {
      title: "Deviation Hours",
      dataIndex: "deviation_hours",
      key: "deviation_hours",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.deviation_hours - b.deviation_hours,
    },
    {
      title: "PAPR",
      dataIndex: "papr",
      key: "papr",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.papr - b.papr,
    },
    {
      title: "Fuel Efficiency",
      dataIndex: "fuel_efficiency",
      key: "fuel_efficiency",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.fuel_efficiency - b.fuel_efficiency,
    },
    {
      title: "Generator Efficiency",
      dataIndex: "generator_size_efficiency_1",
      key: "generator_size_efficiency_1",
      // defaultSortOrder: "descend",
      // sorter: (a, b) => a.generator_size_efficiency_1 - b.generator_size_efficiency_1,
    },
    {
      title: "Generator Efficiency",
      dataIndex: "generator_size_efficiency_2",
      key: "generator_size_efficiency_2",
      // defaultSortOrder: "descend",
      // sorter: (a, b) => a.generator_size_efficiency_2 - b.generator_size_efficiency_2,
    },
    {
      title: "Generator Efficiency",
      dataIndex: "generator_size_efficiency_3",
      key: "generator_size_efficiency_3",
      // defaultSortOrder: "descend",
      // sorter: (a, b) => a.generator_size_efficiency_3 - b.generator_size_efficiency_3,
    },
  ];
  
  const handleRowClick = (record) => {
    // navigate('/detail', { state: { data: record } });
    return (
      <a
        rel="noopener noreferrer"
        href={`/branch-detail/${record.id}/`}
      >
        View Branch
      </a>
    );
    
  };


  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  const getUtilityCostData = () => {
    return props.overviewPage.fetchedKeyMetrics?.results?.map(branch => ({
      name: branch.name,
      utility_cost: branch.utility_cost || 0, // fallback to 0 if not present
    })) || [];
  };

  // State for generic tab filters
  const [genericTabSearch, setGenericTabSearch] = useState('');
  const [genericTabRegion, setGenericTabRegion] = useState(undefined);
  const [genericTabDate, setGenericTabDate] = useState(null);

  const handleGenericTabSearch = (e) => setGenericTabSearch(e.target.value);
  const handleGenericTabRegion = (value) => setGenericTabRegion(value);
  const handleGenericTabDate = (date) => setGenericTabDate(date);

  // Get unique region options from your data
  const getRegionOptions = () => {
    const allRegions = props.overviewPage.fetchedKeyMetrics?.results?.map(branch => branch.region).filter(Boolean) || [];
    return Array.from(new Set(allRegions));
  };

  // Filter data for the chart for the current tab
  const getGenericTabData = () => {
    let branches = props.overviewPage.fetchedKeyMetrics?.results || [];
    if (genericTabSearch) {
      branches = branches.filter(branch =>
        branch.name.toLowerCase().includes(genericTabSearch.toLowerCase())
      );
    }
    if (genericTabRegion) {
      branches = branches.filter(branch => branch.region === genericTabRegion);
    }
    if (genericTabDate) {
      const month = genericTabDate.month() + 1;
      const year = genericTabDate.year();
      branches = branches.filter(branch => {
        if (!branch.date) return true;
        const branchDate = new Date(branch.date);
        return branchDate.getMonth() + 1 === month && branchDate.getFullYear() === year;
      });
    }
    // Pick the correct field based on the tab
    let field = "utility_energy";
    let label = "Utility Energy (kWh)";
    if (isSelectChart === 3) {
      field = "diesel_cost";
      label = "Diesel Cost (naira)";
    } else if (isSelectChart === 4) {
      field = "diesel_liters";
      label = "Diesel Liters";
    }
    return branches.map(branch => ({
      name: branch.name,
      value: branch[field] || 0,
      chartLabel: label,
    }));
  };

  const [utilityCostMonth, setUtilityCostMonth] = useState(dayjs().month() + 1);
  const [utilityCostYear, setUtilityCostYear] = useState(dayjs().year());

  useEffect(() => {
    if (isSelectChart === 1) {
      props.getUtilityCostPerBranch(clientId, utilityCostMonth, utilityCostYear);
    }
  }, [isSelectChart, utilityCostMonth, utilityCostYear, clientId]);

  const handleUtilityCostMonthChange = (date) => {
    if (date) {
      setUtilityCostMonth(date.month() + 1);
      setUtilityCostYear(date.year());
    } else {
      setUtilityCostMonth(dayjs().month() + 1);
      setUtilityCostYear(dayjs().year());
    }
  };
  const handleUtilityCostSearch = (e) => setGenericTabSearch(e.target.value);

  const getUtilityCostPerBranchData = () => {
    let branches = props.overviewPage.fetchedUtilityCostPerBranch?.branches || [];
    if (selectedRegion && regionBranchMap[selectedRegion]) {
      const allowed = new Set(regionBranchMap[selectedRegion]);
      branches = branches.filter(branch => allowed.has(branch.branch_name));
    }
    return branches
      .filter(branch => !genericTabSearch || branch.branch_name.toLowerCase().includes(genericTabSearch.toLowerCase()))
      .map(branch => ({
        name: branch.branch_name,
        utility_cost: branch.average_cost,
      }));
  };

  const [utilityEnergyMonth, setUtilityEnergyMonth] = useState(dayjs().month() + 1);
  const [utilityEnergyYear, setUtilityEnergyYear] = useState(dayjs().year());

  useEffect(() => {
    if (isSelectChart === 2) {
      props.getUtilityEnergyPerBranch(clientId, utilityEnergyMonth, utilityEnergyYear);
    }
  }, [isSelectChart, utilityEnergyMonth, utilityEnergyYear, clientId]);

  const handleUtilityEnergyMonthChange = (date) => {
    if (date) {
      setUtilityEnergyMonth(date.month() + 1);
      setUtilityEnergyYear(date.year());
    } else {
      setUtilityEnergyMonth(dayjs().month() + 1);
      setUtilityEnergyYear(dayjs().year());
    }
  };
  const handleUtilityEnergySearch = (e) => setGenericTabSearch(e.target.value);

  const getUtilityEnergyPerBranchData = () => {
    let branches = props.overviewPage.fetchedUtilityEnergyPerBranch?.monthly_utility_energy || [];
    if (selectedRegion && regionBranchMap[selectedRegion]) {
      const allowed = new Set(regionBranchMap[selectedRegion]);
      branches = branches.filter(branch => allowed.has(branch.branch_name));
    }
    return branches
      .filter(branch => !genericTabSearch || branch.branch_name.toLowerCase().includes(genericTabSearch.toLowerCase()))
      .map(branch => ({
        name: branch.branch_name,
        value: branch.utility_energy,
      }));
  };

  const [dieselCostMonth, setDieselCostMonth] = useState(dayjs().month() + 1);
  const [dieselCostYear, setDieselCostYear] = useState(dayjs().year());

  useEffect(() => {
    if (isSelectChart === 3) {
      props.getDieselCostPerBranch(clientId, dieselCostMonth, dieselCostYear);
    }
  }, [isSelectChart, dieselCostMonth, dieselCostYear, clientId]);

  const handleDieselCostMonthChange = (date) => {
    if (date) {
      setDieselCostMonth(date.month() + 1);
      setDieselCostYear(date.year());
    } else {
      setDieselCostMonth(dayjs().month() + 1);
      setDieselCostYear(dayjs().year());
    }
  };
  const handleDieselCostSearch = (e) => setGenericTabSearch(e.target.value);

  const getDieselCostPerBranchData = () => {
    let branches = props.overviewPage.fetchedDieselCostPerBranch?.monthly_diesel_costs || [];
    if (selectedRegion && regionBranchMap[selectedRegion]) {
      const allowed = new Set(regionBranchMap[selectedRegion]);
      branches = branches.filter(branch => allowed.has(branch.branch_name));
    }
    return branches
      .filter(branch => !genericTabSearch || branch.branch_name.toLowerCase().includes(genericTabSearch.toLowerCase()))
      .map(branch => ({
        name: branch.branch_name,
        value: branch.wyre_cost,
      }));
  };

  const [dieselLitresMonth, setDieselLitresMonth] = useState(dayjs().month() + 1);
  const [dieselLitresYear, setDieselLitresYear] = useState(dayjs().year());

  useEffect(() => {
    if (isSelectChart === 4) {
      props.getDieselLitresPerBranch(clientId, dieselLitresMonth, dieselLitresYear);
    }
  }, [isSelectChart, dieselLitresMonth, dieselLitresYear, clientId]);

  const handleDieselLitresMonthChange = (date) => {
    if (date) {
      setDieselLitresMonth(date.month() + 1);
      setDieselLitresYear(date.year());
    } else {
      setDieselLitresMonth(dayjs().month() + 1);
      setDieselLitresYear(dayjs().year());
    }
  };
  const handleDieselLitresSearch = (e) => setGenericTabSearch(e.target.value);

  const getDieselLitresPerBranchData = () => {
    let branches = props.overviewPage.fetchedDieselLitresPerBranch?.monthly_diesel_litres || [];
    if (selectedRegion && regionBranchMap[selectedRegion]) {
      const allowed = new Set(regionBranchMap[selectedRegion]);
      branches = branches.filter(branch => allowed.has(branch.branch_name));
    }
    return branches
      .filter(branch => !genericTabSearch || branch.branch_name.toLowerCase().includes(genericTabSearch.toLowerCase()))
      .map(branch => ({
        name: branch.branch_name,
        value: branch.diesel_litres,
      }));
  };

  useEffect(() => {
    async function fetchRegions() {
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
  }, [clientId]);

  const [selectedBranches, setSelectedBranches] = useState([]);

  const handleBranchSelect = (branches) => setSelectedBranches(branches);

  return (
    <main ref={reportRef}>
      <div className="AppHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 className="mobile-title">
          {downloading ? "Report" : "Admin Overview"}
        </h4>
          <div>
          <Button
            onClick={handleDownloadPdf}
            disabled={downloading || props.overviewPage.fetchKeyMetricsLoading || props.overviewPage.fetchTotalEnergyTopCardLoading || props.overviewPage.fetchTotalEnergyBarChartDataLoading}
              className="mobile-button"
            >
              <DownloadOutlined />
              Download Report
            </Button>
          </div>
          {/* <div>
            <Button
              style={{
                backgroundColor: "#5C12A7",
                color: "white",
                width: "167.78px",
                height: "42.32px",
                fontSize: "15px",
                borderRadius: "11px",
                fontWeight: "bold",
              }}
            >
              <PlusOutlined />
              Add User
            </Button>
          </div> */}
      </div>
      <div className="##########">
        <section className="co2 & total-energy-card">
          <Space>
            <div className="top-card-2">
              <Space>
                <div className="card-content">
                  <Image style={{ height: 30, width: 30 }} className="amount-icon"
                    src="/Images/naira-cost-icon.jpeg"
                    preview={false}
                  />
                </div>
                <div className="card-content">
                  <Spin
                    spinning={
                      props.overviewPage?.fetchTotalCostTopCardLoading
                    }
                  >
                    <header style={{ fontWeight: "bold" }}>
                      {props.overviewPage?.fetchedTotalCostTopCard.total_calculated_cost?.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      Naira
                    </header>
                  </Spin>
                  <header>Total Cost</header>
                </div>
              </Space>
            </div>
            <div className="top-card-1">
              <Space>
                <div className="card-content">
                  <Image
                    preview={false}
                    // style={{ marginLeft: "0px",cursor: "default"  }}
                    style={{ height: 30, width: 30 }}
                    src="/Images/total-energy-topCard.jpeg"
                  />
                </div>
                <div className="card-content">
                  <Spin
                    spinning={
                      props.overviewPage?.fetchTotalEnergyTopCardLoading
                    }
                  >
                    <header style={{ fontWeight: "bold" }}>
                      {props.overviewPage?.fetchedTotalEnergyTopCard.total_energy?.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      kWh
                    </header>
                  </Spin>
                  <header>Total Energy</header>
                </div>
              </Space>
            </div>
            <div className="top-card-2">
              <Space>
                <div className="card-content">
                  <Image
                    preview={false}
                    // style={{ marginLeft: "0px" }}
                    style={{ height: 30, width: 30 }}
                    src="/Images/co2-icon.jpeg"
                  />
                </div>
                <div className="card-content">
                  <Spin
                    spinning={
                      props.overviewPage?.fetchTotalEnergyTopCardLoading
                    }
                  >
                    <header style={{ fontWeight: "bold" }}>
                      {props.overviewPage?.fetchedTotalEnergyTopCard.co2_emmission?.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      tons
                    </header>
                  </Spin>
                  <header>Co2 Emission</header>
                </div>
              </Space>
            </div>
          </Space>
        </section>
         {!downloading && (
        <section className="total-energy-bar-chart">
          <Typography.Title style={{ fontSize: "20px" }}>
            Chart Metrics
          </Typography.Title>
          <div
            className="chart_buttons_container"
            style={{
              // backgroundColor: "#F2F2F8",
              width: "100%",
            }}
          >
            <ChartGroupButtons
              buttons={buttons}
              isSelectChart={isSelectChart}
              setIsSelectChart={setIsSelectChart}
            />
          </div>
        </section>
         )}
        <RendeChartsComponents index={isSelectChart} />
          {isSelectChart === 0 ? (
          <section className="total-energy-bar-chart">
            <div
              style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "17Px",
                  }}
                >
                  Key Metrics
                </h1>
              </div>
              <div className="search-bar-date-picker">
                <Search
                  placeholder="Search by name"
                  enterButton
                  className="search-bar"
                  onChange={onSearchKeyMetrics}
                  allowClear
                  style={{
                    marginRight: 15,
                    // height: 43.5
                  }}
                />
                <Select
                className="select-bar"
                mode="multiple"
                placeholder="Select branches"
                maxTagCount={1}
                maxTagTextLength={10}
                maxTagPlaceholder={omittedValues => `+${omittedValues.length} more`}
                onChange={handleCompareBranches}
                value={selectedIds}
                style={{ marginRight: 10 }}
                options={options}
              />
              <Select
                className="select-bar"
                prefix="Region"
                defaultValue="lucy"
                style={{ marginRight: 10 }}
                onChange={handleRegionChange}
                options={[
                  { value: 'jack', label: 'North' },
                  { value: 'lucy', label: 'South' },
                  { value: 'Yiminghe', label: 'East' },
                  { value: 'disabled', label: 'Disabled', disabled: true },
                ]}
              />
              <DatePicker
                  className="picker-date"
                  style={{
                    // height: 43.5
                  }}
                  defaultValue={[
                    dayjs().startOf("month"),
                    dayjs(),
                  ]}
                  picker="month"
                format={dateFormat}
                  onChange={handleDateChange}
                disabledDate={(current) => {
                  return current && current > dayjs().endOf('month');
                }}
                />
              </div>
            </div>
            <div style={{overflowX: 'auto'}}>
              <Table
                className="custom-row-hover"
                rowClassName={(record, index) => {
                  if (index === 0) return "first-row";
                }}
                onRow={(record) => ({
                  style: {
                    color: record === checkData ? "#5C12A7" : "",
                    backgroundColor: record === checkData ? "#F2F2F8" : "",
                    fontWeight: record === checkData ? "bold" : ""
                  },
                  // onClick: () => handleRowClick(record)
                  onClick: (event) => {
                    window.location.href = `${window.location.href}branch?ee=${record.id}`;
                  },
                  // onMouseEnter: () => console.log('Mouse entered row:', record),
                })}
                // rowKey="id"
                rowKey={(record) => record.id}
                // scroll={{ x: 'max-content' }}
                loading={props.overviewPage.fetchKeyMetricsLoading}
                dataSource={displayedData}
                onChange={onChange}
                pagination={false}
              >
                <Column
                  title="Branch Name"
                  dataIndex="name"
                  key="name"
                  width="120px"
                  ellipsis={true}
                  render= {
                    (text) => (
                      <span style={{ fontWeight: "bold" }}>{text}</span>
                    )
                  }
                />
                <Column
                  width={90}
                  title="Baseline Energy (kWh)"
                  dataIndex="baseline_energy_used"
                  key="baseline_energy_used"
                  ellipsis={true}
                  render={(value) => (
                    <>
                      {value
                        ? value.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })
                        : 0}
                    </>
                  )}
                />
                <Column
                  width={90}
                  title="Blended Cost of Energy"
                  dataIndex="blended_cost_of_energy"
                  key="blended_cost_of_energy"
                  ellipsis={true}
                  render={(value) => (
                    <>
                      {value.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </>
                  )}
                />
                <Column
                  width={100}
                  title="Deviation Hours"
                  dataIndex="deviation_hours"
                  key="deviation_hours"
                  ellipsis={true}
                />
                <Column
                  width={70}
                  title="PAPR"
                  dataIndex="papr"
                  key="papr"
                  ellipsis={true}
                />
                <Column
                  width={100}
                  title="Fuel Efficiency"
                  dataIndex="fuel_efficiency"
                  key="fuel_efficiency"
                  ellipsis={true}
                  render={(value) => (
                    <>
                      {value.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </>
                  )}
                />
                <Column
                  width={90}
                  title="Diesel Usage Accuracy"
                  dataIndex="diesel_usage_accuracy"
                  key="diesel_usage_accuracy"
                  ellipsis={true}
                  render={(value, record, index) => (
                    <div style={{ color: getUsageAccuracy(value, record, index), fontWeight: "bold" }} >
                      {value.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  )}
                />
                <Column
                  width={90}
                  title="Utility Usage Accuracy"
                  dataIndex="utility_usage_accuracy"
                  key="utility_usage_accuracy"
                  ellipsis={true}
                  render={(value, record, index) => (
                    <div style={{ color: getUsageAccuracy(value, record, index), fontWeight: "bold" }} >
                      {value.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  )}
                />
                <ColumnGroup
                  width="100px"
                  ellipsis={true}
                  title="Generator Efficiency"
                >
                  <Column
                    width={70}
                    // title="Gen1"
                    dataIndex="generator_size_efficiency_1"
                    key="generator_size_efficiency_1"
                    render= {
                      (value) => (
                        <span style={{ color: getGenEfficiency(value), fontWeight: "bold" }}>{value}</span>
                      )
                    }
                    ellipsis={true}
                  />
                  <Column
                    width={70}
                    // title="Gen2"
                    dataIndex="generator_size_efficiency_2"
                    key="generator_size_efficiency_2"
                    render= {
                      (value) => (
                        <span style={{ color: getGenEfficiency(value), fontWeight: "bold" }}>{value}</span>
                      )
                    }
                    ellipsis={true}
                  />
                  <Column
                    width={70}
                    // title="Gen3"
                    dataIndex="generator_size_efficiency_3"
                    key="generator_size_efficiency_3"
                    render= {
                      (value) => (
                        <span style={{ color: getGenEfficiency(value), fontWeight: "bold" }}>{value}</span>
                      )
                    }
                    ellipsis={true}
                  />
                </ColumnGroup>
              </Table>
            </div>
            <div className="keymetric_pagination">
              <div>
                <Button onClick={fetchPrevPaginatedKeyMetric} disabled={keyMetricsData.page===1}>Previous</Button>
              </div>
              <span style={{ margin: '0 8px' }}>
                Page {keyMetricsData.page} of {keyMetricsData.total_pages}
              </span>
              <div>
                <Button onClick={fetchNextPaginatedKeyMetric} disabled={keyMetricsData.page*keyMetricsData.count >= keyMetricsData.count*keyMetricsData.total_pages}>Next</Button>
              </div>
            </div>
          </section>
        ) : isSelectChart === 1 ? (
          <section className="total-energy-bar-chart">
            <UtilityCostPerBranchChart
              data={getUtilityCostPerBranchData()}
              onBranchSelect={handleBranchSelect}
              selectedBranches={selectedBranches}
              onSearch={handleUtilityCostSearch}
              onRegionChange={handleRegionChange}
              regionOptions={regionOptions}
              selectedRegion={selectedRegion}
              onDateChange={handleUtilityCostMonthChange}
              selectedDate={dayjs(`${utilityCostYear}-${utilityCostMonth}`, "YYYY-M")}
              loading={props.overviewPage.fetchUtilityCostPerBranchLoading}
            />
          </section>
        ) : isSelectChart === 2 ? (
          <section className="total-energy-bar-chart">
            <GenericBranchBarChart
              tabIndex={isSelectChart}
              chartLabel="Utility Energy Per Branch"
              data={getUtilityEnergyPerBranchData()}
              onSearch={handleUtilityEnergySearch}
              onRegionChange={handleRegionChange}
              regionOptions={regionOptions}
              selectedRegion={selectedRegion}
              onDateChange={handleUtilityEnergyMonthChange}
              selectedDate={dayjs(`${utilityEnergyYear}-${utilityEnergyMonth}`, "YYYY-M")}
              loading={props.overviewPage.fetchUtilityEnergyPerBranchLoading}
              onBranchSelect={handleBranchSelect}
              selectedBranches={selectedBranches}
            />
          </section>
        ) : isSelectChart === 3 ? (
          <section className="total-energy-bar-chart">
            <GenericBranchBarChart
              tabIndex={isSelectChart}
              chartLabel="Diesel Cost Per Branch"
              data={getDieselCostPerBranchData()}
              onSearch={handleDieselCostSearch}
              onRegionChange={handleRegionChange}
              regionOptions={regionOptions}
              selectedRegion={selectedRegion}
              onDateChange={handleDieselCostMonthChange}
              selectedDate={dayjs(`${dieselCostYear}-${dieselCostMonth}`, "YYYY-M")}
              loading={props.overviewPage.fetchDieselCostPerBranchLoading}
              onBranchSelect={handleBranchSelect}
              selectedBranches={selectedBranches}
            />
          </section>
        ) : isSelectChart === 4 ? (
          <section className="total-energy-bar-chart">
            <GenericBranchBarChart
              chartLabel="Diesel Liters Per Branch"
              tabIndex={isSelectChart}
              data={getDieselLitresPerBranchData()}
              onSearch={handleDieselLitresSearch}
              onRegionChange={handleRegionChange}
              regionOptions={regionOptions}
              selectedRegion={selectedRegion}
              onDateChange={handleDieselLitresMonthChange}
              selectedDate={dayjs(`${dieselLitresYear}-${dieselLitresMonth}`, "YYYY-M")}
              loading={props.overviewPage.fetchDieselLitresPerBranchLoading}
              onBranchSelect={handleBranchSelect}
              selectedBranches={selectedBranches}
            />
          </section>
        ) : (
          <section className="total-energy-bar-chart">
            <GenericBranchBarChart
              tabIndex={isSelectChart}
              data={getGenericTabData()}
              onSearch={handleGenericTabSearch}
              onRegionChange={handleGenericTabRegion}
              onDateChange={handleGenericTabDate}
              regionOptions={getRegionOptions()}
              selectedRegion={genericTabRegion}
              selectedDate={genericTabDate}
              onBranchSelect={handleBranchSelect}
              selectedBranches={selectedBranches}
            />
          </section>
        )}
      </div>
    </main>
  );
}

const mapDispatchToProps = {
  getTotalEnergyTopCard,
  getTotalCostTopCard,
  getLocationsData,
  getTotalEnergyBarChartData,
  getKeyMetricsData,
  getUtilityCostPerBranch,
  getUtilityEnergyPerBranch,
  getDieselCostPerBranch,
  getDieselLitresPerBranch,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminOverview);


import { Button, DatePicker, Image, Input, Popover, Space, Spin, Table, Select, Typography, message } from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined } from "@ant-design/icons";
import { useEffect, useState, useRef, useMemo } from "react";
import { getKeyMetricsData, getTotalCostTopCard, getTotalEnergyBarChartData, getTotalEnergyTopCard, getUtilityCostPerBranch, getUtilityEnergyPerBranch, getDieselCostPerBranch, getDieselLitresPerBranch } from "../../redux/actions/overview/overview.action";
import { useSearchParams } from "react-router-dom";
import { connect } from "react-redux";
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
import ColumnGroup from "antd/es/table/ColumnGroup";
import Column from "antd/es/table/Column";
import UtilityCostChart from "./UtilityCostChart";
import TotalEnergyChart from "./TotalEnergyChart";
import UtilityEnergyChart from "./UtilityEnergyChart";
import DieselCostChart from "./DieselCostChart";
import DieselLitreChart from "./DieselLitreChart";
import ChartGroupButtons from "./ChartGroupButtons";
import { getLocationsData, getRegionsListData } from "../../redux/actions/location/location.action";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import UtilityCostPerBranchChart from "./UtilityCostPerBranchChart";
import GenericBranchBarChart from "./GenericBranchBarChart";
import { useSelector } from 'react-redux';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TOP_CARDS_DATE_RANGES = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_3_months", label: "Last 3 months" },
  { value: "last_6_months", label: "Last 6 months" },
  { value: "this_year", label: "This year" },
  { value: "last_year", label: "Last year" },
];

function getTopCardsDateRange(rangeKey) {
  const now = moment();
  let start;
  let end;
  switch (rangeKey) {
    case "this_month":
      start = now.clone().startOf("month");
      end = now.clone();
      break;
    case "last_month":
      start = now.clone().subtract(1, "month").startOf("month");
      end = now.clone().subtract(1, "month").endOf("month");
      break;
    case "last_3_months":
      start = now.clone().subtract(2, "months").startOf("month");
      end = now.clone();
      break;
    case "last_6_months":
      start = now.clone().subtract(5, "months").startOf("month");
      end = now.clone();
      break;
    case "this_year":
      start = now.clone().startOf("year");
      end = now.clone();
      break;
    case "last_year":
      start = now.clone().subtract(1, "year").startOf("year");
      end = now.clone().subtract(1, "year").endOf("year");
      break;
    default:
      start = now.clone().startOf("month");
      end = now.clone();
  }
  return {
    startDate: start.format("DD-MM-YYYY HH:mm"),
    endDate: end.format("DD-MM-YYYY HH:mm"),
  };
}

function getTopCardsPeriodLabel(rangeKey) {
  const now = moment();
  switch (rangeKey) {
    case "this_month":
      return `${now.format("MMMM")}`;
    case "last_month":
      return `${now.clone().subtract(1, "month").format("MMMM")}`;
    case "last_3_months":
      return `From ${now.clone().subtract(2, "months").format("MMM")} - ${now.format("MMM")}`;
    case "last_6_months":
      return `From ${now.clone().subtract(5, "months").format("MMM")} - ${now.format("MMM")}`;
    case "this_year":
      return `From ${now.clone().startOf("year").format("MMM YYYY")} - ${now.format("MMM YYYY")}`;
    case "last_year":
      return `From ${now.clone().subtract(1, "year").startOf("year").format("MMM YYYY")} - ${now.clone().subtract(1, "year").endOf("year").format("MMM YYYY")}`;
    default:
      return `For ${now.format("MMMM")}`;
  }
}

const buttons = [
  {
    label: "Total Energy",
    // key: "/",
    icon: <Image preview={false} src="/admin-icons/total-energy-chart.png" alt="" style={{ width: 20, height: 20 }} />,
  },
  {
    label: "Utility Cost",
    // key: "/",
    icon: <Image preview={false} src="/admin-icons/Utility Costs.png" alt="" style={{ width: 20, height: 20 }} />,
  },
  {
    label: "Utility Energy",
    // key: "/",
    icon: <Image preview={false} src="/admin-icons/Utility energy.png" alt="" style={{ width: 20, height: 20 }} />,
  },
  {
    label: "Diesel Cost",
    // key: "/",
    icon: <Image preview={false} src="/admin-icons/Diesel cost.png" alt="" style={{ width: 20, height: 20 }} />,
  },
  {
    label: "Diesel Liters",
    // key: "/",
    icon: <Image preview={false} src="/admin-icons/Diesel liter.png" alt="" style={{ width: 20, height: 20 }} />,
  },
]

const RendeChartsComponents = ({index, downloading}) => {
  switch (index) {
    case 0: return <TotalEnergyChart downloading={downloading} />
     break;
    case 1: return <UtilityCostChart downloading={downloading} /> 
     break;
    case 2: return <UtilityEnergyChart downloading={downloading} /> 
     break;
    case 3: return <DieselCostChart downloading={downloading} /> 
     break;
    case 4: return <DieselLitreChart downloading={downloading} /> 
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
  const [selectedIds, setSelectedIds] = useState([]);
  let options=[]
  const fetchRegionLoading = useSelector(state => state.locationPage.fetchRegionLoading);
  const fetchedRegion = useSelector(state => state.locationPage.fetchedRegion);
  const locationData = useSelector(state => state.locationPage.fetchedLocation);
  if (locationData && locationData.results) {
    locationData.results.map((item) => {
    options.push({
      value: item.id,
      label: item.name,
      key: item.id
    })
  })
  }
  // const selectRegion = OPTIONS.map((o) => !selectedItems.includes(o));
const handleRegionChange = value => {
  setSelectedRegion(value);
};

  const { Search } = Input;
    const [downloading, setDownloading] = useState(false);
    const reportRef = useRef(null);
    const [regionOptions, setRegionOptions] = useState([]);
    const [regionBranchMap, setRegionBranchMap] = useState({});
    const [selectedRegion, setSelectedRegion] = useState(undefined);
    const [topCardsDateRange, setTopCardsDateRange] = useState("this_year");

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

  const topCardsRange = useMemo(
    () => getTopCardsDateRange(topCardsDateRange),
    [topCardsDateRange]
  );
  const topCardsPeriodLabel = useMemo(
    () => getTopCardsPeriodLabel(topCardsDateRange),
    [topCardsDateRange]
  );

  // All useSelector hooks are now at the top
  useEffect(() => {
    if (!clientId) return;
    props.getRegionsListData(clientId);
  }, [clientId]);

  useEffect(() => {
    if (fetchedRegion && fetchedRegion.regions) {
      setRegionOptions(fetchedRegion.regions.map(r => r.region));
      const map = {};
      fetchedRegion.regions.forEach(r => {
        map[r.region] = (r.branches || []).map(b => b.branch_name);
      });
      setRegionBranchMap(map);
    } else {
      setRegionOptions([]);
      setRegionBranchMap({});
    }
  }, [fetchedRegion]);


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
    if (!clientId) return;
    const { startDate: rangeStart, endDate: rangeEnd } = topCardsRange;
    props.getTotalEnergyTopCard(clientId, rangeStart, rangeEnd);
    props.getTotalCostTopCard(clientId, rangeStart, rangeEnd);
  }, [clientId, topCardsRange]);
  useEffect(() => {
    showKeyMetricsTable()
  }, [])
  useEffect(() => {
    if (clientId) {
      props.getLocationsData(clientId);
    }
  }, [clientId])
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
  // Add region filter state if not already present

  // Build branch options based on selected region
  let branchOptions = [];
  if (locationData && locationData.results) {
    if (selectedRegion && regionBranchMap[selectedRegion]) {
      branchOptions = locationData.results
        .filter(item => regionBranchMap[selectedRegion].includes(item.name))
        .map(item => ({ value: item.id, label: item.name, key: item.id }));
    } else {
      branchOptions = locationData.results.map(item => ({ value: item.id, label: item.name, key: item.id }));
    }
  }

  // Filter displayedData by region and branch
  const displayedData = useMemo(() => {
    let data = keyMetricsData;
    if (selectedRegion && regionBranchMap[selectedRegion]) {
      const allowed = new Set(regionBranchMap[selectedRegion]);
      data = data.filter(item => allowed.has(item.name));
    }
    if (selectedIds.length > 0) {
      data = data.filter(item => selectedIds.includes(item.id));
    }
    return data;
  }, [keyMetricsData, selectedRegion, selectedIds, regionBranchMap]);

  // const handleCompareBranches = (e) => {
  //   const filtered = data.filter((item) =>
  //     item
  //   );
  //   setPageDataHolder(filtered)
  //   return filtered.e
  //   setCurrentPage(1);
  // };

  const handleCompareBranches = (Ids) => {
  if (Ids.length <= 5) {
    setSelectedIds(Ids);
  } else {
    message.warning('You can only select up to 5 branches');
  }

    // setCurrentPage(1);
    const filteredBranches = keyMetricsData.filter(item => Ids.includes(item.id))
    // setEnergyChartData(filteredBranches)
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
        phcn_cost: branch.phcn_cost,
        wyre_cost: branch.wyre_cost,
        average_cost: branch.average_cost,
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
        wyre_cost: branch.wyre_cost,
        client_cost: branch.client_cost,
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

  const [selectedBranches, setSelectedBranches] = useState([]);

  const handleBranchSelect = (branches) => setSelectedBranches(branches);

  return (
    <main ref={reportRef}>
      <div className="AppHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 className="mobile-title">
          {downloading ? "Report" : "Admin Overview"}
        </h4>
        {
          !downloading && (
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
          )
         }
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
        <section className="total-energy-bar-chart">
          <div className="top-cards-filter-row">
            <Select
              value={topCardsDateRange}
              onChange={setTopCardsDateRange}
              options={TOP_CARDS_DATE_RANGES}
              loading={props.overviewPage?.fetchTotalCostTopCardLoading || props.overviewPage?.fetchTotalEnergyTopCardLoading}
            />
            <span className="top-cards-period-label">{topCardsPeriodLabel}</span>
          </div>
          <div className="top-cards-grid">
            <div className="top-card-2" style={{ position: "relative" }}>
              {props.overviewPage?.fetchedTotalCostTopCard?.cost_display_color === "red" && (
                <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>
                  <Popover
                    trigger={["hover", "click"]}
                    content={
                      <div style={{ minWidth: 220 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Total monthly cost set target exceeded!</div>
                        <div style={{ fontSize: 12 }}>
                          <div>Cumulative Target: {props.overviewPage?.fetchedTotalCostTopCard?.total_monthly_cost_target?.toLocaleString(undefined, { maximumFractionDigits: 2 })} Naira</div>
                          <div>Monthly Target: {(props.overviewPage?.fetchedTotalCostTopCard?.total_monthly_cost_target / props.overviewPage?.fetchedTotalCostTopCard?.months_in_range).toLocaleString(undefined, { maximumFractionDigits: 2 })} Naira</div>
                          <div>Current: {props.overviewPage?.fetchedTotalCostTopCard?.total_calculated_cost?.toLocaleString(undefined, { maximumFractionDigits: 2 })} Naira</div>
                        </div>
                      </div>
                    }
                  >
                    <InfoCircleOutlined style={{ color: "rgba(0, 0, 0, 0.45)", cursor: "pointer", fontSize: 16 }} />
                  </Popover>
                </div>
              )}
              <Space>
                <div className="top-card-icon-wrap">
                  <Image
                    src="/admin-icons/Total Cost Naira.png"
                    preview={false}
                  />
                </div>
                <div>
                  <Spin spinning={props.overviewPage?.fetchTotalCostTopCardLoading}>
                    <header className={`top-card-value ${props.overviewPage?.fetchedTotalCostTopCard?.cost_display_color === "red" && "negative-value"}`}>
                      {props.overviewPage?.fetchedTotalCostTopCard?.total_calculated_cost?.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      Naira
                    </header>
                  </Spin>
                  <header className="top-card-label">Total Cost</header>
                </div>
              </Space>
            </div>
            <div className="top-card-1">
              <Space>
                <div className="top-card-icon-wrap">
                  <Image
                    src="/admin-icons/energy-card.png"
                    preview={false}
                  />
                </div>
                <div>
                  <Spin spinning={props.overviewPage?.fetchTotalEnergyTopCardLoading}>
                    <header className="top-card-value">
                      {props.overviewPage?.fetchedTotalEnergyTopCard.total_energy?.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      kWh
                    </header>
                  </Spin>
                  <header className="top-card-label">Total Energy</header>
                </div>
              </Space>
            </div>
            <div className="top-card-2">
              <Space>
                <div className="top-card-icon-wrap">
                  <Image
                    src="/admin-icons/CO2 Emission.png"
                    preview={false}
                  />
                </div>
                <div>
                  <Spin spinning={props.overviewPage?.fetchTotalEnergyTopCardLoading}>
                    <header className="top-card-value">
                      {props.overviewPage?.fetchedTotalEnergyTopCard.co2_emmission?.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      tons
                    </header>
                  </Spin>
                  <header className="top-card-label">Co2 Emission</header>
                </div>
              </Space>
            </div>
          </div>
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
            <RendeChartsComponents index={isSelectChart} downloading={downloading} />
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
                className="select-bar metrics-branch"
                mode="multiple"
                placeholder="Select branches"
                maxTagCount={1}
                  maxTagTextLength={10}
                maxTagPlaceholder={omittedValues => `+${omittedValues.length} more`}
                  onChange={handleCompareBranches}
                value={selectedIds}
                style={{ marginRight: 10 }}
                options={branchOptions}
              />
              <Select
                  className="select-bar metrics-region"
                  placeholder="Search by Region"
                  allowClear
                  onChange={setSelectedRegion}
                  value={selectedRegion}
                  style={{ marginRight: 10, width: 180 }}
                  options={regionOptions.map(region => ({ value: region, label: region }))}
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
                  onClick: (event) => {
                    window.location.href = `${window.location.href}branch?ee=${record.id}`;
                  },
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
              downloading={downloading}
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
              downloading={downloading}
            />
          </section>
        ) : isSelectChart === 3 ? (
          <section className="total-energy-bar-chart">
            <GenericBranchBarChart
              tabIndex={isSelectChart}
              chartLabel="Diesel Cost Per Branch"
              data={getDieselCostPerBranchData()}
              seriesConfig={[
                { key: "wyre_cost", label: "Wyre Calculated Cost", color: "#5C12A7" },
                { key: "client_cost", label: "Recorded Cost", color: "#F9CF40" },
              ]}
              onSearch={handleDieselCostSearch}
              onRegionChange={handleRegionChange}
              regionOptions={regionOptions}
              selectedRegion={selectedRegion}
              onDateChange={handleDieselCostMonthChange}
              selectedDate={dayjs(`${dieselCostYear}-${dieselCostMonth}`, "YYYY-M")}
              loading={props.overviewPage.fetchDieselCostPerBranchLoading}
              onBranchSelect={handleBranchSelect}
              selectedBranches={selectedBranches}
              downloading={downloading}
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
              downloading={downloading}
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
              downloading={downloading}
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
  getRegionsListData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
  locationPage: state.locationPage,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminOverview);

import { Button, Card, DatePicker, Image, Input, Space, Spin, Table, Typography, Select, message } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { getKeyMetricsData, getTotalEnergyBarChartData, getTotalEnergyTopCard } from "../../redux/actions/overview/overview.action";
import { useSearchParams } from "react-router-dom";
import { connect, useSelector } from "react-redux";
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
import { Bar } from "react-chartjs-2";
import { getLocationsData } from "../../redux/actions/location/location.action";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


function TotalEnergyChart(props) {
  // const [energyChartData, setEnergyChartData] = useState({
  //   labels: [],
  //   datasets: []
  // })
  const [energyChartData, setEnergyChartData] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const [paginationData, setPaginationData] = useState({})
  const [useEnergyData, setuseEnergyData] = useState([])
  const [holdLocationData, setHoldLocationData] = useState([]);
  const [holdSearchData, setHoldSearchData] = useState("")
  const [selectedDate,setSelectedDate] = useState([dayjs().startOf('month'),
    dayjs(),])
  const [totalEnergyAPIdata, settotalEnergyAPIdata] = useState([]);
  const [pageDataHolder, setPageDataHolder] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // selected in Select
  let selectOptions=[]
  if (holdLocationData) {
    holdLocationData.map((item) => {
      selectOptions.push({
        value: item.id,
        label: item.name,
        key: item.id
      })
    })
  }
  const selectOptionsWithDisabled = selectOptions.map(option => ({
    ...option,
    disabled: selectedIds.length >= 5 && !selectedIds.includes(option.id)
  }));

  const handleRegionChange = value => {
  };
  const displayedData = selectedIds.length === 0
    ? useEnergyData
    : useEnergyData.filter(item => selectedIds.includes(item.id));

  const chartJsData = {
    labels: displayedData.map(item => item.name),
    // labels: breakLabels,
    datasets: [
      {
        label: "Generator",
        data: displayedData.map(item => item.generators_energy),
        backgroundColor: "#43D540",
        borderRadius: 6,
        barThickness: 40,
        maxBarThickness: 40,
      },
      {
        label: "Utility",
        data: displayedData.map(item => item.utility_energy),
        backgroundColor: "#F9CF40",
        borderRadius: 6,
        barThickness: 40,
        maxBarThickness: 40,
      },
    ]
  };
  
  const handleCompareBranch = (Ids) => {
  if (Ids.length <= 5) {
    setSelectedIds(Ids);
  } else {
    message.warning('You can only select up to 5 branches');
  }

    // setCurrentPage(1);
    const filteredBranches = useEnergyData.filter(item => Ids.includes(item.id))
    // setEnergyChartData(filteredBranches)


  };
  useEffect(() => {
    if (props.overviewPage.fetchedKeyMetrics) {
      settotalEnergyAPIdata(props.overviewPage.fetchedKeyMetrics)
    }
  }, [props.overviewPage.fetchedKeyMetrics])
  useEffect(() => {
    setPageDataHolder(totalEnergyAPIdata)
  }, [totalEnergyAPIdata])
  const handleDateChange = (date) => {
    if (!date) return;
    const month = dayjs(date).month() + 1; // JS month is 0-indexed, so add 1
    const year = dayjs(date).year();
    props.getTotalEnergyBarChartData(clientId, month, year);
  };

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);
  const monthFormat = 'MM/YYYY';
  const { RangePicker } = DatePicker;
  const totalPages = paginationData.results

  const clientId = searchParams.get("client_id") || props.auth.userData.client_id;
  const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
  // const endDate = moment().endOf("day").format("DD-MM-YYYY HH:mm");
  const endDate = moment().format("DD-MM-YYYY HH:mm");

  const showTotalEnergyBarchart = (date) => {
    const clientId = props.auth.userData.client_id
    const month = dayjs(date).month() + 1; // JS month is 0-indexed, so add 1
    const year = dayjs(date).year();
    props.getTotalEnergyBarChartData(clientId, month, year)
  }

  const onSelectDateTotalEnergy = (date) => {
    // const date1 = dayjs(date[0]).format("DD-MM-YYYY HH:mm");
    // const date2 = dayjs(date[1]).format("DD-MM-YYYY HH:mm");
    const date1 = dayjs(date[0]).startOf("date").format("DD-MM-YYYY HH:mm");
    const date2 = dayjs(date[1]).endOf("date").format("DD-MM-YYYY HH:mm");
    const inputedDate = dayjs().month(date).format("MM-YYYY HH:mm");
    setSelectedDate([dayjs(date[0]), dayjs(date[1])])
    props.getTotalEnergyBarChartData(clientId, inputedDate)
  }

  const handleMonthChange = (date, dateString) => {
    // `date` is a dayjs object
    // `dateString` is the string like '2025-06'
    // Optionally store or use the first and last days of the selected month
    const startOfMonth = date.startOf('month').format('YYYY-MM-DD');
    const endOfMonth = date.endOf('month').format('YYYY-MM-DD');

    setSelectedDate(date); // or set it as string if needed
    props.getTotalEnergyBarChartData(clientId, date)
  };

  useEffect(() => {
    showTotalEnergyBarchart()
  }, []);
  useEffect(() => {
    const handleBranch = async () => {
      const requestBranchesData = await props.getLocationsData(clientId)
      if (requestBranchesData.fulfilled) {
        setHoldLocationData(requestBranchesData.data.results)
      }
    }
    handleBranch()
  },[])

  const fetchNextPaginatedTotalEnergy = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(paginationData.page) || 0;
    const itemsPerPage = Number(paginationData.items_per_page) || 10;
    const totalPages = Number( paginationData.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      // const paginationQuery = `&current_page=${currentPage+1}&items_per_page=${itemsPerPage}`;
      const paginationQuery = `&page=${currentPage+1}`
      props.getTotalEnergyBarChartData(clientId, startDate, endDate, paginationQuery);
    }
  };

  const fetchPrevPaginatedTotalEnergy = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(paginationData.page) || 0;
    const itemsPerPage = Number(paginationData.items_per_page) || 10;
    if (currentPage && currentPage > 1) {
      // const paginationQuery = `&current_page=${currentPage-1}&items_per_page=${itemsPerPage}`;
      const paginationQuery = `&page=${currentPage-1}`
      props.getTotalEnergyBarChartData(clientId, startDate, endDate, paginationQuery);
    }
  };

  useEffect(() => {

    if (props.overviewPage.fetchedTotalEnergyBarChart) {
      const labels = props.overviewPage.fetchedTotalEnergyBarChart?.map(chart => {
        return chart.name
        })
      const breakLabels = labels.map(label => label.split(' '))
      const data1 = props.overviewPage.fetchedTotalEnergyBarChart?.map(chart => {
        return chart.utility_energy
      })

      const data2 = props.overviewPage.fetchedTotalEnergyBarChart?.map(chart => {
        return chart.generators_energy
      })
      setPaginationData(props.overviewPage.fetchedTotalEnergyBarChart)
      setuseEnergyData(props.overviewPage.fetchedTotalEnergyBarChart)
      // setuseEnergyData()

      const energyDataSource = {
        labels: breakLabels,
        datasets: [
          
          
          {
            label: "Generator",
            data: data2,
            backgroundColor: "#43D540",
            borderRadius: 6,
            barThickness: 40,
            maxBarThickness: 40,
          },
          {
            label: "Utility",
            data: data1,
            backgroundColor: "#094D92",
            borderRadius: 6,
            barThickness: 40,
            maxBarThickness: 40,
          },
          // {
          //   label: "Utility",
          //   data: data1,
          //   backgroundColor: "#094D92",
          //   borderRadius: 6,
          //   barThickness: 40,
          //   maxBarThickness: 40,
          // },
        ],
      };

      // setEnergyChartData(energyDataSource)
    }

  }, [props.overviewPage]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        // align: 'start',
        display: true,
        labels: {
          usePointStyle: true,
          // boxWidth: 6,
        },
      },
      title: {
        display: true,
        text: 'kWh',
        fontWeight: 'bold',
        position: 'left'
      },
    },

    scales: {
      x: {
        ticks: {
          font: {
            weight: 'bold',
          }
        },
        stacked: true,
        grid: {
          drawOnChartArea: false,
        },
      },
      y: {
        stacked: true,
        grid: {
          drawOnChartArea: true,
        },
      },
    },
  };

  const moveLegend = [
    {
      name: 'Position: top',
      handler(chart) {
        chart.options.plugins.legend.position = 'top';
        chart.update();
      }
    },
  ]
  
  const onSearchTotalEnergy = (e) => {
    props.getTotalEnergyBarChartData(clientId, startDate, endDate, 1, e.target.value) 
  }

  const onChange = (pagination, filters, sorter, extra) => {
  };
  const suffix = (
    <SearchOutlined
      onClick={onSearchTotalEnergy}
      style={{
        fontSize: 16,
        color: "white",
      }}
    />
  );
  

  return (
    <>
      <div className="##########">
        {/* {showTotalEnergyPage ? (
        ) : (
          <UtilityCostChart showUtilityCostPage={showUtilityCostPage} />
        )} */}
        <section className="total-energy-bar-chart">
          <Card
            style={{
              // width: 1070,
              // height: 650,
              borderRadius: 22,
            }}
            // loading={props.overviewPage.fetchTotalEnergyBarChartLoading}
          >
            <Spin
              spinning={props.overviewPage.fetchTotalEnergyBarChartLoading}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                <div>
                  <h1
                    style={{
                      fontSize: "17Px",
                    }}
                  >
                    Total Energy
                    {/* {moveLegend} */}
                  </h1>
                </div>
                <div className="search-bar-date-picker">
                  <Search
                    placeholder="Search by name"
                    enterButton
                    className="search-bar"
                    onChange={onSearchTotalEnergy}
                    allowClear
                    style={{
                      marginRight: 10,
                    }}
                  />
                  <Select
                    className="select-bar"
                    mode="multiple"
                    maxTagCount={1}
                    maxTagTextLength={10}
                    maxTagPlaceholder={omittedValues => `+${omittedValues.length} more`}
                    placeholder="Select branches"
                    onChange={handleCompareBranch}
                    value={selectedIds}
                    style={{ marginRight: 10, background: 'white', color: 'black' }}
                    options={selectOptions}
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
                    prefix="Region"
                    defaultValue="lucy"
                    style={{ marginRight: 10 }}
                    onChange={handleRegionChange}
                    options={[]}
                  />
                  <DatePicker
                    className="picker-date"
                    style={{
                      // height: 43
                    }}
                    // defaultValue={[
                    //   // dayjs("01/05/2024", dateFormat),
                    //   // dayjs("31/05/2024", dateFormat),
                    //   dayjs().startOf('month'),
                    //   dayjs(),
                    //   // moment().startOf("month"),
                    //   // moment().endOf("month"),
                    // ]}
                    defaultValue={selectedDate}
                    disabledDate={(current) => {
                      return current && current > dayjs().endOf('month');
                    }}
                    picker="month"
                    format={monthFormat}
                    onChange={handleDateChange}
                  />
                </div>
              </div>
              <Bar
                onLoad={props.overviewPage.fetchTotalEnergyBarChartLoading}
                options={options}
                // data={energyChartData}
                data={chartJsData}
              />
              {/* <Pagination
              totalPosts = {chartPages.lenght} 
              postsPerPage = {postsPerPage}
              setCurrentPage={setCurrentPage}
            /> */}

              {/* <ReactPaginate 
              previousLabel={'Previous'}
              nextLabel={'Next'}
              pageCount={pageCount}
              onPageChange={handlePageChange}
              containerClassName={"paginationBttns"}
              previousLinkClassName={"previousBttn"}
              nextLinkClassName={"nextBtnn"}
              disabledClassName="paginationDisable"
              activeClassName={"paginationActive"}
            /> */}
              {/* <button onClick={fetchNextPaginatedTotalEnergy} >Next</button>
            <button onClick={fetchPrevPaginatedTotalEnergy}>Previous</button> */}
              <div className="pagination">
                <div>
                  <Button onClick={fetchPrevPaginatedTotalEnergy} disabled={paginationData.page===1}>
                    Previous
                  </Button>
                </div>
                <span style={{ margin: '0 8px' }}>
                  Page {paginationData.page} of {paginationData.total_pages}
                </span>
                <div>
                  <Button onClick={fetchNextPaginatedTotalEnergy} disabled={paginationData.page*paginationData.count >= paginationData.count*paginationData.total_pages}>Next</Button>
                </div>
              </div>
            </Spin>
          </Card>
        </section>
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getTotalEnergyTopCard,
  getTotalEnergyBarChartData,
  getLocationsData,
  getKeyMetricsData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalEnergyChart);

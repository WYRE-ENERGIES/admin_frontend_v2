import { Button, Card, DatePicker, Image, Input, Space, Spin, Table, Typography } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getKeyMetricsData, getTotalEnergyBarChartData, getTotalEnergyTopCard } from "../../redux/actions/overview/overview.action";
import { useSearchParams } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import moment from "moment";
import { format } from 'date-fns';
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
import { formatParametersDates } from "../../helpers/genericHelpers";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


function DailyConsumptionChart(props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [paginationData, setPaginationData] = useState({})
  const [holdSearchData, setHoldSearchData] = useState("")
  const [selectedDate,setSelectedDate] = useState([dayjs().startOf('month'),
  dayjs(),])
  const [energyChartData, setEnergyChartData] = useState({
    labels: [],
    datasets: []
  })

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const clientId = searchParams.get("client_id") || props.auth.userData.client_id;
  const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
  // const endDate = moment().endOf("day").format("DD-MM-YYYY HH:mm");
  const endDate = moment().format("DD-MM-YYYY HH:mm");

  const fetchNextPaginatedTotalEnergy = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(paginationData.page) || 0;
    const itemsPerPage = Number(paginationData.items_per_page) || 10;
    const totalPages = Number( paginationData.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      // const paginationQuery = `&current_page=${currentPage+1}&items_per_page=${itemsPerPage}`;
      const paginationQuery = `&page=${currentPage+1}`
      // props.getTotalEnergyBarChartData(clientId, startDate, endDate, paginationQuery);
    }
  };

  const fetchPrevPaginatedTotalEnergy = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(paginationData.page) || 0;
    const itemsPerPage = Number(paginationData.items_per_page) || 10;
    if (currentPage && currentPage > 1) {
      // const paginationQuery = `&current_page=${currentPage-1}&items_per_page=${itemsPerPage}`;
      const paginationQuery = `&page=${currentPage-1}`
      // props.getTotalEnergyBarChartData(clientId, startDate, endDate, paginationQuery);
    }
  };

  useEffect(() => {

    if (props.branchPage.branchDetailsData.daily_consumption_data) {
      const labels = props.branchPage.branchDetailsData.daily_consumption_data.dates?.map(time => {
        return time
        })
      const data1 = props.branchPage.branchDetailsData.daily_consumption_data.devices.map(eachDevice => {
        return eachDevice.daily_kwh
      })
      
      setPaginationData(props.overviewPage.fetchedTotalEnergyBarChart)
      const energyDataSource = {
        labels: labels,
        datasets: [
          {
            label: "Devices",
            data: data1,
            backgroundColor: "#094D92",
            borderRadius: 6,
            barThickness: 40,
            maxBarThickness: 40,
          },
        ],
      };
    }

  }, [props.branchPage]);

  const data = props.branchPage.branchDetailsData.daily_consumption_data
  const newData = {}
  if (data ) {
    const { dates: theDates } = data ? data : { dates: [] };
    const dateStrings = theDates.map((fDate) => format(new Date(fDate), 'dd-MM-yyyy'))
    newData.dates = dateStrings;
    data && data.devices.forEach((deviceData, index) => {
        newData[deviceData.name] = deviceData.daily_kwh;
    })
  }

  const { dates: dateStrings, ...values } = newData ? newData : { dates: [] };
  
  const dataNames = Object.keys(values);
  const dataValues = Object.values(values);

  const colorsArray = [
    '#5C12A7',
    '#00C7E6',
    '#FF3DA1',
    '#82ca9d',
    '#ff9b3d',
    '#360259',
    '#0371b5',
    '#D90000',
    '#757575',
    '#FFE11A',
  ];

  const plottedDataSet = dataNames.map((_, index) => {
    return {
      maxBarThickness: 50,
      label: dataNames[index],
      data: dataValues[index],
      backgroundColor: colorsArray[index],
    };
  });

  const plottedData = {
    labels: dateStrings,
    datasets: plottedDataSet,
  };

  useEffect(() => {

    // if (props.branchPage.branchDetailsData.daily_consumption_data) {
    //   const labels = props.branchPage.branchDetailsData.daily_consumption_data.dates?.map(time => {
    //     return time
    //     })
    //   const data1 = props.branchPage.branchDetailsData.daily_consumption_data.devices.map(eachDevice => {
    //     return eachDevice.daily_kwh
    //   })
      
    //   setPaginationData(props.overviewPage.fetchedTotalEnergyBarChart)
    //   const energyDataSource = {
    //     labels: labels,
    //     datasets: [
    //       {
    //         label: "Devices",
    //         data: data1,
    //         backgroundColor: "#094D92",
    //         borderRadius: 6,
    //         barThickness: 40,
    //         maxBarThickness: 40,
    //       },
    //     ],
    //   };
    // }
    
    const plottedDataSet = dataNames.map((_, index) => {
      return {
        maxBarThickness: 50,
        label: dataNames[index],
        data:dataValues[index],
        backgroundColor: colorsArray[index],
      };
    });
  
    setEnergyChartData(plottedDataSet)
  }, [props.branchPage]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        // align: 'start',
        display: true,
        fontSize: 40,
        fontWeight: 'bold',
        fontFamily: 'Montserrat',
        labels: {
          usePointStyle: true,
          // boxWidth: 6,
          fontSize: 20
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



  return (
    <>
      <div className="##########">
          <Card
            style={{
              // width: 1020,
              // height: 650,
              borderRadius: 16,
              marginTop: 30
            }}
          >
            <Spin
              spinning={props.branchPage.fetchBranchDetailsLoading}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h1
                    style={{
                      fontSize: "17Px",
                    }}
                  >
                    Daily Consumption
                  </h1>
                </div>
              </div>
              <Bar
                onLoad={props.branchPage.fetchBranchDetailsLoading}
                options={options}
                data={plottedData}
              />
              {/* <div className="pagination">
                <div>
                  <Button onClick={fetchPrevPaginatedTotalEnergy}>
                    Previous
                  </Button>
                </div>
                <div>
                  <Button onClick={fetchNextPaginatedTotalEnergy}>Next</Button>
                </div>
              </div> */}
            </Spin>
          </Card>
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getTotalEnergyBarChartData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  branchPage: state.branchPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(DailyConsumptionChart);

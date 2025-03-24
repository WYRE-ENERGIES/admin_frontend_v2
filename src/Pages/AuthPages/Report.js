/* eslint-disable no-restricted-globals */
import React from 'react';

import { Image,Card, Table } from 'antd';

import newReportData from '../../newreport.json'
import { deviationUsageBreakdownColumn, 
  deviationUtitlityAndDieselColumn} from '../../helpers/reportTableColumns.js';

import { Doughnut } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const logoSrc = '/ReportIcons/Wyre-logo.png';
const tilderSrc = '/ReportIcons/tilder.png';
const icon1Src = '/ReportIcons/Icon1.png';
const icon2Src = '/ReportIcons/Icon2.png';
const icon3Src = '/ReportIcons/Icon3.png';
const icon4Src = '/ReportIcons/Icon4.png';


function Report(props) {
  const energy_usage_breakdown= newReportData.energy_deviation.filter((en)=>['Operational Period', 'Non-Operational Period', 'Weekend Period'].includes(en.name))

  const operationalData = newReportData.power_demand.operational;
const nonOperationalData = newReportData.power_demand.non_operational;
  const weekendData = newReportData.power_demand.weekends;

  const energyConsumedDevices = newReportData.energy_consumed.devices;

  const totalEnergy = energyConsumedDevices.reduce((total, device) => total + parseFloat(device.value), 0);
  
const energySourceData = {
  labels: [
    `Inverter: ${energyConsumedDevices.find(d => d.name === 'inverter').value} kWh (${((parseFloat(energyConsumedDevices.find(d => d.name === 'inverter').value) / totalEnergy) * 100).toFixed(1)}%)`,
    `Generator: ${energyConsumedDevices.find(d => d.name === 'gen1').value} kWh (${((parseFloat(energyConsumedDevices.find(d => d.name === 'gen1').value) / totalEnergy) * 100).toFixed(1)}%)`,
    `PHCN: ${energyConsumedDevices.find(d => d.name === 'PHCN').value} kWh (${((parseFloat(energyConsumedDevices.find(d => d.name === 'PHCN').value) / totalEnergy) * 100).toFixed(1)}%)`,
  ],
  datasets: [
    {
      data: energyConsumedDevices.map(device => ((parseFloat(device.value) / totalEnergy) * 100).toFixed(1)),
      backgroundColor: ['#9640FF', '#F9CF40', '#34D5FD'],
      borderWidth: 0,
    },
  ],
};

  const formatDate = (dateString) => {
  const [month, year] = dateString.split('/');
  const date = new Date(year, month - 1);

  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
};

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
    tooltip: {
      enabled: false
    },
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          usePointStyle: false,
          boxWidth: 25,
          boxHeight: 7,
          padding: 20,
          font: {
            family: 'Montserrat',
            size: 14,
            weight: '500'
          },
          generateLabels: function(chart) {
            const datasets = chart.data.datasets;
            const labels = chart.data.labels;
            
            return labels.map((label, i) => ({
              text: label,
              fillStyle: datasets[0].backgroundColor[i],
              strokeStyle: datasets[0].backgroundColor[i],
              lineWidth: 0,
              borderRadius: 4,
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${value}%`;
          }
        }
      },
      datalabels: {
        color: '#FFFFFF',
        font: {
          weight: 'bold',
          size: 16
        },
        formatter: (value) => {
          return value + '%';
        }
      }
    },
    cutout: '55%'
  };

const options = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      left: 10,
      right: 30
    }
  },
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: false
    },
    datalabels: {
      display: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        callback: function(value) {
          return value + 'kWh';
        },
        stepSize: 200,
        max: 1600,
        color: '#666666',
        font: {
          size: 12
        }
      }
    },
    y: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        font: {
          size: 14,
          family: 'Montserrat'
        },
        color: '#666666'
      },
      afterFit: function(scaleInstance) {
        scaleInstance.width = 100;
      }
    }
  },
  barPercentage: 0.8,
  categoryPercentage: 0.9
};
  
  const dataSource = {
  labels: newReportData.energy_consumed.devices.map(device => device.name),
  datasets: [
    {
      data: newReportData.energy_consumed.devices.map(device => device.value),
      backgroundColor: ['#F9CF40', '#34D5FD', '#9640FF', '#4B8AFF'],
      borderRadius: 999,
      barThickness: 35,
      borderSkipped: false,
    }
  ],
};


  const fuelEfficiencyData = newReportData.fuel_efficiency_accuracy_comparison;

const fuelEfficiencyDataSource = [
  {
    key: '1',
    recommended: `${fuelEfficiencyData.recommended.value} ${fuelEfficiencyData.recommended.unit}`,
    achieved: `${fuelEfficiencyData.achieved.value} ${fuelEfficiencyData.achieved.unit}`,
  },
];

const utilityConsumptnColumn = [
  {
    title: 'Energy (kWh)',
    dataIndex: 'energy',
    key: 'energy',
    render: (text, record) => `${record.energy} kWh`
  },
  {
    title: 'Time of use',
    dataIndex: 'time',
    key: 'time',
    render: (text, record) => `${record.time_of_use} hours`
  },
  {
    title: 'Expected bill',
    dataIndex: 'bill',
    key: 'bill',
    render: (text, record) => `N${record.bill}`
  },
  {
    title: 'Last bill accuracy (%)',
    dataIndex: 'accuracy',
    key: 'accuracy',
    render: (text, record) => `${record.accuracy}%`
  }
];

const utilityDataSource = energyConsumedDevices
  .filter((device) => device.type === 'Utility')
  .map((device, index) => ({
    key: index.toString(),
    energy: device.value,
    time_of_use: device.time_of_use,
    bill: device.expected_bill,
    accuracy: device.last_bill_accuracy
  }));

const dieselDataSource = energyConsumedDevices
  .filter((device) => device.type === 'Generator')
  .map((device, index) => ({
    key: index.toString(),
    energy: device.value,
    time_of_use: device.time_of_use,
    bill: device.expected_bill,
    accuracy: device.last_bill_accuracy
  }));

const solarHourConsumptnColumn = [
  {
    title: 'Energy consumed during solar hours (kWh)',
    dataIndex: 'name',
    key: 'name',
    width: '70%'
  },
  {
    title: '',
    dataIndex: 'value',
    key: 'value',
    width: '30%'
  }
];

const powerDemandData = {
  labels: ['operational', 'non-operational', 'weekend hours'],
  datasets: [
    {
      label: 'Min',
      data: [newReportData.power_demand.operational.minimum, newReportData.power_demand.non_operational.minimum, newReportData.power_demand.weekends.minimum],
      backgroundColor: ['#9640FF', '#F9CF40', '#4B8AFF'],
      borderRadius: 30,
      barThickness: 45,
      borderSkipped: false,
      base: 70,
    },
    {
      label: 'Average',
      data: [newReportData.power_demand.operational.average, newReportData.power_demand.non_operational.average, newReportData.power_demand.weekends.average],
      backgroundColor: ['#9640FF', '#F9CF40', '#4B8AFF'],
      borderRadius: 30,
      barThickness: 45,
      borderSkipped: false,
      base: 70,
    },
    {
      label: 'Max',
      data: [newReportData.power_demand.operational.peak, newReportData.power_demand.non_operational.peak, newReportData.power_demand.weekends.peak],
      backgroundColor: ['#9640FF', '#F9CF40', '#4B8AFF'],
      borderRadius: 30,
      barThickness: 45,
      borderSkipped: false,
      base: 70,
    }
  ]
};

const powerDemandOptions = {
  indexAxis: 'x',
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 20,
      bottom: 40,
      left: 20,
      right: 20
    }
  },
  scales: {
    x: {
      stacked: false,
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        font: {
          size: 14,
          family: 'Montserrat'
        }
      }
    },
    y: {
      stacked: false,
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        font: {
          size: 14,
          family: 'Montserrat'
        },
      },
      min: 50,
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.raw} kWh`;
        }
        
      }
    }
  },
  barPercentage: 0.4,  
  categoryPercentage: 0.8
};

const bandCategorizationColumns = [
  {
    title: 'Band',
    dataIndex: 'band',
    key: 'band',
    render: (text) => <span style={{ fontSize: '20px' }}>{text}</span>
  },
  {
    title: 'Total Hours (Achieved)',
    dataIndex: 'totalHours',
    key: 'totalHours',
    render: (text) => <span style={{ fontSize: '20px' }}>{text}</span>
  },
  {
    title: 'Expected Hours',
    dataIndex: 'expectedHours',
    key: 'expectedHours',
    render: (text) => <span style={{ fontSize: '20px' }}>{text}</span>
  },
  {
    title: 'Deviation (±)',
    dataIndex: 'deviation',
    key: 'deviation',
    render: (text) => <span style={{ fontSize: '20px' }}>{text}</span>
  },
  {
    title: 'Percentage Compliance',
    dataIndex: 'compliance',
    key: 'compliance',
    render: (text) => <span style={{ fontSize: '20px' }}>{text}</span>
  }
];

const bandCategorizationData = newReportData.utility_band_categorization.map((band, index) => ({
  key: (index + 1).toString(),
  band: band.band,
  totalHours: `${band.total_hours} hours`,
  expectedHours: `${band.expected_hours} hours`,
  deviation: `${parseInt(band.total_hours) - parseInt(band.expected_hours)} hours`, // Calculating deviation
  compliance: `${((parseInt(band.total_hours) / parseInt(band.expected_hours)) * 100).toFixed(1)}%`,
}));

const bandCategorization = newReportData.utility_band_categorization;

const totalHours = bandCategorization.reduce((acc, band) => acc + parseInt(band.total_hours), 0);
const availableHours = bandCategorization.reduce((acc, band) => acc + parseInt(band.expected_hours), 0);

const bandCategorizationPieData = {
  labels: [
    'Total Month Hours',
    'Total Utility Available Hours'
  ],
  datasets: [{
    data: [totalHours, availableHours],
    backgroundColor: ['#9640FF', '#F9CF40'],
    borderWidth: 0,
    spacing: 0,
    weight: 1,
    circumference: 360
  }]
};

const dataEntryValue = newReportData.data_entry.value; 
const remainingValue = 100 - dataEntryValue;

const dataEntryScoreData = {
  labels: ['Completed', 'Remaining'],
  datasets: [{
    data: [dataEntryValue, remainingValue],
    backgroundColor: ['#9640FF', '#F0F0F0'],
    borderWidth: 0,
    spacing: 0,
    weight: 1,
    circumference: 360,
    rotation: 225
  }]
};

const bandPieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '55%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        font: {
          size: 14,
          family: 'Montserrat',
          weight: '400'
        },
        color: '#515151',
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'white',
      titleColor: '#000',
      bodyColor: '#000',
      padding: 12,
      boxWidth: 10,
      boxHeight: 10,
      boxPadding: 3,
      usePointStyle: true,
      callbacks: {
        title: (context) => {
          const value = context[0].raw;
          const label = context[0].label;
          return label;
        },
        label: (context) => {
          const value = context.raw;
          return `${value} hours (${((value / 720) * 100).toFixed(1)}%)`;
        }
      }
    },
    datalabels: {
      display: true,
      color: '#FFFFFF',
      font: {
        size: 16,
        weight: '500',
        family: 'Montserrat'
      },
      formatter: (value) => {
        return value + 'hrs';
      },
      anchor: 'center'
    }
  }
};

const dataEntryOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '55%',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'white',
      titleColor: '#000',
      bodyColor: '#000',
      padding: 12,
      callbacks: {
        title: () => 'Data Entry Progress',
        label: (context) => {
          const value = context.raw;
          return `${value}% ${context.datasetIndex === 0 ? 'Completed' : 'Remaining'}`;
        }
      }
    },
    datalabels: {
      display: false
    }
  }
};

  return (
    <div className="layer-1">
      <section className="init-space">
        <div className="heading">
          <div className='wyre-logo'>
            <Image width={100} src={logoSrc} />
          </div>
          <h1>
            Monthly Energy Report for Royal-garden<br /> March, {newReportData.year}
          </h1>
          <p>powered by Wyre</p>
        </div>
      </section>
      <section className="init-space">
        <div className="head-card">
          <Card className="title">
            <div>
              <h1 style={{ fontSize: "30Px", textAlign: "center" }}>
                Total Energy Consumed:
              </h1>
            </div>
          </Card>
          <Card className="value">
              <h1 style={{ fontSize: "32Px", textAlign: "center" }}>
              <Image className="tilde" src={tilderSrc} preview={false} />
              <span className="amount" style={{fontSize: "50px", marginLeft: "15px"}}>{newReportData.total_energy.value}</span>
              <span className="unit" style={{fontSize: "18px", fontWeight: "400"}}>{newReportData.total_energy.unit}</span>
              </h1>
          </Card>
        </div>
      </section>
      <section className="init-space">
        <Card className="energy-source-card">
          <div className="energy-source-header">
            <Image className="icon" src={icon1Src} preview={false} />
            <h1>Energy Consumed per Source</h1>
          </div>
          <div className="energy-source-chart">
            <Doughnut 
              width={200}
              data={energySourceData} 
              options={doughnutOptions}
              plugins={[ChartDataLabels]}
            />
          </div>
        </Card>
      </section>
      <section className="init-space">
        <Card className="top-contributors-card">
          <div className="contributors-header">
            <Image className="icon" src={icon1Src} preview={false} />
            <div className="header-content">
              <h1>Top 7 energy contributors</h1>
              <div className="total-energy">{newReportData.total_energy.value}<span>{newReportData.total_energy.unit}</span></div>
            </div>
          </div>
          <div className="chart-container">
            <Bar 
              data={dataSource} 
              options={options} 
              height={300}
            />
          </div>
          <div className="chart-legend">
            {newReportData.energy_consumed.devices.map((device, index) => {
              const deviceValue = parseFloat(device.value);
              const totalEnergy = newReportData.energy_consumed.devices.reduce((total, d) => total + parseFloat(d.value), 0);
              const percentage = ((deviceValue / totalEnergy) * 100).toFixed(2);

              console.log(`Device: ${device.name}, Value: ${deviceValue}, Total Energy: ${totalEnergy}, Percentage: ${percentage}%`);

              return (
                <div className="legend-item" key={index}>
                  <span className="legend-dot" style={{ backgroundColor: device.type === 'Utility' ? '#4B8AFF' : device.type === 'Generator' ? '#F9CF40' : '#9640FF' }}></span>
                  <span className="legend-label">
                    {device.name}: {device.value} kWh ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
      <section className="init-space">
        <div className="consumption-metrics">
          <h1>Consumption Metrics</h1>
          <Card className="metric-container">
            <div className="metric-header">
              <Image className="icon" src={icon2Src} preview={false} />
              <h2>Utility consumption</h2>
            </div>
       <Table 
              pagination={false}
              columns={utilityConsumptnColumn}
              dataSource={utilityDataSource}
/>
          </Card>

          <Card className="metric-container">
            <div className="metric-header">
              <Image className="icon" src={icon3Src} preview={false} />
              <h2>Diesel consumption</h2>
            </div>
            <Table 
              pagination={false}
              columns={utilityConsumptnColumn}
              dataSource={dieselDataSource}
            />
          </Card>

          <Card className="metric-container solar-consumption">
            <div className="metric-header">
              <Image className="icon" src={icon4Src} preview={false} />
              <h2>Solar Hours consumption</h2>
            </div>
            <Table 
              showHeader={false}
              pagination={false}  
              columns={solarHourConsumptnColumn} 
              dataSource={[
                { 
                  key: '0',
                  name: 'Energy consumed during solar hours (kWh)', 
                  value: '678kWh'
                },
                { 
                  key: '1',
                  name: 'Solar percentage (% of total energy)', 
                  value: '29.2%'
                }
              ]} 
            />
          </Card>
        </div>
      </section>
      <section className="init-space consumption-metrics">
        <h1 className="">Operational Performance</h1>

          <Card className="power-demand-card">
            <div className="metric-header">
              <Image className="icon" src={icon1Src} preview={false} />
              <h2>Power Demand</h2>
            </div>
            <div className="chart-container">
              <Bar 
                data={powerDemandData}
                options={powerDemandOptions}
                height={300}
              />
            </div>
            <div className="power-demand-legend">
           <div className="legend-group">
      <div className="legend-item">
        <span className="legend-dot" style={{ backgroundColor: '#9640FF' }}></span>
        <span className="legend-label">Max: {operationalData.peak} kWh</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ backgroundColor: '#9640FF' }}></span>
        <span className="legend-label">Average: {operationalData.average} kWh</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ backgroundColor: '#9640FF' }}></span>
        <span className="legend-label">Min: {operationalData.minimum} kWh</span>
      </div>
    </div>
    <div className="legend-group">
      <div className="legend-item">
        <span className="legend-dot" style={{ backgroundColor: '#F9CF40' }}></span>
        <span className="legend-label">Max: {nonOperationalData.peak} kWh</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ backgroundColor: '#F9CF40' }}></span>
        <span className="legend-label">Average: {nonOperationalData.average} kWh</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ backgroundColor: '#F9CF40' }}></span>
        <span className="legend-label">Min: {nonOperationalData.minimum} kWh</span>
      </div>
    </div>
    <div className="legend-group">
      <div className="legend-item">
        <span className="legend-dot" style={{ backgroundColor: '#4B8AFF' }}></span>
        <span className="legend-label">Max: {weekendData.peak} kWh</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ backgroundColor: '#4B8AFF' }}></span>
        <span className="legend-label">Average: {weekendData.average} kWh</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ backgroundColor: '#4B8AFF' }}></span>
        <span className="legend-label">Min: {weekendData.minimum} kWh</span>
              </div>
              </div>
            </div>
          </Card>
        <div style={{ marginTop: "30px" }} className="metric-container">
          <div
            style={{
              marginLeft: "30px",
              paddingTop: "15px",
              paddingBottom: "10px",
            }}
            className="icon-and-title"
          >
            <Image className="image" src={icon4Src} />
            <div className="icon-title">
              <h1 style={{fontWeight: 500}}>Energy Usage Breakdown</h1>
            </div>
          </div>
          <Table pagination={false} dataSource={energy_usage_breakdown} columns={deviationUsageBreakdownColumn} />
        </div>
        <div className="metric-container">
          <div
            style={{
              marginLeft: "30px",
              paddingTop: "15px",
              paddingBottom: "10px",
            }}
            className="icon-and-title"
          >
            <Image className="image" src={icon3Src} />
            <div className="icon-title">
              <h1 style={{fontWeight: 500}}>Deviation Utility and Diesel</h1>
            </div>
          </div>
          <Table pagination={false} dataSource={newReportData.energy_deviation} columns={deviationUtitlityAndDieselColumn} />
        </div>
      </section>
      <section className="init-space consumption-metrics">
        <h1>Generator Size Efficiency Accuracy</h1>
        <div className="generator-efficiency">
          <Card className="current">
            <div>
              <h2>Current Month Efficiency</h2>
              <div className="efficiency-value">
             {newReportData.generator_size_efficiency.current_month.value}{newReportData.generator_size_efficiency.current_month.unit}
                <span className="change-indicator">{newReportData.generator_size_efficiency.current_month.value - newReportData.generator_size_efficiency.previous_month.value}{newReportData.generator_size_efficiency.previous_month.unit}</span>
              </div>
            </div>
          </Card>
          <Card className="best-ever">
            <div>
              <h2>Best Ever Efficiency</h2>
              <div className="efficiency-value">
                {newReportData.generator_size_efficiency.best_month.value}{newReportData.generator_size_efficiency.best_month.unit}
                <div className="achieved-date">Achieved: {formatDate(newReportData.generator_size_efficiency.best_month.date)}</div>
              </div>
            </div>
          </Card>
        </div>
        <Card className="metric-container">
          <h2 className="comparison-title">
            Fuel Efficiency Accuracy Comparison
            <span className="accuracy-badge">Accuracy: {newReportData.fuel_efficiency_accuracy_comparison.accuracy.value}{newReportData.fuel_efficiency_accuracy_comparison.accuracy.unit}</span>
          </h2>
          <Table 
            pagination={false}
            columns={[
              {
                title: 'Recommended',
                dataIndex: 'recommended',
                key: 'recommended',
              },
              {
                title: 'Achieved',
                dataIndex: 'achieved',
                key: 'achieved',
              }
            ]}
            dataSource={fuelEfficiencyDataSource}
          />
        </Card>
        <div style={{ marginTop: '30px' }} className="metric-container">
          <div
            style={{
              marginLeft: "30px",
              paddingTop: "15px",
              paddingBottom: "10px",
            }}
            className="icon-and-title"
          >
            <Image className="image" src={icon2Src} />
            <div className="icon-title">
              <h1 style={{fontWeight: 500}}>Band Categorization</h1>
            </div>
          </div>
          <Table 
            pagination={false}
            columns={bandCategorizationColumns}
            dataSource={bandCategorizationData}
            className="band-table"
          />
        </div>
        <div className="bottom-doughnut">
          <Card className="band-category">
            <h2>Band Categorization pie chat</h2>
            <div className='doughnut-container'>
              <Doughnut 
                data={bandCategorizationPieData} 
                options={bandPieOptions}
                plugins={[ChartDataLabels]}
              />
            </div>
          </Card>
          <Card className="data-entry">
            <h2>Data Entry Score</h2>
            <div className='doughnut-container' style={{ position: 'relative' }}>
              <Doughnut 
                data={dataEntryScoreData} 
                options={dataEntryOptions}
                plugins={[ChartDataLabels]}
              />
                <p style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#000'
              }}>
                {dataEntryValue}{newReportData.data_entry.unit}
              </p>
            </div>
            <p className="data-entry-subtitle">
              Progress bar based on completeness of system inputs
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}


export default Report;
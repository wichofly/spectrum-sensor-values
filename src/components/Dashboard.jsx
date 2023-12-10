import { useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Stack, Alert, Box, Button, Snackbar } from '@mui/material';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import axios from 'axios';

const getData = () => {
  return axios(
    'https://webfrontendassignment-isaraerospace.azurewebsites.net/api/SpectrumStatus'
  );
};

const getGaugeData = (value, text, min, max) => {
  return [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value,
      title: { text },
      type: 'indicator',
      mode: 'gauge+number',
      gauge: {
        axis: { range: [min, max] },
      },
    },
  ];
};

const Dashboard = () => {
  const [currentData, setCurrentData] = useState(null);
  const [allData, setAllData] = useState([]);
  const layout = { width: 300, height: 250, margin: { t: 0, b: 0 } };
  const layoutLineChart = { width: 500, height: 300 };

  const getLineChartData = (type) => {
    return {
      x: allData.map((d) => d.timestamp),
      y: allData.map((d) => d[type]),
      type: 'scatter',
    };
  };

  const update = () => {
    getData().then((res) => {
      setCurrentData(res.data);
      setAllData(allData.concat([{ ...res.data, timestamp: new Date() }]));
      const gaugeData = {
        velocity: getGaugeData(res.data.velocity, 'Velocity', -100, 100),
        altitude: getGaugeData(res.data.altitude, 'Altitude', -100000, 0),
        temperature: getGaugeData(
          res.data.temperature,
          'Temperature',
          -100,
          100
        ),
      };

      const lineData = {
        velocity: getLineChartData('velocity'),
        altitude: getLineChartData('altitude'),
        temperature: getLineChartData('temperature'),
      };

      Plotly.newPlot('gauge-velocity', gaugeData.velocity, layout);
      Plotly.newPlot('gauge-altitude', gaugeData.altitude, layout);
      Plotly.newPlot('gauge-temperature', gaugeData.temperature, layout);

      Plotly.newPlot('line-velocity', [lineData.velocity], {
        title: 'Velocity',
        ...layoutLineChart,
      });
      Plotly.newPlot('line-altitude', [lineData.altitude], {
        title: 'Altitude',
        ...layoutLineChart,
      });
      Plotly.newPlot('line-temperature', [lineData.temperature], {
        title: 'Temperature',
        ...layoutLineChart,
      });
    });
  };

  useEffect(() => {
    update();
  }, []);

  const alertWidth = 500;

  if (!currentData) return <></>;

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Button onClick={update} variant="outlined">
        Update
      </Button>
      <Alert
        sx={{ width: alertWidth, mt: 2 }}
        severity={currentData.isActionRequired ? 'error' : 'info'}
      >
        {currentData.statusMessage}
      </Alert>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        autoHideDuration={1000}
        open={currentData.isActionRequired}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          Your action is required
        </Alert>
      </Snackbar>
      <Stack direction="row">
        <div id="gauge-velocity"></div>
        <div id="gauge-altitude"></div>
        <div id="gauge-temperature"></div>
      </Stack>
      <ArrowCircleUpIcon
        sx={{
          fontSize: 70,
          transform: !currentData.isAscending && 'rotate(-180deg)',
        }}
      />
      <div>{currentData.isAscending ? 'Ascending' : 'Descending'}</div>
      <Stack direction="row">
        <div id="line-velocity"></div>
        <div id="line-altitude"></div>
        <div id="line-temperature"></div>
      </Stack>
    </Box>
  );
};

export default Dashboard;

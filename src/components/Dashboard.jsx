import { useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Stack, Alert, Box, Button, Snackbar } from '@mui/material';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import axios from 'axios';

const socket = new WebSocket(
  'wss://webfrontendassignment-isaraerospace.azurewebsites.net/api/SpectrumWS'
);

const actOnSpectrum = () => {
  return axios(
    'https://webfrontendassignment-isaraerospace.azurewebsites.net/api/ActOnSpectrum'
  );
};

const Dashboard = () => {
  const [currentData, setCurrentData] = useState(null);
  const [allData, setAllData] = useState([]);

  const layoutGuage = { width: 300, height: 250, margin: { t: 0, b: 0 } };
  const layoutLineChart = { width: 500, height: 300 };

  const getGaugeData = (type, min, max) => {
    console.log(type);
    console.log(currentData[type]);
    return [
      {
        domain: { x: [0, 1], y: [0, 1] },
        value: currentData[type],
        title: { text: type },
        type: 'indicator',
        mode: 'gauge+number',
        gauge: {
          axis: { range: [min, max] },
        },
      },
    ];
  };

  const getLineChartData = (type) => {
    return {
      x: allData.map((d) => d.timestamp),
      y: allData.map((d) => d[type]),
      type: 'scatter',
    };
  };

  const update = (_allData, _data) => {
    setCurrentData(_data);
    _allData.push({ ..._data, timestamp: new Date() });
    setAllData(_allData);
  };

  useEffect(() => {
    if (!currentData) return;
    const gaugeData = {
      velocity: getGaugeData('Velocity', -100, 100),
      altitude: getGaugeData('Altitude', -100000, 0),
      temperature: getGaugeData('Temperature', -100, 100),
    };

    const lineData = {
      velocity: getLineChartData('Velocity'),
      altitude: getLineChartData('Altitude'),
      temperature: getLineChartData('Temperature'),
    };

    Plotly.newPlot('gauge-velocity', gaugeData.velocity, layoutGuage);
    Plotly.newPlot('gauge-altitude', gaugeData.altitude, layoutGuage);
    Plotly.newPlot('gauge-temperature', gaugeData.temperature, layoutGuage);
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
  }, [currentData]);

  useEffect(() => {
    if (socket.onmessage) return;
    socket.onmessage = (event) => {
      update(allData, JSON.parse(event.data));
    };
  }, []);

  const alertWidth = 500;

  if (!currentData) return <></>;

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <Box>
          <Alert
            sx={{ width: alertWidth, mr: 3 }}
            severity={currentData.IsActionRequired ? 'error' : 'info'}
          >
            {currentData.StatusMessage}
          </Alert>
        </Box>
        <Box>
          <ArrowCircleUpIcon
            sx={{
              fontSize: 70,
              transform: !currentData.IsAscending && 'rotate(-180deg)',
            }}
          />
          <div>{currentData.IsAscending ? 'Ascending' : 'Descending'}</div>
        </Box>
      </Stack>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        autoHideDuration={1000}
        open={currentData.IsActionRequired}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          Your action is required{' '}
          <Button
            size="small"
            onClick={actOnSpectrum}
            sx={{ ml: 2 }}
            color="error"
            variant="contained"
          >
            Act now!
          </Button>
        </Alert>
      </Snackbar>
      
      <Stack direction="row">
        <div id="gauge-velocity"></div>
        <div id="gauge-altitude"></div>
        <div id="gauge-temperature"></div>
      </Stack>

      <Stack direction="row">
        <div id="line-velocity"></div>
        <div id="line-altitude"></div>
        <div id="line-temperature"></div>
      </Stack>
    </Box>
  );
};

export default Dashboard;

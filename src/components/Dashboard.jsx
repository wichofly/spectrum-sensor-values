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

      Plotly.newPlot('gauge-velocity', gaugeData.velocity, layout);
      Plotly.newPlot('gauge-altitude', gaugeData.altitude, layout);
      Plotly.newPlot('gauge-temperature', gaugeData.temperature, layout);
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
    </Box>
  );
};

export default Dashboard;

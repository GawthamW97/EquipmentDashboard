import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import API from "../api/API";
import { Typography, Card, Container, LinearProgress } from "@material-ui/core";

// return the total number of equipments for each category as an array
const getEpuipmentQuantity = (obj) => {
  let yValue = [];
  //get the length of the array stored in
  for (let i = 0; i < Object.keys(obj).length; i++) {
    yValue.push(obj[Object.keys(obj)[i]].length);
  }
  return yValue;
};

// retuns the total number of operational and non-operational equipments as an array
const getEquipmentStatus = (data) => {
  let countOp = 0; //number of operational equipments
  let countNon = 0; // number of non-operationl equipments
  //Count the number of operational and non-operational equipments
  for (const dataObj of data) {
    if (dataObj.OperationalStatus === "Operational") {
      countOp = countOp + 1;
    } else {
      countNon = countNon + 1;
    }
  }
  return [countOp, countNon];
};

//returns an object that contains the AssetCategoryID's as the Key
const getEquipmentType = (obj, data) => {
  let compareSet = new Set(); // a Set data structure is used to avoid data duplication
  //change the data type of the values in "set" object to array so that the AssertID can be pushed.
  if (Object.keys(obj).length === 0) {
    for (const dataObj of data) {
      obj[dataObj.AssetCategoryID] = [];
    }
  } else {
    //check for new AssetCategoryID from the new api call
    //compare the new set of AssetCategoryID with the previous one and get the different set of values
    //then update the exisiting "set" object with the new Keys with the value type of array.
    for (const dataObj of data) {
      compareSet.add(dataObj.AssetCategoryID);
    }

    //getting the new fields
    let difference = Array.from(compareSet).filter(
      (x) => !Object.keys(obj).includes(x)
    );

    //setting the new fields value data type to array to push the AssertID
    for (let i = 0; i < difference.length; i++) {
      obj[difference[i]] = [];
    }
  }
  return obj;
};

const Graph = () => {
  let EquipmentData = {};

  //react hooks
  const [chartData, setChartData] = useState({}); //contains the dataset to be displayed in a graph
  const [operational, setOperational] = useState(0); //contains the integer value of the Operational
  const [nonOperational, setNonOperational] = useState(0); //contains the integer value of the Non-Operational
  const [lastValue, setLastValue] = useState(0); //used to update the last value used in the api call
  const [apiData, setApiData] = useState(EquipmentData); //contains the API data
  const [status, setStatus] = useState(false); //the visibility of the chart is controlled based on the staus value

  const chart = async (maxValue) => {
    const response = await API.get("/All", {
      params: {
        apikey: "SC:demo:64a9aa122143a5db",
        max: maxValue,
        last: lastValue,
      },
    });

    const { data } = response;
    //check whether this is the first api call
    //if its not the first call then the previous set of values will be passed from "apiData" to "EquipmentData".
    if (apiData.length !== 0) {
      EquipmentData = apiData;
    }

    //the getEquipmentType() will set the data recieved from each api call to "EquipmentData"
    //[Key] of the object will be AssetCategoryID
    //[Value] of the object will be an array containing the corresponding AssetID
    EquipmentData = getEquipmentType(EquipmentData, data);

    //push the AssetID values for the corresponding AssetCategoryID in the object.
    for (const dataObj of data) {
      EquipmentData[dataObj.AssetCategoryID].push(dataObj.AssetID);
    }

    //pass the values to the state.
    setApiData(EquipmentData);
    setOperational(operational + getEquipmentStatus(data)[0]);
    setNonOperational(nonOperational + getEquipmentStatus(data)[1]);
    setChartData({
      labels: Object.keys(EquipmentData),
      datasets: [
        {
          label: "Quantity",
          backgroundColor: "#3949ab",
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 2,
          data: getEpuipmentQuantity(EquipmentData),
        },
      ],
    });
    if (data[maxValue - 1]) {
      setLastValue(data[maxValue - 1].__rowid__);
    } else {
      setStatus(true); //when api call has returned all the data the "status" value will be updated so that the chart can be seen.
    }
  };

  useEffect(() => {
    chart(95); //max value that will passed in the api call
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastValue]);

  return (
    <div>
      {/* a ternary operation is done
        the chart will not be shown until all data are received fromt the api call.
        after receiving the data the "staus" hook variable will be updataed which will display the chart.
      */}
      {status ? (
        <div>
          <ul>
            <Container style={{ width: "60%" }} align="center">
              <Card elevation={5}>
                <li style={{ display: "inline-flex" }}>
                  <Typography variant="h5" style={{ padding: "10px" }}>
                    <b>Operational</b> - {operational}
                  </Typography>
                </li>
                <li style={{ display: "inline-flex" }}>
                  <Typography variant="h5" style={{ padding: "10px" }}>
                    <b>Non-Operational</b> - {nonOperational}
                  </Typography>
                </li>
              </Card>
            </Container>
          </ul>

          <Card elevation={5} style={{ marginBottom: "20px" }}>
            <Bar
              data={chartData}
              options={{
                title: {
                  display: true,
                  text: "Equipments",
                  fontSize: 20,
                },
                scales: {
                  xAxes: [
                    {
                      scaleLabel: {
                        labelString: "Equipment Types",
                        display: true,
                        fontSize: 20,
                      },
                    },
                  ],
                  yAxes: [
                    {
                      scaleLabel: {
                        labelString: "Equipment Quantity",
                        display: true,
                        fontSize: 20,
                      },
                    },
                  ],
                },
                legend: {
                  display: true,
                },
              }}
              style={{ borderColor: "soild black 1px" }}
            />
          </Card>
        </div>
      ) : (
        // returns the loading screen for the dashboard
        <div>
          <Card align="center" style={{ marginTop: "100px" }}>
            <Typography variant="h3">Fetching data please wait....</Typography>
            <LinearProgress />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Graph;

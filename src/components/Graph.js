import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import API from "../api/API";
import { Typography, Card, Container } from "@material-ui/core";

const Graph = () => {
  let set = {};
  const [chartData, setChartData] = useState({}); //contains the dataset to be displayed in a graph
  const [operational, setOperational] = useState(0); //contains the integer value of the Operational
  const [nonOperational, setNonOperational] = useState(0); //contains the integer value of the Non-Operational
  const [lastValue, setLastValue] = useState(0); //used to update the last value used in the api call
  const [apiData, setApiData] = useState(set); //contains the API data

  let countOp = 0;
  let countNon = 0;
  const yValue = [];
  let compareSet = new Set(); // a Set data structure is used to avoid data duplication

  const chart = async (maxValue) => {
    const response = await API.get("/All", {
      params: {
        apikey: "SC:demo:64a9aa122143a5db",
        max: maxValue,
        last: lastValue,
      },
    });

    //check whether this is the first api call
    //if its not the first call then the previous set of values will be passed from "apiData" to "set".
    if (apiData.length !== 0) {
      set = apiData;
    }

    //change the value type in Key=>Value pair of the "set" object to array so that the assertID can be pushed.
    if (Object.keys(set).length === 0) {
      for (const dataObj of response.data) {
        set[dataObj.AssetCategoryID] = [];
      }
    } else {
      //check for new AssetCategoryID from the new api call
      //compare the new set of AssetCategoryID with the previous one and get the different set of values
      //then update the exisiting "set" object with the new Keys with the value type of array.
      for (const dataObj of response.data) {
        compareSet.add(dataObj.AssetCategoryID);
      }

      //getting the new fields
      let difference = Array.from(compareSet).filter(
        (x) => !Object.keys(set).includes(x)
      );

      for (let i = 0; i < difference.length; i++) {
        set[difference[i]] = [];
      }
    }

    //store the data recieved from each api call
    //[Key] of the object will be AssetCategoryID
    //[Value] of the object will be an array containing the corresponding AssetID
    for (const dataObj of response.data) {
      set[dataObj.AssetCategoryID].push(dataObj.AssetID);
      setApiData({
        ...apiData,
        [dataObj.AssetCategoryID]: [set[dataObj.AssetID]],
      });
    }

    //get the length of the array stored in
    for (let i = 0; i < Object.keys(set).length; i++) {
      yValue.push(set[Object.keys(set)[i]].length);
    }

    //Count the number of operational and non-operational equipments
    for (const dataObj of response.data) {
      if (dataObj.OperationalStatus === "Operational") {
        countOp = countOp + 1;
      } else {
        countNon = countNon + 1;
      }
    }

    //pass the values to the state.
    setApiData(set);
    setOperational(operational + countOp);
    setNonOperational(nonOperational + countNon);
    setChartData({
      labels: Object.keys(set),
      datasets: [
        {
          label: "Quantity",
          backgroundColor: "#3949ab",
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 2,
          data: yValue,
        },
      ],
    });
    if (response.data[maxValue - 1]) {
      setLastValue(response.data[maxValue - 1].__rowid__);
    }
  };
  useEffect(() => {
    chart(50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastValue]);

  return (
    <div>
      <ul>
        <Container style={{ width: "40%" }} align="center">
          <Card>
            <li style={{ display: "inline-flex" }}>
              <Typography
                variant="h5"
                style={{ padding: "5px", borderRight: "solid black 1px" }}
              >
                Operational - {operational}
              </Typography>
            </li>
            <li style={{ display: "inline-flex" }}>
              <Typography variant="h5" style={{ padding: "5px" }}>
                Non-Operational- {nonOperational}
              </Typography>
            </li>
          </Card>
        </Container>
      </ul>

      <Card>
        <Bar
          data={chartData}
          options={{
            title: {
              display: true,
              text: "Equipments",
              fontSize: 20,
            },
            legend: {
              display: true,
              position: "right",
            },
          }}
          style={{ borderColor: "soild black 1px" }}
        />
      </Card>
    </div>
  );
};

export default Graph;

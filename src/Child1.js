import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";

class Child1 extends Component {
  state = {
    company: "Apple", 
    selectedMonth: "November"
  };

  //========================================================================================================================
  // tracking previous props and state
  prevProps = {};
  prevState = {};

  //========================================================================================================================
  componentDidMount() {
    //when the component mounts for the first time these are the values initialized
    this.prevProps = { ...this.props };
    this.prevState = { ...this.state };
    this.renderChart();
  }
//========================================================================================================================
  componentDidUpdate() {
    // check the previous data with current data or check the previous Company with previous one and check previous and current month
    if (this.prevProps.csv_data !== this.props.csv_data || this.prevState.company !== this.state.company || this.prevState.selectedMonth !== this.state.selectedMonth) {
      this.renderChart(); // re render with updated selection
    }

    // compare the next update with the recent props and state
    this.prevProps = { ...this.props };
    this.prevState = { ...this.state };
  }
//========================================================================================================================
  //when a new company is selected this is called
  CompanyChange = (event) => {
    this.setState({ company: event.target.value });
  };
  //when a new month is seleceted this is called
  MonthChange = (event) => {
    this.setState({ selectedMonth: event.target.value });
  };
//========================================================================================================================
 
renderChart = () => {
    const { csv_data } = this.props;
    const { company, selectedMonth } = this.state;

    const filteredData = csv_data.filter((item) => {
      // Check if the item's Company matches the selected company
      const isCompanyMatch = item.Company === company;
    
      // Convert date to a JavaScript Date object
      const itemDate = new Date(item.Date);
    
      // Extracts the month from the Date object as a full name
      const itemMonth = itemDate.toLocaleString("default", { month: "long" });
    
      // Check if the extracted month matches the selected month
      const isMonthMatch = itemMonth === selectedMonth;
    
      // Include this item only if both conditions are met
      return isCompanyMatch && isMonthMatch;
    });
    d3.select("#chart").selectAll("*").remove(); // Clear existing chart
//========================================================================================================================    
    // dimensions of the chart
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
//========================================================================================================================
   
//scaleTime for the x-axis to represent time
    const xScale = d3.scaleTime().domain(d3.extent(filteredData, (d) => d.Date)).range([0, width]);
    //scaleLinear for the y-axis to represent prices
    const yScale = d3.scaleLinear().domain([
        d3.min(filteredData, (d) => Math.min(d.Open, d.Close)),
        d3.max(filteredData, (d) => Math.max(d.Open, d.Close))
      ]).range([height, 0]);
    
    const line = (key) =>d3.line().x((d) => xScale(d.Date))
        .y((d) => yScale(d[key])).curve(d3.curveCardinal); //for curve line
    //Adding open prices line to the chart 
        svg.append("path").datum(filteredData)
        .attr("class", "line-open") // class name to use it in css file
        .attr("d", line("Open")); 
      
    //adding closed prices line to the chart
        svg.append("path").datum(filteredData)
        .attr("class", "line-close") // class name to use it in css file
        .attr("d", line("Close"));


//========================================TOOL TIP================================================================================        
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    const showTooltip = (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`
          <div class="tooltip-content">
            <p>Date: ${d.Date.toDateString()}</p>
            <p>Open: ${d.Open.toFixed(2)}</p>
            <p>Close: ${d.Close.toFixed(2)}</p>
            <p>Difference: ${(d.Close - d.Open).toFixed(2)}</p>
          </div>
        `)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    };
//=======================================OPEN AND CLOSE DOTS=================================================================================  

    svg
  .selectAll(".open-dot")
  .data(filteredData)
  .enter()
  .append("circle")
  .attr("class", "open-dot") // Add a class for the open dots
  .attr("cx", (d) => xScale(d.Date))
  .attr("cy", (d) => yScale(d.Open))
  .on("mouseover", (event, d) => showTooltip(event, d))
  .on("mousemove", (event) => { tooltip
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 20 + "px");
  })
  .on("mouseout", () => {tooltip.style("opacity", 0);

    });


  svg
  .selectAll(".close-dot")
  .data(filteredData)
  .enter()
  .append("circle")
  .attr("class", "close-dot") 
  .attr("cx", (d) => xScale(d.Date))
  .attr("cy", (d) => yScale(d.Close))
  .on("mouseover", (event, d) => showTooltip(event, d))
  .on("mousemove", (event) => {
    tooltip
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 20 + "px");
  })
  .on("mouseout", () => {tooltip.style("opacity", 0);
  });
  const legendGroup = svg.append("g")
  .attr("class", "legend-group")
  .attr("transform", "translate(700, 20)"); 
//================================ LEGEND ========================================================================================
// LEGEND FOR OPEN PRICES
legendGroup.append("circle")
  .attr("class", "legend-circle open-legend")
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("r", 5);

legendGroup.append("text")
  .attr("class", "legend-text open-legend-text")
  .attr("x", 10)
  .attr("y", 2)
  .text("Open")
  .style("font-size", "12px")
  .style("alignment-baseline", "middle");
//========================================================================================================================
// LEGEND FOR CLOSE PRICES
legendGroup.append("circle")
  .attr("class", "legend-circle close-legend")
  .attr("cx", 0)
  .attr("cy", 20)
  .attr("r", 5);

legendGroup.append("text")
  .attr("class", "legend-text close-legend-text")
  .attr("x", 10)
  .attr("y", 22)
  .text("Close")
  .style("font-size", "12px")
  .style("alignment-baseline", "middle");
//=========================== AXIS =============================================================================================

//X-axis
      svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "start") // Left-align the text
      .attr("dx", "0.5em") // Horizontal offset
      .attr("dy", "0.15em") // Vertical offset
      .attr("transform", "rotate(45)"); // Rotate the labels
//Y-Axis
    svg.append("g").call(d3.axisLeft(yScale));
  svg.append("text").attr("class", "x-axis-label").attr("x", width / 2).attr("y", height + margin.bottom).attr("text-anchor", "middle")
  .text("Date");

svg.append("text").attr("class", "y-axis-label").attr("x", -height / 2).attr("y", -margin.left / 1.5).attr("transform", "rotate(-90)") // rotation of the dates
  .attr("text-anchor", "middle")
  .text("Price");
  };

  render() {
    const options = ["Apple", "Microsoft", "Amazon", "Google", "Meta"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return (
      //==========================RADIO BUTTONS and DropDown==============================================================================================
      <div className="child1">
        <div className="controls">
          <h3>Select a Company:</h3>
          {options.map((option) => (
            <label key={option}>
              <input type="radio" name="Radio_button" value={option} checked={this.state.company === option} onChange={this.CompanyChange}/>
              {option}
            </label>
          ))}
          <h3>Select a Month:</h3>
          <select
            value={this.state.selectedMonth}
            onChange={this.MonthChange}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div id="chart"></div>
      </div>
    );
  }
}

export default Child1;

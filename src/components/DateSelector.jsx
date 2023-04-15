import React, { useState } from "react";

function DateSelector({selectedDate, setSelectedDate}) {
  // const [selectedDate, setSelectedDate] = useState(new Date());

  function handleDateChange(e) {
    setSelectedDate(new Date(e.target.value));
    // console.log(new Date(e.target.value).getTime());
  }

  function getDate(){
    console.log("selectedDate", selectedDate);
  }

  return (
    <div>
      <label htmlFor="date-picker">Select a start date:</label>
      <input
        id="date-picker"
        type="date"
        value={selectedDate.toISOString().slice(0, 10)}
        onChange={handleDateChange}
      />
      {/* <p>You selected: {selectedDate}</p> */}
      <button onClick={getDate}>getDate</button>
    </div>
  );
}

export default DateSelector;
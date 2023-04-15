import React from "react";

function DateSelector({ selectedDate, setSelectedDate }) {

  function handleDateChange(e) {
    setSelectedDate(new Date(e.target.value));
  }

  return (
    <div>
      <label htmlFor="date-picker">Select a start date: </label>
      <input
        id="date-picker"
        type="date"
        value={selectedDate.toISOString().slice(0, 10)}
        onChange={handleDateChange}
      />
    </div>
  );
}

export default DateSelector;
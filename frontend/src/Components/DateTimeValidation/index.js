import * as React from "react";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateTimePicker from "@mui/lab/DateTimePicker";
import Stack from "@mui/material/Stack";

export default function DateTimeValidation() {
  const [value, setValue] = React.useState(new Date());

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <DateTimePicker
          id="datetimepicker"
          renderInput={(params) => <TextField {...params} />}
          label="Pick a date and Time"
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          minDate={new Date()}
          minTime={new Date(0, 0, 0, 9)}
          maxTime={new Date(0, 0, 0, 17)}
        />
      </Stack>
    </LocalizationProvider>
  );
}

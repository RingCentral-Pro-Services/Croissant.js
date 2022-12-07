import { FormControl, FormControlLabel, MenuItem, Select, styled, Switch, SwitchProps, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

const DailySchedule = (props: {label: string, times: string[], setTo: (value: string) => void, setFrom: (value: string) => void}) => {
    const {label, times, setTo, setFrom} = props
    const [isEnabled, setIsEnabled] = useState(false)
    const [toSelection, setToSelection] = useState('')
    const [fromSelection, setFromSelection] = useState('')
    const [timeOptions, setTimeOptions] = useState<string[]>([])

    useEffect(() => {
        setTimeOptions(times)
    }, [])

    useEffect(() => {
        if (fromSelection && fromSelection !== '') {
            setFrom(convertTo24Hour(fromSelection))
        }
        if (toSelection && toSelection !== '') {
            setTo(convertTo24Hour(toSelection))
        }
    }, [toSelection, fromSelection])

    const convertTo24Hour = (time: string) => {
        const [timeString, modifier] = time.split(' ');
        let [hours, minutes] = timeString.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
            hours = (parseInt(hours) + 12).toString();
        }
        return `${hours}:${minutes}`;
    }

    const IOSSwitch = styled((props: SwitchProps) => (
        <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
      ))(({ theme }) => ({
        width: 42,
        height: 26,
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: 2,
          transitionDuration: '300ms',
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
              opacity: 1,
              border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.5,
            },
          },
          '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: '6px solid #fff',
          },
          '&.Mui-disabled .MuiSwitch-thumb': {
            color:
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[600],
          },
          '&.Mui-disabled + .MuiSwitch-track': {
            opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
          },
        },
        '& .MuiSwitch-thumb': {
          boxSizing: 'border-box',
          width: 22,
          height: 22,
        },
        '& .MuiSwitch-track': {
          borderRadius: 26 / 2,
          backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
          opacity: 1,
          transition: theme.transitions.create(['background-color'], {
            duration: 500,
          }),
        },
      }));

    return (
        <div className="schedule-builder-item">
            <div className="schedule-builder-toggle-box">
                <FormControlLabel control={<IOSSwitch checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />} label={label} />
            </div>
            <div className={isEnabled ? 'inline' : ''} hidden={!isEnabled}>
                <Typography sx={{display: 'inline-block', paddingRight: 1}}>From</Typography>
                <Select
                    // autoWidth
                    sx={{minWidth: 150}}
                    size="small"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={fromSelection}
                    defaultValue={'8:00 AM'}
                    onChange={(e) => setFromSelection(e.target.value as string)}
                >
                    {times.map((option, index) => (
                        <MenuItem value={option}>{option}</MenuItem>
                    ))}
                </Select>
                <Typography sx={{display: 'inline-block', paddingRight: 1, paddingLeft: 3}}>To</Typography>
                <Select
                    // autoWidth
                    sx={{minWidth: 150}}
                    size="small"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={toSelection}
                    defaultValue={'8:00 AM'}
                    onChange={(e) => setToSelection(e.target.value as string)}
                >
                    {times.map((option, index) => (
                        <MenuItem value={option}>{option}</MenuItem>
                    ))}
                </Select>
            </div>
        </div>
    )
}

export default DailySchedule
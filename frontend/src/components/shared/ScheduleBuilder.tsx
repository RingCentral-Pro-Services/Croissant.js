import { Typography, RadioGroup, Radio, FormControlLabel, Dialog, Button, DialogActions } from "@mui/material";
import React, { useEffect, useState } from "react";
import useBuildSchedule from "../../hooks/useBuildSchedule";
import DailySchedule from "./DailySchedule";

const ScheduleBuilder = (props: {isOpen: boolean, setIsOpen: (open: boolean) => void, setPayload: (payload: any) => void}) => {
    const {isOpen, setPayload, setIsOpen} = props
    const [isSpecificSchedule, setIsSpecificSchedule] = useState(false)
    const [times, setTimes] = useState<string[]>([])
    const {setSundayTo, setSundayFrom, setMondayTo, setMondayFrom, setTuesdayTo, setTuesdayFrom, setWednesdayTo, setWednesdayFrom, setThursdayTo, setThursdayFrom, setFridayTo, setFridayFrom, setSaturdayTo, setSaturdayFrom, resetSchedule, set24Hours, payload} = useBuildSchedule()

    const handleSaveButtonClick = () => {
        if (Object.keys(payload).length > 0) {
            setPayload(payload)
        }
        setIsOpen(false)
    }

    const handleSelection = (selection: string) => {
        resetSchedule()
        if (selection === '24/7') {
            set24Hours()
            setIsSpecificSchedule(false)
        } else {
            setIsSpecificSchedule(true)
        }
    }

    useEffect(() => {
        let options: string[] = []
        
        options.push('12:00 AM')
        options.push('12:15 AM')
        options.push('12:30 AM')
        options.push('12:45 AM')

        for (let i = 1; i <= 11; i++) {
           options.push(`${i}:00 AM`)
           options.push(`${i}:15 AM`)
           options.push(`${i}:30 AM`)
           options.push(`${i}:45 AM`)
        }

        options.push('12:00 PM')
        options.push('12:15 PM')
        options.push('12:30 PM')
        options.push('12:45 PM')

        for (let i = 1; i <= 11; i++) {
           options.push(`${i}:00 PM`)
           options.push(`${i}:15 PM`)
           options.push(`${i}:30 PM`)
           options.push(`${i}:45 PM`)
        }

        setTimes(options)
        
    },[])

    return (
        <>
            <Dialog open={isOpen} maxWidth='xl' onClose={() => setIsOpen(false)}>
                <div className="schedule-builder">
                    <Typography>Work hours</Typography>
                    <RadioGroup onChange={(e) => handleSelection(e.target.value)}>
                        <FormControlLabel value="24/7" control={<Radio />} label="24/7" />
                        <FormControlLabel value="specific Hours" control={<Radio />} label="Specific Hours" />
                    </RadioGroup>
                    <div className={isSpecificSchedule ? 'mega-margin-top' : ''} hidden={!isSpecificSchedule}>
                        <DailySchedule label="Sunday" times={times} setTo={setSundayTo} setFrom={setSundayFrom} />
                        <DailySchedule label="Monday" times={times} setTo={setMondayTo} setFrom={setMondayFrom} />
                        <DailySchedule label="Tuesday" times={times} setTo={setTuesdayTo} setFrom={setTuesdayFrom} />
                        <DailySchedule label="Wednesday" times={times} setTo={setWednesdayTo} setFrom={setWednesdayFrom} />
                        <DailySchedule label="Thursday" times={times} setTo={setThursdayTo} setFrom={setThursdayFrom} />
                        <DailySchedule label="Friday" times={times} setTo={setFridayTo} setFrom={setFridayFrom} />
                        <DailySchedule label="Saturday" times={times} setTo={setSaturdayTo} setFrom={setSaturdayFrom} />
                    </div>
                </div>
                <DialogActions>
                <Button onClick={() => setIsOpen(false)} >Close</Button>
                <Button onClick={() => handleSaveButtonClick()}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ScheduleBuilder;
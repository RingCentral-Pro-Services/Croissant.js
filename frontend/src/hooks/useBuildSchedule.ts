import { useEffect, useState } from "react"
import { WeeklyRange } from "../models/WeeklyRange"

const useBuildSchedule = () => {
    const [sundayTo, setSundayTo] = useState('')
    const [sundayFrom, setSundayFrom] = useState('')
    const [mondayTo, setMondayTo] = useState('')
    const [mondayFrom, setMondayFrom] = useState('')
    const [tuesdayTo, setTuesdayTo] = useState('')
    const [tuesdayFrom, setTuesdayFrom] = useState('')
    const [wednesdayTo, setWednesdayTo] = useState('')
    const [wednesdayFrom, setWednesdayFrom] = useState('')
    const [thursdayTo, setThursdayTo] = useState('')
    const [thursdayFrom, setThursdayFrom] = useState('')
    const [fridayTo, setFridayTo] = useState('')
    const [fridayFrom, setFridayFrom] = useState('')
    const [saturdayTo, setSaturdayTo] = useState('')
    const [saturdayFrom, setSaturdayFrom] = useState('')
    const [schedule, setSchedule] = useState<WeeklyRange>({weeklyRanges: []})
    const [payload, setPayload] = useState({})

    useEffect(() => {
        if (!sundayTo || sundayTo === '') {
            return
        }
        if (hasSchedule('sunday')) {
            updateSchedule('sunday', sundayFrom, sundayTo)
        } else {
            addSchedule('sunday', sundayFrom, sundayTo)
        }
    }, [sundayTo])

    useEffect(() => {
        if (!sundayFrom || sundayFrom === '') {
            return
        }
        if (hasSchedule('sunday')) {
            updateSchedule('sunday', sundayFrom, sundayTo)
        } else {
            addSchedule('sunday', sundayFrom, sundayTo)
        }
    }, [sundayFrom])

    useEffect(() => {
        if (!mondayTo || mondayTo === '') {
            return
        }
        if (hasSchedule('monday')) {
            updateSchedule('monday', mondayFrom, mondayTo)
        } else {
            addSchedule('monday', mondayFrom, mondayTo)
        }
    }, [mondayTo])

    useEffect(() => {
        if (!mondayFrom || mondayFrom === '') {
            return
        }
        if (hasSchedule('monday')) {
            updateSchedule('monday', mondayFrom, mondayTo)
        } else {
            addSchedule('monday', mondayFrom, mondayTo)
        }
    }, [mondayFrom])

    useEffect(() => {
        if (!tuesdayTo || tuesdayTo === '') {
            return
        }
        if (hasSchedule('tuesday')) {
            updateSchedule('tuesday', tuesdayFrom, tuesdayTo)
        } else {
            addSchedule('tuesday', tuesdayFrom, tuesdayTo)
        }
    }, [tuesdayTo])

    useEffect(() => {
        if (!tuesdayFrom || tuesdayFrom === '') {
            return
        }
        if (hasSchedule('tuesday')) {
            updateSchedule('tuesday', tuesdayFrom, tuesdayTo)
        } else {
            addSchedule('tuesday', tuesdayFrom, tuesdayTo)
        }
    }, [tuesdayFrom])

    useEffect(() => {
        if (!wednesdayTo || wednesdayTo === '') {
            return
        }
        if (hasSchedule('wednesday')) {
            updateSchedule('wednesday', wednesdayFrom, wednesdayTo)
        } else {
            addSchedule('wednesday', wednesdayFrom, wednesdayTo)
        }
    }, [wednesdayTo])

    useEffect(() => {
        if (!wednesdayFrom || wednesdayFrom === '') {
            return
        }
        if (hasSchedule('wednesday')) {
            updateSchedule('wednesday', wednesdayFrom, wednesdayTo)
        } else {
            addSchedule('wednesday', wednesdayFrom, wednesdayTo)
        }
    }, [wednesdayFrom])

    useEffect(() => {
        if (!thursdayTo || thursdayTo === '') {
            return
        }
        if (hasSchedule('thursday')) {
            updateSchedule('thursday', thursdayFrom, thursdayTo)
        } else {
            addSchedule('thursday', thursdayFrom, thursdayTo)
        }
    }, [thursdayTo])

    useEffect(() => {
        if (!thursdayFrom || thursdayFrom === '') {
            return
        }
        if (hasSchedule('thursday')) {
            updateSchedule('thursday', thursdayFrom, thursdayTo)
        } else {
            addSchedule('thursday', thursdayFrom, thursdayTo)
        }
    }, [thursdayFrom])

    useEffect(() => {
        if (!fridayTo || fridayTo === '') {
            return
        }
        if (hasSchedule('friday')) {
            updateSchedule('friday', fridayFrom, fridayTo)
        } else {
            addSchedule('friday', fridayFrom, fridayTo)
        }
    }, [fridayTo])

    useEffect(() => {
        if (!fridayFrom || fridayFrom === '') {
            return
        }
        if (hasSchedule('friday')) {
            updateSchedule('friday', fridayFrom, fridayTo)
        } else {
            addSchedule('friday', fridayFrom, fridayTo)
        }
    }, [fridayFrom])

    useEffect(() => {
        if (!saturdayTo || saturdayTo === '') {
            return
        }
        if (hasSchedule('saturday')) {
            updateSchedule('saturday', saturdayFrom, saturdayTo)
        } else {
            addSchedule('saturday', saturdayFrom, saturdayTo)
        }
    }, [saturdayTo])

    useEffect(() => {
        if (!saturdayFrom || saturdayFrom === '') {
            return
        }
        if (hasSchedule('saturday')) {
            updateSchedule('saturday', saturdayFrom, saturdayTo)
        } else {
            addSchedule('saturday', saturdayFrom, saturdayTo)
        }
    }, [saturdayFrom])

    const addSchedule = (day: string, from: string, to: string) => {
        const newSchedule = schedule.weeklyRanges
        newSchedule.push({[day]: {from, to}})
        setSchedule({weeklyRanges: newSchedule})
    }

    const hasSchedule = (day: string) => {
        return schedule.weeklyRanges.some((range) => {
            return range.hasOwnProperty(day)
        })
    }

    const updateSchedule = (day: string, from: string, to: string) => {
        const newSchedule = schedule.weeklyRanges
        const index = newSchedule.findIndex((range) => {
            return range.hasOwnProperty(day)
        })
        newSchedule[index] = {[day]: {from, to}}
        setSchedule({weeklyRanges: newSchedule})
    }

    const resetSchedule = () => {
        setSchedule({weeklyRanges: []})
    }

    const set24Hours = () => {
        setSundayTo('00:00')
        setSundayFrom('00:00')
        setMondayTo('00:00')
        setMondayFrom('00:00')
        setTuesdayTo('00:00')
        setTuesdayFrom('00:00')
        setWednesdayTo('00:00')
        setWednesdayFrom('00:00')
        setThursdayTo('00:00')
        setThursdayFrom('00:00')
        setFridayTo('00:00')
        setFridayFrom('00:00')
        setSaturdayTo('00:00')
        setSaturdayFrom('00:00')
    }

    useEffect(() => {
        let newPayload = {
            ...(hasSchedule('sunday') && {sunday: [{from: sundayFrom, to: sundayTo}]}),
            ...(hasSchedule('monday') && {monday: [{from: mondayFrom, to: mondayTo}]}),
            ...(hasSchedule('tuesday') && {tuesday: [{from: tuesdayFrom, to: tuesdayTo}]}),
            ...(hasSchedule('wednesday') && {wednesday: [{from: wednesdayFrom, to: wednesdayTo}]}),
            ...(hasSchedule('thursday') && {thursday: [{from: thursdayFrom, to: thursdayTo}]}),
            ...(hasSchedule('friday') && {friday: [{from: fridayFrom, to: fridayTo}]}),
            ...(hasSchedule('saturday') && {saturday: [{from: saturdayFrom, to: saturdayTo}]})
        }

        console.log('New payload')
        console.log(newPayload)
        setPayload(newPayload)
    }, [schedule])

    return {setSundayTo, setSundayFrom, setMondayTo, setMondayFrom, setTuesdayTo, setTuesdayFrom, setWednesdayTo, setWednesdayFrom, setThursdayTo, setThursdayFrom, setFridayTo, setFridayFrom, setSaturdayTo, setSaturdayFrom, set24Hours, resetSchedule, payload}
}

export default useBuildSchedule
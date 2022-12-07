export interface WeeklyRangePart {
    [key: string]: {
        from: string
        to: string
    }
}


export interface WeeklyRange {
    weeklyRanges: WeeklyRangePart[]
}
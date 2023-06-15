export interface NotificationItem {
    title?: string
    body: string
    type?: 'info' | 'warning' | 'error' | 'success' | 'failure'
}
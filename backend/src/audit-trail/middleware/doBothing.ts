import { NextFunction, Request, Response } from "express";

export const doNothing = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send()
    return
}
import {ValidationChain} from "express-validator/src/chain";
import {ResultFactory} from "express-validator";
import {NextApiRequest, NextApiResponse} from "next";

export default function validateMiddleware(validations: ValidationChain[], validationResult: ResultFactory<any>) {
    return async (req: NextApiRequest, res: NextApiResponse, next: () => Promise<any>) => {
        await Promise.all(validations.map((validation) => validation.run(req)))

        const errors = validationResult(req)
        if (errors.isEmpty()) {
            return next()
        }

        res.status(422).json({errors: errors.array()})
    }
}
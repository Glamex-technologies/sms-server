require('dotenv').config();

module.exports = class ResponseHelper {
    success(msg, res, data) {
        return this.sendResponse(200, msg, res, data);
    };  

    created(msg, res, data) {
        return this.sendResponse(201, msg, res, data);
    };

    badRequest(msg, res, data) {
        return this.sendResponse(400, msg, res, data);
    };

    validationError(msg, res, data) {
        return this.sendResponse(422, msg, res, data);
    };
    
    unauthorized(msg, res, data) {
        return this.sendResponse(401, msg, res, data);
    };

    forbidden(msg, res, data) {
        return this.sendResponse(403, msg, res, data);
    };

    notFound(msg, res, data) {
        return this.sendResponse(404, msg, res, data);
    };

    exception(msg, res, data) {
        return this.sendResponse(500, msg, res, data);
    };

    conflict(msg, res, data) {
        return this.sendResponse(409, msg, res, data);
    };

    custom(code, msg, res, data) {
        return this.sendResponse(code, msg, res, data);
    }

    sendResponse(code, msg, res, data) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
        
        const success = code >= 200 && code < 300;
        
        const responseBody = {
            statusCode: code,
            message: msg,
            success: success
        };
        
        if (!success) {
            const errorCode = data && data.error_code;
            responseBody.error_code = errorCode || this.getErrorCode(code);
        }
        
        if (Array.isArray(data)) {
            responseBody.data = data;
        } else if (data !== undefined && data !== null) {
            const { error_code, ...dataWithoutErrorCode } = data;
            responseBody.data = dataWithoutErrorCode;
        } else {
            responseBody.data = null;
        }
        
        return res.status(code).send(responseBody);
    }

    getErrorCode(statusCode) {
        if (statusCode >= 200 && statusCode < 300) {
            return null;
        }
        
        const errorCodeMap = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'VALIDATION_ERROR',
            500: 'INTERNAL_SERVER_ERROR'
        };
        
        return errorCodeMap[statusCode] || 'UNKNOWN_ERROR';
    }
}


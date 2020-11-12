import axios from "axios";


// -----------------------------------------------------------------------------
// General
// -----------------------------------------------------------------------------
export const API_HEADER_DEFAULT = {
	Accept        : "application/json",
	"Content-Type": "application/json",
	Language      : "pt",
};


// -----------------------------------------------------------------------------
// Instance
// -----------------------------------------------------------------------------
export const api = axios.create({
	baseURL: '',//Ponha a bandida da url onde está rodando o servidor amigo,
	timeout: 3 * 60 * 1000, // 3 minutes, multiplications
	headers: API_HEADER_DEFAULT,
});

/**
 * Update acess token on default request
 *
 * @param access_token
 */
export const apiUpdateAccessToken = (access_token: any) => {
	access_token = access_token ? access_token : 'brelelele'

	// Set access_token to instance
	api.defaults.headers.common["Authorization"] = 'Bearer '+access_token;
};

export const apiDeleteAuthorization = () => {
	delete api.defaults.headers.common["Authorization"];
}

// -----------------------------------------------------------------------------
// Errors, Refresh token
// -----------------------------------------------------------------------------
api.interceptors.request.use((config) => {

	if( !config.headers.common["Authorization"] )
	{
		const access_token = 'brelelele'

		if( access_token )
		{
			config.headers["Authorization"] = 'Bearer '+access_token;

			// Update access_token on instance
			apiUpdateAccessToken(access_token);
		}
	}

	return config;
});

api.interceptors.response.use((response) => {
	return response;
}, (error) => {
	if( axios.isCancel(error) )
	{
		let errorReturn = {
			error        : error,
			error_type   : 'Erro de requisição, cancelada',
			error_message: "Requisição cancelada.",
			error_errors : {},
		};

		errorReturn.toString = () => errorReturn.error_message;

		return Promise.reject(errorReturn);
	}

	const originalRequest = error.config;
	// TODO - Verificar se essas urls estão corretas, de login e logout
	let is_logout_request = originalRequest && originalRequest.url.endsWith("auth/logout");
	let is_login_request  = originalRequest && originalRequest.url.endsWith("auth/login");

	// Has response from server
	if( error.response )
	{
		//Bad Request
		if( error.response.status === 400 ){

			let errorReturn = {
				error        : error,
				error_type   : 'BAD REQUEST',
				error_message: "Errors::Error_BadRequest",
				error_errors : error?.response?.data,
			};

			errorReturn.toString = () => errorReturn.error_message;

			return Promise.reject(errorReturn);
		}

		// Invalid Token
		if( error.response.status === 401 && !is_logout_request && !is_login_request )
		{

			silentLogout();

			let errorReturn = {
				error        : error,
				error_type   : 'Erro tipo, não tem token',
				error_message: "",
				error_errors : error?.response?.data,
			};

			errorReturn.toString = () => errorReturn.error_message;

			return Promise.reject(errorReturn);
		}

		//Forbidden
		if( error.response.status === 403 ){

			let errorReturn = {
				error        : error,
				error_type   : 'access_token',
				error_message: "Errors::Error_Forbidden",
				error_errors : error?.response?.data,
			};

			errorReturn.toString = () => errorReturn.error_message;

			return Promise.reject(errorReturn);
		}

		//Not found
		if( error.response.status === 404 ){

			let errorReturn = {
				error        : error,
				error_type   : 'type_error',
				error_message: "Errors::Error_NotFound",
				error_errors : error?.response?.data,
			};

			errorReturn.toString = () => errorReturn.error_message;

			return Promise.reject(errorReturn);
		}	
		
		//Method not allowed
		if( error.response.status === 405 ){

			let errorReturn = {
				error        : error,
				error_type   : 'type_validation',
				error_message: "Errors::Error_MethodNotAllowed",
				error_errors : error?.response?.data,
			};

			errorReturn.toString = () => errorReturn.error_message;

			return Promise.reject(errorReturn);
		}
		
		//Missing Parameters
		if( error.response.status === 422 ){

			let errorReturn = {
				error        : error,
				error_type   : 'type_api',
				error_message: "Errors::Error_MissingParameters",
				error_errors : error?.response?.data,
			};

			errorReturn.toString = () => errorReturn.error_message;

			return Promise.reject(errorReturn);
		}	
			
		//Internal Server Error
		if( error.response.status === 500 ){

			let errorReturn = {
				error        : error,
				error_type   : 'type_server',
				error_message: "Errors::Error_InternalServerError",
				error_errors : error?.response?.data,
			};

			errorReturn.toString = () => errorReturn.error_message;

			return Promise.reject(errorReturn);
		}		

		//Service Unavailable
		if( error.response.status === 503 ){

			let errorReturn = {
				error        : error,
				error_type   : 'type_server',
				error_message: "Errors::Error_ServiceUnavailable",
				error_errors : error?.response?.data,
			};

			errorReturn.toString = () => errorReturn.error_message;

			return Promise.reject(errorReturn);
		}				

	}
	function silentLogout() {
        apiDeleteAuthorization()
	}
	return 
});

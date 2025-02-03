import axios from 'axios';

// const apiURL = 'https://vibhu.techvedhas.com/node/';
const apiURL = window.location.origin.indexOf('localhost') > -1 ? 'https://vibhu.techvedhas.com/' : `${window.location.origin}/`;

const hostName = window.location.origin.indexOf('localhost') > -1 ? 'https://vibhu.techvedhas.com/' : window.location.host
const axiosApiInstance = axios.create({ baseURL: apiURL });

const isTokenExpired = (token) => {
    if (!token) {
        return true; 
    }
    
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        return true; 
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const expirationTime = payload.exp * 1000; 
    
    return expirationTime < Date.now();
};

const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
		console.log('Token expired, Please login again')
		setTimeout(()=>{
			console.log('Token expired')
        localStorage.clear();
        window.location.href = '/'; 
		}, 3000)
		
    }
};

// export const interceptor = () => {
// 	axiosApiInstance.interceptors.request.use(
// 		async (config) => {
// 			const token = localStorage.getItem('token');
// 			setInterval(checkTokenExpiration, 3000);
// 			if (token) {
// 				if (isTokenExpired(token)) {
//                     console.log('Token expired');
// 					localStorage.clear();
//                     window.location.href = '/'; 
//                     return Promise.reject('Token expired');
//                 } else {
//                     config.headers = {
//                         Authorization: `Bearer ${token}`,
//                         Accept: 'application/json',
//                         'hostname': hostName
//                     };
//                 }
// 			} else {
// 				config.headers = {
// 					Accept: 'application/json',
// 					'hostname': hostName
// 				};
// 			}
// 			return config;
// 		},
// 		(error) => {
// 			Promise.reject(error);
// 		}
// 	);
// };

export const interceptor = () => {
    const checkTokenAndProceed = async (config) => {
        checkTokenExpiration(); 
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'hostname': hostName
            };
        } else {
            config.headers = {
                Accept: 'application/json',
                'hostname': hostName
            };
        }
        return config;
    };
    
    axiosApiInstance.interceptors.request.use(
        async (config) => {
            return checkTokenAndProceed(config);
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // setInterval(checkTokenExpiration, 3000);
    setInterval(checkTokenExpiration, (60 * 60 * 1000 ) * 1.5);
};

const callAPI = {

	get: (url, data) => {

		return axiosApiInstance.get(url, { params: data })
			.then(response => response)
			.catch(error => { return callAPI.catchError(error) });


	},

	post: (url, data) => {

		return axiosApiInstance.post(url, data)
			.then(response => response)
			.catch(error => { return callAPI.catchError(error) });

	},

	del: (url, data) => {

		return axiosApiInstance.delete(url, { data: data })
			.then(response => response)
			.catch(error => { return callAPI.catchError(error) });

	},

	delWithParams: (url, data) => {

		return axiosApiInstance.delete(url, { params: data })
			.then(response => response)
			.catch(error => { return callAPI.catchError(error) });

	},

	patch: (url, data) => {

		return axiosApiInstance.patch(url, data)
			.then(response => response)
			.catch(error => { return callAPI.catchError(error) });

	},

	put: (url, data) => {

		return axiosApiInstance.put(url, data)
			.then(response => response)
			.catch(error => { return callAPI.catchError(error) });

	},


	catchError: (response) => {

		const res = {
			message: '',
			status: response.response ? response.response.status : null
		}

		if (response.response && response.response.data.message && response.response.data.message.length > 0) {
			res.message = response.response.data.message;
		}
		else {
			res.message = 'Something went wrong.';
		}

		return res;

	}

}

export default callAPI;
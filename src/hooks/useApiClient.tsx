import { useMemo } from 'react';
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

interface CustomRequestConfig extends InternalAxiosRequestConfig {
    errorMessage?: string;
}

const useApiClient = (): AxiosInstance => {
    const apiClient = useMemo(() => {
        const client = axios.create({
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Response interceptor
        client.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError) => {
                const config = error.config as CustomRequestConfig;

                if (error.response) {
                    const status = error.response.status;
                    if (status === 401) {
                        // router.replace('/login');
                    }
                } else {
                    console.log(config.errorMessage);
                }
                return Promise.reject(error);
            }
        );

        return client;
    }, []);

    return apiClient;
};

export default useApiClient;

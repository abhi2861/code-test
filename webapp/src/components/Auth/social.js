import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

const Social = () => {
    // const [storedToken, setStoredToken] = useState('');
    // const [storedUserDetails, setStoredUserDetails] = useState({});
    // const [isAuthenticated, setIsAuthenticated] = useState(false);
    // const [role, setRole] = useState('');
    const { search } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const urlSearchParams = new URLSearchParams(search);
        const Token = urlSearchParams.get("token");
        const userDetails = urlSearchParams.get("userDetails");
        const isAuthenticated = urlSearchParams.get("isAuthenticated");
        const role = urlSearchParams.get("role");

        // setStoredToken(Token)
        // setStoredUserDetails(userDetails)
        // setIsAuthenticated(isAuthenticated)
        // setRole(role)


        localStorage.setItem("token", Token);
        localStorage.setItem("userDetails", userDetails);
        localStorage.setItem("isAuthenticated", isAuthenticated);
        localStorage.setItem("role", role);
        // let userRole = storedUserDetails?.role?.name.toLowerCase();
        
        if (role === "admin") {
            navigate("/adminDashboard");
        } else {
            navigate("/dashboard");
        }

    }, [search]);
    



    // useEffect(() => {

    //     setTimeout(() => {

    //         const userDetailsString = JSON.stringify(storedUserDetails);
    //         localStorage.setItem("token", storedToken);
    //         localStorage.setItem("userDetails", userDetailsString);
    //         localStorage.setItem("isAuthenticated", isAuthenticated);
    //         localStorage.setItem("role", role);
    //         let userRole = storedUserDetails?.role?.name.toLowerCase();
            
    //         if (userRole === "admin") {
    //             navigate("/adminDashboard");
    //         } else {
    //             navigate("/dashboard");
    //         }
    //     }, 1000)
    // }, [storedUserDetails])


}
export default Social
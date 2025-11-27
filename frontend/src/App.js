import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login.js";
import SignUpPage from './SignUpPage.js';
import HomePage from "./Homepage/HomePage";
import PaymentPage from "./PaymentPage/PaymentPage.js";
import SellerSignUpPage from "./SellerSignUpPage.js";
import UserDashBoard from "./Dashboard/UserDashboard.jsx";
import Support from "./Support/Support.jsx";
import FlightDetails from "./FlightDetails/FlightDetails";
import SellerDashBoardPage from "./SellerPages/SellerDashBoard.jsx";
import SellerAddFlightPage from "./SellerPages/SellerAddFlightPage.jsx";
import SellerManageDelaysPage from "./SellerPages/SellerManageDelays.jsx";
import SellerProfilePage from "./SellerPages/SellerProfilePage.jsx"
import ConfirmationPage from "./Updates/ConfirmationPage";




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />   {/* Homepage first */}
        <Route path="/Login" element={<Login />} />
        <Route path="/SignUpPage" element={<SignUpPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/signup-seller" element={<SellerSignUpPage />} />
        <Route path="/UserDashBoard" element={<UserDashBoard />} />
        <Route path="/support" element={<Support />} /> 
        <Route path="/flight/:id" element={<FlightDetails />} />
        <Route path="/seller-dashboard" element={<SellerDashBoardPage />} />
        <Route path="/seller-add-flight" element={<SellerAddFlightPage />} />
        <Route path="/seller-manage-delays" element={<SellerManageDelaysPage />} />
        <Route path="/seller-profile" element={<SellerProfilePage />} />
  <Route path="/updates" element={<ConfirmationPage />} />
      </Routes>
    </Router>
  );
}

export default App;





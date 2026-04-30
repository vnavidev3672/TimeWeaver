import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PageNotFound from "./pages/PageNotFound";
import Login from "./pages/Auth/Login";
import Registration from "./pages/Auth/Registration";
import ForgotPassword from "./pages/Auth/ForgotPassword";

import UnitTestProject from "./pages/unitTest/NewProject";
import UnitTestView from "./pages/unitTest/View";
import UnitTestUpdateProject from "./pages/unitTest/UpdateProjectInfo";

import InternalEXternalProject from "./pages/internalExternal/NewProject";
import InternalEXternalView from "./pages/internalExternal/View";
import InternalEXternalUpdateProject from "./pages/internalExternal/UpdateProjectInfo";

import AcademicProject from "./pages/academic/NewProject";
import AcademicView from "./pages/academic/View";
import AcademicUpdateProject from "./pages/academic/UpdateProjectInfo";
import Users from "./pages/admin/Users";

import Profile from "./pages/user/Profile";
import EditProfile from "./pages/user/EditProfile";
import AllProjects from "./pages/AllProjects";

const App = () => {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/all-projects" element={<AllProjects />} />

			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Registration />} />
			<Route path="/forgot-password" element={<ForgotPassword />} />

			<Route path="/view-users" element={<Users />} /> 
			<Route path="/profile/:id" element={<Profile />} />
			<Route path="/profile/edit/:id" element={<EditProfile />} />

			<Route path="/project/unit-test/create" element={<UnitTestProject />} />
			<Route path="/project/unit-test/view/:id" element={<UnitTestView />} />
			<Route path="/project/unit-test/update/:id" element={<UnitTestUpdateProject />} />

			<Route path="/project/internal-external/create" element={<InternalEXternalProject />} />
			<Route path="/project/internal-external/view/:id" element={<InternalEXternalView />} />
			<Route path="/project/internal-external/update/:id" element={<InternalEXternalUpdateProject />} />

			<Route path="/project/academic/create" element={<AcademicProject />} />
			<Route path="/project/academic/view/:id" element={<AcademicView />} />
			<Route path="/project/academic/update/:id" element={<AcademicUpdateProject />} />

			<Route path="*" element={<PageNotFound />} />
		</Routes>
	);
}

export default App;
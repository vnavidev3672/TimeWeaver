import React, { Component, StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './context/auth';


let root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<>
		<AuthProvider>
			<BrowserRouter>
				<StrictMode>
					<App />
				</StrictMode>
			</BrowserRouter>
		</AuthProvider>
	</>
)
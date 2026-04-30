import React, { useState, useEffect } from "react";
import config from "../../config";
import axios from "axios";
import Layout from "../../Component/Layout/Layout";
import { FaSearch, FaTimes, FaTrash, FaUserShield } from "react-icons/fa";
import { useAuth } from '../../context/auth';
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Users = () => {
    const [auth] = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const roleMap = { 0: "Viewer", 1: "Admin" };

    const getAllUsers = async () => {
        try {
            const { data } = await axios.get(`${config.API_BASE_URL}/auth/view-users`);
            setUsers(data.users || []);
            setFilteredUsers(data.users || []);
        } catch (err) {
            toast.error("Failed to fetch users");
        }
    };

    useEffect(() => {
        if (!auth?.user || auth.user.role !== 1) {
            navigate("/login");
        } else {
            getAllUsers();
        }
    }, [auth, navigate]);

    const handleSearch = (e) => {
        const keyword = e.target.value.toLowerCase();
        setSearch(keyword);

        if (!keyword) {
            setFilteredUsers(users);
            return;
        }

        const results = users.filter(
            (user) =>
                user.name?.toLowerCase().includes(keyword) ||
                user.email?.toLowerCase().includes(keyword)
        );

        setFilteredUsers(results);
    };

    const handleReset = () => {
        setSearch("");
        setFilteredUsers(users);
    };

    const handleDelete = (id, name) => {

        toast((t) => (
            <div>
                <p className="mb-2">
                    Are you sure you want to delete <b>{name}</b>?
                </p>

                <div className="d-flex justify-content-end gap-2">
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn btn-sm btn-danger"
                        onClick={async () => {
                            toast.dismiss(t.id);

                            const toastId = toast.loading("Deleting user...");

                            try {
                                const res = await axios.delete(
                                    `${config.API_BASE_URL}/auth/delete/${id}`
                                );

                                if (res.data.success) {
                                    toast.success(
                                        `${name} deleted successfully 🗑️`,
                                        { id: toastId }
                                    );
                                    getAllUsers();
                                } else {
                                    toast.error("Delete failed", { id: toastId });
                                }
                            } catch (err) {
                                toast.error("Something went wrong ❌", { id: toastId });
                            }
                        }}
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        ));
    };


    const handleRoleChange = (user) => {
        const newRole = user.role === 1 ? 0 : 1;

        toast((t) => (
            <div>
                <p className="mb-2">
                    Change role of <b>{user.name}</b> to{" "}
                    <b>{roleMap[newRole]}</b>?
                </p>

                <div className="d-flex justify-content-end gap-2">
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn btn-sm btn-success"
                        onClick={async () => {
                            toast.dismiss(t.id);

                            const toastId = toast.loading("Updating role...");

                            try {
                                const res = await axios.put(
                                    `${config.API_BASE_URL}/auth/assign-role/${user._id}`,
                                    { role: newRole }
                                );

                                if (res.data.success) {
                                    toast.success(
                                        `${user.name}'s role updated successfully`,
                                        { id: toastId }
                                    );
                                    getAllUsers();
                                } else {
                                    toast.error("Role update failed", { id: toastId });
                                }
                            } catch (err) {
                                toast.error("Something went wrong ❌", { id: toastId });
                            }
                        }}
                    >
                        Yes
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <Layout title="Admin Dashboard - Users">
            <div className="container ">

                <div className="row align-items-center mb-3">
                    <div className="col-3 col-md-1">
                        <h2 className=" text-success fw-bold">
                            Users
                        </h2>
                    </div>

                    <div className="col-9 col-md-3">
                        <div className="position-relative">
                            <input
                                type="text"
                                className="form-control shadow-sm"
                                placeholder="Search Name or Email..."
                                value={search}
                                onChange={handleSearch}
                            />
                            {search ? (
                                <button
                                    className="btn btn-sm btn-light position-absolute top-50 end-0 translate-middle-y me-2"
                                    onClick={handleReset}
                                >
                                    <FaTimes />
                                </button>
                            ) : (
                                <span className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted">
                                    <FaSearch />
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-success text-center">
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, index) => (
                                        <tr key={user._id} className="text-center">
                                            <td>{index + 1}</td>
                                            <td className="fw-semibold">{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span
                                                    className={`badge px-3 py-2 ${user.role === 1
                                                        ? "bg-primary"
                                                        : "bg-secondary"
                                                        }`}
                                                >
                                                    {roleMap[user.role]}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-warning me-2"
                                                    disabled={user._id === auth.user._id}
                                                    onClick={() => handleRoleChange(user)}
                                                >
                                                    <FaUserShield /> Change Role
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    disabled={user._id === auth.user._id}
                                                    onClick={() => handleDelete(user._id)}
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">
                                            No Users Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default Users;
